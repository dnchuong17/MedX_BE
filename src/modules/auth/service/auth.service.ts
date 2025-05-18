import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserDto } from '../../user/dto/user.dto';
import { UserService } from '../../user/service/user.service';
import { MailService } from '../../mail/service/mail.service';
import { generateOtp } from '../../../helper/6-random-number';
import { LoginDto } from '../../user/dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../user/entity/user.entity';
import { Repository } from 'typeorm';
import { VerifyDto } from '../dto/verify.dto';
import { verifySolanaSignature } from '../../../utils/verify-solana-signature';
import { LoginWalletDto } from '../../user/dto/login-wallet.dto';
import { LoginPhoneDto } from '../../user/dto/login-phone.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  async register(userDto: UserDto) {
    const existedUser = await this.userService.findUserByEmail(userDto.email);

    const otp = generateOtp();

    if (existedUser) {
      if (existedUser.isVerified) {
        throw new Error('Email is already registered');
      } else {
        existedUser.otp = otp;
        await this.userRepository.save(existedUser);
        await this.mailService.sendOtp(userDto.email, otp);
        return { message: 'Resent OTP' };
      }
    }

    const hashPassword = await bcrypt.hash(userDto.password, 10);

    const newUser = this.userRepository.create({
      name: userDto.name,
      email: userDto.email,
      password: hashPassword,
      isVerified: false,
      otp: otp,
    });

    await this.userRepository.save(newUser);
    await this.mailService.sendOtp(userDto.email, otp);

    return 'Please Check Mail to get the OTP code';
  }

  async verifyOtp(verifyDto: VerifyDto) {
    const user = await this.userService.findUserByEmail(verifyDto.email);

    if (!user) return false;

    if (user.isVerified) return true;

    console.log('OTP from DB:', user.otp, 'Type:', typeof user.otp);
    console.log('OTP from user:', verifyDto.otp, 'Type:', typeof user.otp);

    if (!user.otp) {
      return false;
    }

    user.isVerified = true;
    user.otp = '';
    await this.userRepository.save(user);

    return true;
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findUserByEmail(email);
    if (!user || !user.password) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    if (!user.isVerified) {
      throw new UnauthorizedException(
        'Email address has not been verified yet.',
      );
    }

    const { password: _, ...result } = user;

    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    const payload = {
      sub: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };

    return this.jwtService.sign(payload);
  }

  async loginWithWallet(loginWalletDto: LoginWalletDto) {
    const { wallet_address, message, signature } = loginWalletDto;

    const isValid = verifySolanaSignature(wallet_address, message, signature);
    if (!isValid) {
      throw new UnauthorizedException('Invalid signature');
    }

    let user = await this.userRepository.findOne({
      where: { wallet_address },
    });

    if (!user) {
      user = this.userRepository.create({
        wallet_address,
        name: 'Unnamed User',
        isVerified: true,
      });

      await this.userRepository.save(user);
    }

    const payload = {
      sub: {
        wallet: user.wallet_address,
      },
    };

    return this.jwtService.sign(payload);
  }

  async loginWithPhone(loginDto: LoginPhoneDto) {
    const user = await this.userService.findUserByPhone(loginDto.phone);

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid phone or password');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid phone or password');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Phone number has not been verified');
    }

    const payload = {
      sub: {
        id: user.id,
        name: user.name,
        phone: user.phone,
      },
    };

    return this.jwtService.sign(payload);
  }

  async registerByPhone(userDto: UserDto) {
    const { phone, password, name } = userDto;

    if (!phone || !password || !name) {
      throw new BadRequestException('Phone, name, and password are required');
    }

    const existing = await this.userService.findUserByPhone(phone);
    if (existing) {
      if (existing.isVerified) {
        throw new BadRequestException('Phone number is already registered');
      }
      return { message: 'Please complete verification' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.userRepository.create({
      phone,
      name,
      password: hashedPassword,
      isVerified: false,
      otp: '',
    });

    await this.userRepository.save(newUser);
    return { message: 'Phone registered. Please set email to receive OTP.' };
  }

  async setEmailAndSendOtp(phone: string, email: string) {
    if (!phone || !email) {
      throw new BadRequestException('Phone and email are required');
    }

    const user = await this.userService.findUserByPhone(phone);
    if (!user) throw new BadRequestException('User not found');

    if (user.isVerified) {
      throw new BadRequestException('User is already verified');
    }

    const otp = generateOtp();
    user.email = email;
    user.otp = otp;

    await this.userRepository.save(user);
    await this.mailService.sendOtp(email, otp);

    return { message: 'OTP sent to email' };
  }
}
