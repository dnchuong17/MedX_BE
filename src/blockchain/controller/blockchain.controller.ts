import { BlockchainService } from '../service/blockchain.service';
import { Controller, Post, Body } from '@nestjs/common';
import { PublicKey } from '@solana/web3.js';

@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}
  @Post('grant-access')
  async grantAccess(
    @Body() body: { record: string; viewer: string; owner: string },
  ) {
    const recordPublicKey = new PublicKey(body.record);
    const viewerPublicKey = new PublicKey(body.viewer);
    const ownerPublicKey = new PublicKey(body.owner);
    const tx = await this.blockchainService.grantAccess(
      recordPublicKey,
      viewerPublicKey,
      ownerPublicKey,
    );
    return { transaction: tx };
  }

  @Post('revoke-access')
  async revokeAccess(
    @Body() body: { record: string; viewer: string; owner: string },
  ) {
    const record = new PublicKey(body.record);
    const viewer = new PublicKey(body.viewer);
    const owner = new PublicKey(body.owner);

    const base64Tx = await this.blockchainService.revokeAccess(
      record,
      viewer,
      owner,
    );

    return { transaction: base64Tx };
  }

  @Post('upload-record')
  async uploadRecord(
    @Body() body: { recordId: string; metadataHash: string; user: string },
  ) {
    const tx = await this.blockchainService.uploadRecord(
      body.recordId,
      body.metadataHash,
      new PublicKey(body.user),
    );
    return { transaction: tx };
  }
}
