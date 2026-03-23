import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class SearchLocationDto {
  @ApiPropertyOptional({ description: 'Search query for location name' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  q?: string;
}

export class LocationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  areaCode: string;

  @ApiProperty()
  lat: number;

  @ApiProperty()
  lng: number;

  @ApiPropertyOptional()
  category: string;

  @ApiProperty()
  createdAt: Date;
}
