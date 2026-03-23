import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { PopulationDataEntity } from './population.entity.js';
import { LocationEntity } from '../location/location.entity.js';

@Injectable()
export class PopulationService {
  constructor(
    @InjectRepository(PopulationDataEntity)
    private readonly populationRepository: Repository<PopulationDataEntity>,
    @InjectRepository(LocationEntity)
    private readonly locationRepository: Repository<LocationEntity>,
  ) {}

  async getRealtimeAll(): Promise<unknown[]> {
    const locations = await this.locationRepository.find();
    const locationIds = locations.map((l) => l.id);

    // Get latest record per location using a subquery approach
    const latest = await this.populationRepository
      .createQueryBuilder('p')
      .where('p.locationId IN (:...ids)', { ids: locationIds })
      .distinctOn(['p.locationId'])
      .orderBy('p.locationId', 'ASC')
      .addOrderBy('p.timestamp', 'DESC')
      .getMany();

    const locationMap = new Map(locations.map((l) => [l.id, l]));

    return latest.map((p) => {
      const loc = locationMap.get(p.locationId);
      return {
        locationId: p.locationId,
        name: loc?.name ?? '',
        lat: loc?.lat ?? 0,
        lng: loc?.lng ?? 0,
        population: p.totalPopulation,
        congestionLevel: p.congestionLevel,
        timestamp: p.timestamp,
      };
    });
  }

  getHistory(
    locationId: string,
    startDate: string,
    endDate: string,
  ): Promise<PopulationDataEntity[]> {
    return this.populationRepository
      .createQueryBuilder('p')
      .where('p.locationId = :locationId', { locationId })
      .andWhere('p.timestamp BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .orderBy('p.timestamp', 'ASC')
      .getMany();
  }

  async getBulk(
    locationIds: string[],
    startDate: string,
    endDate: string,
  ): Promise<Record<string, PopulationDataEntity[]>> {
    const records = await this.populationRepository.find({
      where: {
        locationId: In(locationIds),
      },
      order: { timestamp: 'ASC' },
    });

    const result: Record<string, PopulationDataEntity[]> = {};
    for (const record of records) {
      const ts = new Date(record.timestamp);
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (ts >= start && ts <= end) {
        if (!result[record.locationId]) {
          result[record.locationId] = [];
        }
        result[record.locationId].push(record);
      }
    }
    return result;
  }
}
