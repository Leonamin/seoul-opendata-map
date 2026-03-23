import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { parse } from 'csv-parse';
import { Readable } from 'stream';
import { PopulationDataEntity } from '../population/population.entity.js';
import { LocationEntity } from '../location/location.entity.js';

interface CsvRow {
  areaCode: string;
  timestamp: string;
  totalPopulation: string;
  malePopulation: string;
  femalePopulation: string;
  age0to9: string;
  age10to19: string;
  age20to29: string;
  age30to39: string;
  age40to49: string;
  age50to59: string;
  age60plus: string;
  residentRatio: string;
  visitorRatio: string;
  congestionLevel: string;
}

@Injectable()
export class BulkImportService {
  private readonly logger = new Logger(BulkImportService.name);

  constructor(
    @InjectRepository(PopulationDataEntity)
    private readonly populationRepository: Repository<PopulationDataEntity>,
    @InjectRepository(LocationEntity)
    private readonly locationRepository: Repository<LocationEntity>,
  ) {}

  async importPopulationCsv(csvBuffer: Buffer): Promise<number> {
    const locations = await this.locationRepository.find();
    const locationByCode = new Map(
      locations.filter((l) => l.areaCode).map((l) => [l.areaCode, l]),
    );

    const rows = await this.parseCsv(csvBuffer);
    let imported = 0;

    const batch: PopulationDataEntity[] = [];
    for (const row of rows) {
      const location = locationByCode.get(row.areaCode);
      if (!location) {
        this.logger.warn(`Unknown areaCode: ${row.areaCode}`);
        continue;
      }

      batch.push(
        this.populationRepository.create({
          locationId: location.id,
          timestamp: new Date(row.timestamp),
          totalPopulation: parseInt(row.totalPopulation, 10),
          malePopulation: parseInt(row.malePopulation, 10),
          femalePopulation: parseInt(row.femalePopulation, 10),
          age0to9: parseInt(row.age0to9, 10),
          age10to19: parseInt(row.age10to19, 10),
          age20to29: parseInt(row.age20to29, 10),
          age30to39: parseInt(row.age30to39, 10),
          age40to49: parseInt(row.age40to49, 10),
          age50to59: parseInt(row.age50to59, 10),
          age60plus: parseInt(row.age60plus, 10),
          residentRatio: parseFloat(row.residentRatio),
          visitorRatio: parseFloat(row.visitorRatio),
          congestionLevel: row.congestionLevel,
          source: 'bulk_import',
        }),
      );

      if (batch.length >= 500) {
        await this.populationRepository.save(batch);
        imported += batch.length;
        batch.length = 0;
      }
    }

    if (batch.length > 0) {
      await this.populationRepository.save(batch);
      imported += batch.length;
    }

    this.logger.log(`Bulk import complete: ${imported} records`);
    return imported;
  }

  private parseCsv(buffer: Buffer): Promise<CsvRow[]> {
    return new Promise((resolve, reject) => {
      const rows: CsvRow[] = [];
      const stream = Readable.from(buffer);
      stream
        .pipe(
          parse({
            columns: true,
            skip_empty_lines: true,
            trim: true,
          }),
        )
        .on('data', (row: CsvRow) => rows.push(row))
        .on('end', () => resolve(rows))
        .on('error', reject);
    });
  }
}
