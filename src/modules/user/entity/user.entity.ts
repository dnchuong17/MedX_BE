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

  @Column({ name: 'encryption_key', type: 'varchar', nullable: true })
  encryptionKey: string;

  @OneToMany(() => RecordEntity, (record) => record.user)
  records: RecordEntity[];

  @Column()
  isVerified: boolean;

  @Column({ nullable: true })
  otp: string;

  @Column({ nullable: true })
  insurance_id: string;

  @Column({ default: false, nullable: true })
  isSync: boolean;

  @Column({ nullable: true })
  user_UID: number;
}
