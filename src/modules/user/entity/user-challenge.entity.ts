import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { ChallengeEntity } from '../../challenges/entity/challenge.entity';

@Entity('user_challenge')
export class UserChallengeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity)
  user: UserEntity;

  @ManyToOne(() => ChallengeEntity)
  challenge: ChallengeEntity;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  completedAt: Date;

  @Column({ type: 'boolean', default: false })
  rewarded: boolean;

  @Column({ nullable: true })
  txSignature: string;
}
