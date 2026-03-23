import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class GenerateReportDto {
  @ApiProperty({ description: 'Scenario UUID to generate report for' })
  @IsUUID('4')
  scenarioId: string;
}
