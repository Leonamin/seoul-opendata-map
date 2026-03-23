import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportEntity } from './report.entity.js';
import { PopulationDataEntity } from '../population/population.entity.js';
import { CommercialDataEntity } from '../commercial/commercial.entity.js';
import { ReportService } from './report.service.js';
import { ReportController } from './report.controller.js';
import { ScenarioModule } from '../scenario/scenario.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReportEntity,
      PopulationDataEntity,
      CommercialDataEntity,
    ]),
    ScenarioModule,
    AuthModule,
  ],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
