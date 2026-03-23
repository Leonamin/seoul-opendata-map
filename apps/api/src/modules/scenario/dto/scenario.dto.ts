import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsUUID,
  IsDateString,
  IsBoolean,
  ValidateNested,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateScenarioPeriodDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  label: string;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;

  @ApiProperty()
  @IsBoolean()
  isBaseline: boolean;
}

export class CreateScenarioDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [String], description: 'Array of location UUIDs' })
  @IsArray()
  @IsUUID('4', { each: true })
  locationIds: string[];

  @ApiProperty({ type: [CreateScenarioPeriodDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateScenarioPeriodDto)
  periods: CreateScenarioPeriodDto[];
}

export class UpdateScenarioDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ['draft', 'active', 'completed'] })
  @IsOptional()
  @IsString()
  status?: 'draft' | 'active' | 'completed';

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  locationIds?: string[];

  @ApiPropertyOptional({ type: [CreateScenarioPeriodDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateScenarioPeriodDto)
  periods?: CreateScenarioPeriodDto[];
}
