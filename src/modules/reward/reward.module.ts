import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserChallengeEntity } from '../user/entity/user-challenge.entity';
import { UserEntity } from '../user/entity/user.entity';
import { TokenModule } from '../token/token.module';
import { RewardService } from './reward.service';
import { ChallengesModule } from '../challenges/challenges.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserChallengeEntity]),
    TokenModule,
    forwardRef(() => ChallengesModule),
  ],
  controllers: [],
  providers: [RewardService],
  exports: [RewardService],
})
export class RewardModule {}
