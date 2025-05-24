import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { UserService } from './service/user.service';
import { UserController } from './controller/user.controller';
import { UserChallengeEntity } from './entity/user-challenge.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserChallengeEntity])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
