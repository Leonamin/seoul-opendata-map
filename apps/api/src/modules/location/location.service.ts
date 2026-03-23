import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocationEntity } from './location.entity.js';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(LocationEntity)
    private readonly locationRepository: Repository<LocationEntity>,
  ) {}

  findAll(): Promise<LocationEntity[]> {
    return this.locationRepository.find({ order: { name: 'ASC' } });
  }

  search(q: string): Promise<LocationEntity[]> {
    return this.locationRepository
      .createQueryBuilder('loc')
      .where('loc.name ILIKE :q', { q: `%${q}%` })
      .orderBy('loc.name', 'ASC')
      .getMany();
  }
}
