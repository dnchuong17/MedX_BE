import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entity/user.entity';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { UserService } from '../user/service/user.service';
import { MailModule } from '../mail/mail.module';
import { MailService } from '../mail/service/mail.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [UserModule, MailModule, TypeOrmModule.forFeature([UserEntity])],
  controllers: [AuthController],
  providers: [AuthService, UserService, MailService, JwtService],
  exports: [AuthService],
})
export class AuthModule {}
