import { Module } from '@nestjs/common';
import { RecordService } from './service/record.service';
import { RecordController } from './controller/record.controller';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecordEntity } from './entity/record.entity';
import { BlockchainModule } from '../../blockchain/blockchain.module';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([RecordEntity]),
    BlockchainModule,
  ],
  controllers: [RecordController],
  providers: [RecordService],
})
export class RecordModule {}
