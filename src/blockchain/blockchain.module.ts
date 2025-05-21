import { Module } from '@nestjs/common';
import { BlockchainService } from './service/blockchain.service';
import { BlockchainController } from './controller/blockchain.controller';

@Module({
  controllers: [BlockchainController],
  providers: [BlockchainService],
  exports: [BlockchainService],
})
export class BlockchainModule {}
