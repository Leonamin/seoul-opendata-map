import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeoulApiService } from './seoul-api.service.js';
import { LocationEntity } from '../location/location.entity.js';
import { PopulationDataEntity } from '../population/population.entity.js';

@Injectable()
export class DataArchiverService {
  private readonly logger = new Logger(DataArchiverService.name);

  constructor(
    private readonly seoulApiService: SeoulApiService,
    @InjectRepository(LocationEntity)
    private readonly locationRepository: Repository<LocationEntity>,
    @InjectRepository(PopulationDataEntity)
    private readonly populationRepository: Repository<PopulationDataEntity>,
  ) {}

  @Cron('0 * * * *')
  async collectHourlyData(): Promise<void> {
    this.logger.log('Starting hourly data collection');

    const locations = await this.locationRepository.find();
    let collected = 0;

    const entities: PopulationDataEntity[] = [];

    for (const location of locations) {
      if (!location.areaCode) continue;

      const record = await this.seoulApiService.fetchPopulationData(
        location.name,
        location.areaCode,
      );
      if (!record) continue;

      const entity = this.populationRepository.create({
        locationId: location.id,
        timestamp: record.timestamp,
        totalPopulation: record.totalPopulation,
        malePopulation: record.malePopulation,
        femalePopulation: record.femalePopulation,
        age0to9: record.age0to9,
        age10to19: record.age10to19,
        age20to29: record.age20to29,
        age30to39: record.age30to39,
        age40to49: record.age40to49,
        age50to59: record.age50to59,
        age60plus: record.age60plus,
        residentRatio: record.residentRatio,
        visitorRatio: record.visitorRatio,
        congestionLevel: record.congestionLevel,
        source: 'api',
      });

      entities.push(entity);
      collected++;
    }

    if (entities.length > 0) {
      await this.populationRepository.save(entities);
    }

    this.logger.log(`Hourly collection complete: ${collected} records saved`);
  }
}
