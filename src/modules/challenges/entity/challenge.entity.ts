import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('challenge')
export class ChallengeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column()
  conditionKey: string;

  @Column('float')
  conditionValue: number;

  @Column({ nullable: true })
  unit: string;

  @Column({ nullable: true })
  timeFrame: string;

  @Column('int', { default: 1 })
  rewardAmount: number;

  @Column('simple-array', { nullable: true })
  conditionKeywords?: string[];
}
