import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { LocationEntity } from '../modules/location/location.entity.js';
import { PopulationDataEntity } from '../modules/population/population.entity.js';
import { CommercialDataEntity } from '../modules/commercial/commercial.entity.js';
import { ScenarioEntity } from '../modules/scenario/entities/scenario.entity.js';
import { ScenarioLocationEntity } from '../modules/scenario/entities/scenario-location.entity.js';
import { ScenarioPeriodEntity } from '../modules/scenario/entities/scenario-period.entity.js';
import { ReportEntity } from '../modules/report/report.entity.js';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [
      LocationEntity,
      PopulationDataEntity,
      CommercialDataEntity,
      ScenarioEntity,
      ScenarioLocationEntity,
      ScenarioPeriodEntity,
      ReportEntity,
    ],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
  }),
);
