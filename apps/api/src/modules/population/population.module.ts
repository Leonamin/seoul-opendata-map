import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PopulationDataEntity } from './population.entity.js';
import { LocationEntity } from '../location/location.entity.js';
import { PopulationService } from './population.service.js';
import { PopulationController } from './population.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([PopulationDataEntity, LocationEntity])],
  controllers: [PopulationController],
  providers: [PopulationService],
  exports: [PopulationService],
})
export class PopulationModule {}
