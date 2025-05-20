import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { RecordEntity } from '../../record/entity/record.entity';

@Entity('users')
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  age?: number;

  @Column({ nullable: true })
  gender?: string;

  @Column({ nullable: true })
  weight?: number;

  @Column({ nullable: true })
  height?: number;

  @Column({ unique: true, nullable: true })
  wallet_address?: string;

  @OneToMany(() => RecordEntity, (record) => record.user)
  records: RecordEntity[];

  @Column()
  isVerified: boolean;

  @Column({ nullable: true })
  otp: string;
}
