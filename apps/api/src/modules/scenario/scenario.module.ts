import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScenarioEntity } from './entities/scenario.entity.js';
import { ScenarioLocationEntity } from './entities/scenario-location.entity.js';
import { ScenarioPeriodEntity } from './entities/scenario-period.entity.js';
import { ScenarioService } from './scenario.service.js';
import { ScenarioController } from './scenario.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ScenarioEntity,
      ScenarioLocationEntity,
      ScenarioPeriodEntity,
    ]),
    AuthModule,
  ],
  controllers: [ScenarioController],
  providers: [ScenarioService],
  exports: [ScenarioService],
})
export class ScenarioModule {}
