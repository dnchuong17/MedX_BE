import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column({ nullable: true })
  encrypted_key?: string;

  @Column()
  isVerified: boolean;

  @Column({ nullable: true })
  otp: string;
}
