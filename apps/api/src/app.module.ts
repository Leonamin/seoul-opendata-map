import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import databaseConfig from './config/database.config.js';
import { validate } from './config/env.validation.js';
import { LocationModule } from './modules/location/location.module.js';
import { PopulationModule } from './modules/population/population.module.js';
import { CommercialModule } from './modules/commercial/commercial.module.js';
import { ScenarioModule } from './modules/scenario/scenario.module.js';
import { ReportModule } from './modules/report/report.module.js';
import { DataCollectorModule } from './modules/data-collector/data-collector.module.js';
import { AuthModule } from './modules/auth/auth.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      validate,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions =>
        configService.get<TypeOrmModuleOptions>('database') as TypeOrmModuleOptions,
    }),
    ScheduleModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
      ttl: 60000,
    }),
    LocationModule,
    PopulationModule,
    CommercialModule,
    ScenarioModule,
    ReportModule,
    DataCollectorModule,
    AuthModule,
  ],
})
export class AppModule {}
