import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as w3up from '@web3-storage/w3up-client';
import { UploadFileDto } from '../dto/upload-file.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecordEntity } from '../entity/record.entity';
import { UserService } from '../../user/service/user.service';
import { RuntimeException } from '@nestjs/core/errors/exceptions';
import { createHash } from 'crypto';
import { PublicKey } from '@solana/web3.js';
import { BlockchainService } from '../../../blockchain/service/blockchain.service';
import { SyncService } from '../../sync/service/sync.service';

@Injectable()
export class RecordService {
  constructor(
    @InjectRepository(RecordEntity)
    private readonly recordRepository: Repository<RecordEntity>,
    private readonly userService: UserService,
    private readonly blockchainService: BlockchainService,
    private readonly syncService: SyncService,
  ) {}
  async uploadFile(
    file: Express.Multer.File,
    uploadFileDto: UploadFileDto,
    versionOf?: string,
  ) {
    try {
      const existedUser = await this.userService.findUserById(
        uploadFileDto.userId,
      );

      if (!existedUser) {
        throw new RuntimeException('User not found');
      }
      await this.userService.updateUserEncryptionKey(
        existedUser.id,
        uploadFileDto.encryption_key,
      );

      const cid = await this.uploadIPFS(file.buffer);
      const url = `${process.env.IPFS_PREFIX}${cid.toString()}`;

      const newRecord = this.recordRepository.create({
        user: existedUser,
        url: url,
        encryptedData: file.buffer,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        date: uploadFileDto.date,
        doctor: uploadFileDto.doctor,
        category: uploadFileDto.category,
        facility: uploadFileDto.facility,
        versionOf: versionOf,
        notes: uploadFileDto.notes ?? undefined,
      });

      await this.recordRepository.save(newRecord);
      const recordId = newRecord.id;
      const metadataHash = createHash('sha256')
        .update(Buffer.from(file.buffer))
        .digest('hex');

      const userPublicKey = new PublicKey(uploadFileDto.publicKey);

      const tx = await this.blockchainService.uploadRecord(
        recordId,
        metadataHash,
        userPublicKey,
      );

      // Return
      return {
        url: url,
        recordId: newRecord.id,
        doctor: uploadFileDto.doctor,
        date: uploadFileDto.date,
        category: uploadFileDto.category,
        facility: uploadFileDto.facility,
        notes: uploadFileDto.notes,
        transaction: tx,
      };
    } catch (error) {
      console.error('[Upload Error]', error);
      throw new InternalServerErrorException(
        'Upload failed. Check server logs.',
      );
    }
  }

  async updateRecord(
    recordId: string,
    file: Express.Multer.File,
    uploadFileDto: UploadFileDto,
  ) {
    const existedUser = await this.userService.findUserById(
      uploadFileDto.userId,
    );

    if (!existedUser) {
      throw new RuntimeException('User not found');
    }

    const existedRecord = await this.recordRepository.findOne({
      where: { id: recordId },
    });

    if (!existedRecord) {
      throw new NotFoundException(`Record with id ${recordId} not found`);
    }

    return this.uploadFile(file, uploadFileDto, recordId);
  }

  async uploadSync() {
    const records = await this.syncService.fetchAllPatients();
    console.log(records);
    for (const record of records) {
      console.log(record);
      console.log('Processing record for student:', record.student_id);
    }
  }

  async confirmTransaction(recordId: string, txid: string) {
    const record = await this.recordRepository.findOne({
      where: { id: recordId },
    });

    if (!record) {
      throw new NotFoundException(`Record with id ${recordId} not found`);
    }

    record.blockchainTx = txid;
    await this.recordRepository.save(record);
    return {
      message: 'Confirm transaction successfully!',
    };
  }

  async findAllByUserId(userId: number) {
    // Find user
    const existedUser = await this.userService.findUserById(userId);
    if (!existedUser) {
      throw new RuntimeException('User not found');
    }

    return await this.recordRepository
      .createQueryBuilder('record')
      .leftJoin('record.user', 'user')
      .where('user.id = :userId', { userId })
      .select([
        'record.url',
        'record.doctor',
        'record.date',
        'record.facility',
        'record.category',
        'record.versionOf',
        'record.notes',
      ])
      .orderBy('record.date', 'DESC')
      .getMany();
  }

  async uploadIPFS(buffer: Buffer): Promise<string> {
    try {
      const client = await w3up.create();
      const email = process.env.EMAIL;
      const spaceDid = process.env.SPACE_DID;

      if (!email || !spaceDid) {
        throw new InternalServerErrorException(
          'Missing EMAIL or SPACE_DID environment variables.',
        );
      }

      await client.login(email as `${string}@${string}`);
      await client.setCurrentSpace(spaceDid as `did:${string}:${string}`);

      const encryptedBlob = new Blob([buffer], {
        type: 'application/octet-stream',
      });

      const cid = await client.uploadFile(encryptedBlob);
      return cid.toString();
    } catch (err) {
      console.error('[IPFS Upload Error]', err);
      throw new InternalServerErrorException('Upload to IPFS failed.');
    }
  }
}
