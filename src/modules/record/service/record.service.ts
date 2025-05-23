import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as w3up from '@web3-storage/w3up-client';
import { UploadFileDto } from '../dto/upload-file.dto';
import bs58 from 'bs58';
import sodium from 'libsodium-wrappers';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecordEntity } from '../entity/record.entity';
import { UserService } from '../../user/service/user.service';
import { RuntimeException } from '@nestjs/core/errors/exceptions';
import { createHash } from 'crypto';
import { PublicKey } from '@solana/web3.js';
import { BlockchainService } from '../../../blockchain/service/blockchain.service';

@Injectable()
export class RecordService {
  constructor(
    @InjectRepository(RecordEntity)
    private readonly recordRepository: Repository<RecordEntity>,
    private readonly userService: UserService,
    private readonly blockchainService: BlockchainService,
  ) {}
  async uploadFile(file: Express.Multer.File, uploadFileDto: UploadFileDto) {
    try {
      // Find user
      const existedUser = await this.userService.findUserById(
        uploadFileDto.userId,
      );

      if (!existedUser) {
        throw new RuntimeException('User not found');
      }

      await sodium.ready;
      // Encrypt file by the public key
      const publicKey = bs58.decode(uploadFileDto.publicKey);
      const encrypted = sodium.crypto_box_seal(file.buffer, publicKey);
      // Upload file to IPFS
      const client = await w3up.create();
      const email = process.env.EMAIL;
      const spaceDid = process.env.SPACE_DID;

      await client.login(email as `${string}@${string}`);
      await client.setCurrentSpace(spaceDid as `did:${string}:${string}`);

      const encryptedBlob = new Blob([encrypted], {
        type: 'application/octet-stream',
      });
      const cid = await client.uploadFile(encryptedBlob);
      const url = `${process.env.IPFS_PREFIX}${cid.toString()}`;

      const newRecord = this.recordRepository.create({
        user: existedUser,
        url: url,
        encryptedData: encrypted,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        doctor: uploadFileDto.doctor,
        category: uploadFileDto.category,
        facility: uploadFileDto.facility,
        notes: uploadFileDto.notes ?? undefined,
      });

      await this.recordRepository.save(newRecord);
      const recordId = newRecord.id;
      const metadataHash = createHash('sha256')
        .update(Buffer.from(encrypted))
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
        'record.notes',
      ])
      .getMany();
  }
}
