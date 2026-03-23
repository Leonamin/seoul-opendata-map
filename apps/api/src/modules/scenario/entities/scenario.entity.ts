import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ScenarioLocationEntity } from './scenario-location.entity.js';
import { ScenarioPeriodEntity } from './scenario-period.entity.js';

@Entity('scenarios')
export class ScenarioEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'draft',
  })
  status: 'draft' | 'active' | 'completed';

  @OneToMany(() => ScenarioLocationEntity, (sl) => sl.scenario, {
    cascade: true,
  })
  locations: ScenarioLocationEntity[];

  @OneToMany(() => ScenarioPeriodEntity, (sp) => sp.scenario, {
    cascade: true,
  })
  periods: ScenarioPeriodEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
