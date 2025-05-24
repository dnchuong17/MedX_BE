import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChallengeEntity } from '../entity/challenge.entity';
import { ChallengeDto } from '../dto/challenge.dto';
import { GoogleVisionService } from './google-vision.service';

@Injectable()
export class ChallengesService {
  @InjectRepository(ChallengeEntity)
  private readonly challengeRepository: Repository<ChallengeEntity>;
  constructor(private readonly googleVisionService: GoogleVisionService) {}

  async create(createChallengeDto: ChallengeDto) {
    const newChallenge = this.challengeRepository.create(createChallengeDto);
    return await this.challengeRepository.save(newChallenge);
  }

  async findAll(): Promise<ChallengeEntity[]> {
    return await this.challengeRepository.find();
  }

  async findOne(id: number): Promise<ChallengeEntity> {
    const challenge = await this.challengeRepository.findOne({ where: { id } });
    if (!challenge) throw new NotFoundException('Challenge not found');
    return challenge;
  }

  async update(id: number, updateChallengeDto: ChallengeDto) {
    const challenge = await this.findOne(id);
    Object.assign(challenge, updateChallengeDto);
    return await this.challengeRepository.save(challenge);
  }

  async remove(id: number) {
    const challenge = await this.findOne(id);
    await this.challengeRepository.remove(challenge);
  }

  async checkChallengeImage(challengeId: number, imageBuffer: Buffer) {
    const challenge = await this.findOne(challengeId);
    const labels = await this.googleVisionService.labelDetection(imageBuffer);

    const keywords = challenge.conditionKeywords?.map((k) =>
      k.toLowerCase(),
    ) || [challenge.conditionKey.toLowerCase()];

    for (const label of labels) {
      const desc = label.description;
      if (
        desc &&
        label.score !== undefined &&
        label.score !== null &&
        label.score > 0.8 &&
        keywords.some((keyword) => desc.toLowerCase().includes(keyword))
      ) {
        return true;
      }
    }
    return false;
  }
}
