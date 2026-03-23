import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ScenarioEntity } from './scenario.entity.js';

@Entity('scenario_periods')
export class ScenarioPeriodEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  scenarioId: string;

  @ManyToOne(() => ScenarioEntity, (s) => s.periods, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'scenarioId' })
  scenario: ScenarioEntity;

  @Column({ length: 100 })
  label: string;

  @Column('date')
  startDate: string;

  @Column('date')
  endDate: string;

  @Column({ default: false })
  isBaseline: boolean;
}
