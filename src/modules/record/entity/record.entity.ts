import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';

@Entity('records')
export class RecordEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.records, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'url', type: 'text' })
  url: string;

  @Column({ name: 'file_name', type: 'varchar', length: 255 })
  fileName: string;

  @Column({ name: 'file_type', type: 'varchar', length: 100 })
  fileType: string;

  @Column({ name: 'file_size', type: 'int' })
  fileSize: number;

  @Column({ name: 'blockchain_tx', type: 'text', nullable: true })
  blockchainTx?: string;

  @Column({ name: 'version_of', type: 'uuid', nullable: true })
  versionOf?: string;

  @Column({ name: 'doctor', type: 'varchar', length: 255 })
  doctor: string;

  @Column({ name: 'category', type: 'varchar', length: 100 })
  category: string;

  @Column({ name: 'facility', type: 'varchar', length: 255 })
  facility: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;
}
