import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChallengeEntity } from './entity/challenge.entity';
import { ChallengesService } from './service/challenges.service';
import { GoogleVisionService } from './service/google-vision.service';
import { ChallengesController } from './controller/challenge.controller';
import { RewardService } from '../reward/reward.service';
import { TokenModule } from '../token/token.module';
import { RewardModule } from '../reward/reward.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChallengeEntity]),
    TokenModule,
    forwardRef(() => RewardModule),
  ],
  providers: [ChallengesService, GoogleVisionService],
  controllers: [ChallengesController],
  exports: [ChallengesService],
})
export class ChallengesModule {}
