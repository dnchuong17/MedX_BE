import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/entity/user.entity';
import { UserChallengeEntity } from '../user/entity/user-challenge.entity';
import { TokenService } from '../token/token.service';
import { ChallengesService } from '../challenges/service/challenges.service';

@Injectable()
export class RewardService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(UserChallengeEntity)
    private readonly userChallengeRepository: Repository<UserChallengeEntity>,

    private readonly tokenService: TokenService,

    @Inject(forwardRef(() => ChallengesService))
    private readonly challengesService: ChallengesService,
  ) {}

  async rewardUser(userId: number, challengeId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.wallet_address) throw new Error('User wallet not found');

    const challenge = await this.challengesService.findOne(challengeId);
    const rewardAmount = challenge.rewardAmount;

    const signature = await this.tokenService.sendTokenToUser(
      user.wallet_address,
      rewardAmount,
    );

    await this.userChallengeRepository.save({
      user: { id: userId },
      challenge: { id: challengeId },
      completedAt: new Date(),
      rewarded: true,
      txSignature: signature,
    });

    return signature;
  }
}
