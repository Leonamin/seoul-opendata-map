import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationEntity } from '../location/location.entity.js';
import { PopulationDataEntity } from '../population/population.entity.js';
import { SeoulApiService } from './seoul-api.service.js';
import { DataArchiverService } from './data-archiver.service.js';
import { BulkImportService } from './bulk-import.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([LocationEntity, PopulationDataEntity])],
  providers: [SeoulApiService, DataArchiverService, BulkImportService],
  exports: [SeoulApiService, BulkImportService],
})
export class DataCollectorModule {}
