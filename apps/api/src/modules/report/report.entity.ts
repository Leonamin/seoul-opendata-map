import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ScenarioEntity } from '../scenario/entities/scenario.entity.js';

@Entity('comparison_reports')
export class ReportEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  scenarioId: string;

  @ManyToOne(() => ScenarioEntity)
  @JoinColumn({ name: 'scenarioId' })
  scenario: ScenarioEntity;

  @Column('uuid')
  userId: string;

  @Column('jsonb')
  reportData: Record<string, unknown>;

  @CreateDateColumn()
  generatedAt: Date;
}
