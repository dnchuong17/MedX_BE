import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './config/data-source-option';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import * as dotenv from 'dotenv';
import { RecordModule } from './modules/record/record.module';
import { SyncModule } from './modules/sync/sync.module';

dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    UserModule,
    AuthModule,
    BlockchainModule,
    RecordModule,
    SyncModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
