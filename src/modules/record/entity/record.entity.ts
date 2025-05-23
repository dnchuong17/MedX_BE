import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';

@Entity('records')
export class RecordEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.records, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'user_id' })
  @Index()
  user: UserEntity;

  @Column({ name: 'url', type: 'text' })
  url: string;

  @Column({ name: 'encrypted_data', type: 'bytea', nullable: true })
  encryptedData: Buffer;

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

  @Column({ name: 'doctor', type: 'varchar', length: 255, nullable: true })
  doctor: string;

  @Column({ name: 'category', type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ name: 'facility', type: 'varchar', length: 255, nullable: true })
  facility: string;

  @Column({ type: 'date', nullable: true })
  date: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'transaction', type: 'text', nullable: true })
  transaction?: string | null;
}
