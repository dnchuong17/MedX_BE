import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entity/user.entity';
import { UserDto } from '../dto/user.dto';

@Injectable()
export class UserService {
  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;

  async findUserById(id: number) {
    return await this.userRepository.findOne({
      where: { id: id },
    });
  }

  async findUserByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  async findUserByPhone(phone: string) {
    return await this.userRepository.findOne({
      where: { phone },
    });
  }

  async updateUser(id: number, userDto: UserDto) {
    const userExisted = await this.userRepository.findOne({ where: { id } });

    if (!userExisted) {
      throw new Error('User not found');
    }

    Object.assign(userExisted, userDto);

    await this.userRepository.save(userExisted);
    return userExisted;
  }

  async UserInfoByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (user) {
      delete user.password;
    }

    return user;
  }
}
