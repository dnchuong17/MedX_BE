import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as w3up from '@web3-storage/w3up-client';
import { UploadFileDto } from '../dto/upload-file.dto';
import bs58 from 'bs58';
import sodium from 'libsodium-wrappers';

@Injectable()
export class RecordService {
  async uploadFile(file: Express.Multer.File, uploadFileDto: UploadFileDto) {
    try {
      await sodium.ready;

      const publicKey = bs58.decode(uploadFileDto.publicKey);

      // Encryption
      const encrypted = sodium.crypto_box_seal(file.buffer, publicKey);

      // Upload to IPFS and return URL
      const client = await w3up.create();

      const email = process.env.EMAIL;
      const spaceDid = process.env.SPACE_DID;

      await client.login(email as `${string}@${string}`);
      await client.setCurrentSpace(spaceDid as `did:${string}:${string}`);

      const blob = new Blob([encrypted], { type: 'application/octet-stream' });
      const cid = await client.uploadFile(blob);

      return {
        ipfsUrl: `https://dweb.link/ipfs/${cid.toString()}`,
        cid: cid.toString(),
      };
    } catch (error) {
      console.error('[Upload Error]', error);
      throw new InternalServerErrorException(
        'Upload failed. Check server logs.',
      );
    }
  }
}
