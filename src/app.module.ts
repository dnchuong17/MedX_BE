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
import process from 'node:process';
import { MessageBrokerModule } from 'common_be';
import { ChallengesModule } from './modules/challenges/challenges.module';
import { RewardModule } from './modules/reward/reward.module';
import { TokenModule } from './modules/token/token.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { HealthNewsModule } from './modules/news/news.module';

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
    ChallengesModule,
    RewardModule,
    TokenModule,
    CloudinaryModule,
    HealthNewsModule,
    MessageBrokerModule.register({
      redisOptions: {
        host: process.env.REDIS_HOST ?? '',
        port: Number(process.env.REDIS_PORT),
        accessKey: process.env.REDIS_PASSWORD ?? '',
      },
      queueName: process.env.QUEUE_LOCAL_NAME ?? '',
      defaultTimeout: 30000,
      isPublic: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
