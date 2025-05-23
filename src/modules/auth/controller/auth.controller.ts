import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { UserDto } from '../../user/dto/user.dto';
import { LoginDto } from '../../user/dto/login.dto';
import { VerifyDto } from '../dto/verify.dto';
import { LoginWalletDto } from '../../user/dto/login-wallet.dto';
import { LoginPhoneDto } from '../../user/dto/login-phone.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() userDto: UserDto) {
    try {
      return this.authService.register(userDto);
    } catch (error) {
      throw new Error(error);
    }
  }

  @Post('email-verify')
  async verify(@Body() verifyDto: VerifyDto) {
    try {
      return this.authService.verifyOtp(verifyDto);
    } catch (error) {
      throw new Error(error);
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      return this.authService.login(loginDto);
    } catch (error) {
      throw new UnauthorizedException('Unauthorized');
    }
  }

  @Post('login-wallet')
  async loginWithWallet(@Body() dto: LoginWalletDto) {
    return this.authService.loginWithWallet(dto);
  }

  @Post('login-phone')
  async loginByPhone(@Body() loginPhoneDto: LoginPhoneDto) {
    return this.authService.loginWithPhone(loginPhoneDto);
  }

  @Post('phone')
  async registerByPhone(@Body() userDto: UserDto) {
    return this.authService.registerByPhone(userDto);
  }

  @Post('set-email')
  async setEmail(@Body() body: { phone: string; email: string }) {
    return this.authService.setEmailAndSendOtp(body.phone, body.email);
  }
}
