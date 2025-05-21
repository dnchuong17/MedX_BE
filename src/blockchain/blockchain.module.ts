import { Module } from '@nestjs/common';
import { BlockchainService } from './service/blockchain.service';
import { BlockchainController } from './controller/blockchain.controller';

@Module({
  controllers: [BlockchainController],
  providers: [BlockchainService],
})
export class BlockchainModule {}
