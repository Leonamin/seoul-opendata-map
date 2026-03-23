import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { LocationEntity } from '../location/location.entity.js';

@Entity('commercial_data')
@Index('idx_comm_location_date', ['locationId', 'periodDate'])
export class CommercialDataEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column('uuid')
  locationId: string;

  @ManyToOne(() => LocationEntity)
  @JoinColumn({ name: 'locationId' })
  location: LocationEntity;

  @Column('date')
  periodDate: string;

  @Column({ length: 20, nullable: true })
  businessTypeCode: string;

  @Column({ length: 50, nullable: true })
  businessTypeName: string;

  @Column('bigint', { nullable: true })
  totalSales: string;

  @Column('int', { nullable: true })
  transactionCount: number;

  @Column('int', { nullable: true })
  storeCount: number;

  @Column({ length: 20, default: 'api' })
  source: string;

  @CreateDateColumn()
  createdAt: Date;
}
