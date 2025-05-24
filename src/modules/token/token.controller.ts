import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { TokenService } from './token.service';

@Controller('tokens')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post('send')
  async sendToken(
    @Body()
    {
      userWalletAddress,
      amount,
    }: {
      userWalletAddress: string;
      amount: number;
    },
  ) {
    if (!userWalletAddress || !amount) {
      throw new BadRequestException('Missing parameters');
    }

    const signature = await this.tokenService.sendTokenToUser(
      userWalletAddress,
      amount,
    );
    return { success: true, signature };
  }
}
