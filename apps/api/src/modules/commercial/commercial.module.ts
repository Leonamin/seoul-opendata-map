import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommercialDataEntity } from './commercial.entity.js';
import { CommercialService } from './commercial.service.js';
import { CommercialController } from './commercial.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([CommercialDataEntity])],
  controllers: [CommercialController],
  providers: [CommercialService],
  exports: [CommercialService],
})
export class CommercialModule {}
