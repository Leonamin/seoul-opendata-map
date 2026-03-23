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

@Entity('population_data')
@Index('idx_pop_location_time', ['locationId', 'timestamp'])
export class PopulationDataEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column('uuid')
  locationId: string;

  @ManyToOne(() => LocationEntity)
  @JoinColumn({ name: 'locationId' })
  location: LocationEntity;

  @Column('timestamptz')
  timestamp: Date;

  @Column('int', { nullable: true })
  totalPopulation: number;

  @Column('int', { nullable: true })
  malePopulation: number;

  @Column('int', { nullable: true })
  femalePopulation: number;

  @Column('int', { nullable: true })
  age0to9: number;

  @Column('int', { nullable: true })
  age10to19: number;

  @Column('int', { nullable: true })
  age20to29: number;

  @Column('int', { nullable: true })
  age30to39: number;

  @Column('int', { nullable: true })
  age40to49: number;

  @Column('int', { nullable: true })
  age50to59: number;

  @Column('int', { nullable: true })
  age60plus: number;

  @Column('float', { nullable: true })
  residentRatio: number;

  @Column('float', { nullable: true })
  visitorRatio: number;

  @Column({ length: 10, nullable: true })
  congestionLevel: string;

  @Column({ length: 20, default: 'api' })
  source: string;

  @CreateDateColumn()
  createdAt: Date;
}
