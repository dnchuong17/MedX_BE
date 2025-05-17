import { Injectable, UnauthorizedException } from '@nestjs/common';
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
    if (!user) return null;

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
      username: loginDto.email,
      sub: {
        name: user.name,
      },
    };

    return this.jwtService.sign(payload);
  }
}
