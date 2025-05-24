import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChallengeDto } from '../dto/challenge.dto';
import { ChallengesService } from '../service/challenges.service';
import { RewardService } from '../../reward/reward.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('challenges')
export class ChallengesController {
  constructor(
    private readonly challengesService: ChallengesService,
    private readonly rewardService: RewardService,
  ) {}

  @Post()
  async create(@Body() createChallengeDto: ChallengeDto) {
    return await this.challengesService.create(createChallengeDto);
  }

  @Get()
  async findAll() {
    return await this.challengesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.challengesService.findOne(+id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateChallengeDto: ChallengeDto,
  ) {
    return await this.challengesService.update(+id, updateChallengeDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.challengesService.remove(+id);
    return { message: 'Challenge deleted successfully' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/check-image')
  @UseInterceptors(FileInterceptor('file'))
  async completeWithImage(
    @Param('id') challengeId: number,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) throw new BadRequestException('Image file is required');

    const userId = req.user.id as number;
    console.log(userId);
    console.log(req.user);

    const passed = await this.challengesService.checkChallengeImage(
      challengeId,
      file.buffer,
    );
    if (!passed) {
      return { success: false, message: 'Challenge not completed' };
    }

    const txSignature = await this.rewardService.rewardUser(
      userId,
      challengeId,
    );

    return {
      success: true,
      message: 'Challenge completed and rewarded',
      txSignature,
    };
  }
}
