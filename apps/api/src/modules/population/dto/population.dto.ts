import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsArray } from 'class-validator';

export class PopulationHistoryQueryDto {
  @ApiProperty({ description: 'Location UUID' })
  @IsString()
  locationId: string;

  @ApiProperty({ description: 'Start date ISO string' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date ISO string' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ enum: ['hour', 'day'] })
  @IsOptional()
  @IsString()
  interval?: 'hour' | 'day';
}

export class PopulationBulkQueryDto {
  @ApiProperty({ description: 'Array of location UUIDs', type: [String] })
  @IsArray()
  @IsString({ each: true })
  'locationIds[]': string[];

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;
}
