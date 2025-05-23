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

  async UserInfoByPhone(phone: string) {
    const user = await this.userRepository.findOne({
      where: { phone },
    });
    if (user) {
      delete user.password;
    }

    return user;
  }

  async UserInfoByWallet(wallet_address: string) {
    const user = await this.userRepository.findOne({
      where: { wallet_address },
    });
    if (user) {
      delete user.password;
    }

    return user;
  }

  async updateUserEncryptionKey(userId: number, encryptionKey: string) {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.encryptionKey = encryptionKey;
    await this.userRepository.save(user);
  }

  async getAllInsuranceId() {
    const result = await this.userRepository
      .createQueryBuilder('user')
      .select('user.insurance_id')
      .where('user.insurance_id IS NOT NULL')
      .getRawMany();

    return result.map(row => row.user_insurance_id);
  }
}
