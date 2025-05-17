import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entity/user.entity';

@Injectable()
export class UserService {
  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;

  async findUserByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email },
    });
  }
}
