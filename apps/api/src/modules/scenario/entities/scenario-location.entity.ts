import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ScenarioEntity } from './scenario.entity.js';
import { LocationEntity } from '../../location/location.entity.js';

@Entity('scenario_locations')
export class ScenarioLocationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  scenarioId: string;

  @ManyToOne(() => ScenarioEntity, (s) => s.locations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'scenarioId' })
  scenario: ScenarioEntity;

  @Column('uuid')
  locationId: string;

  @ManyToOne(() => LocationEntity)
  @JoinColumn({ name: 'locationId' })
  location: LocationEntity;

  @Column('int', { default: 0 })
  displayOrder: number;
}
