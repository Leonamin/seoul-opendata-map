import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommercialService } from './commercial.service.js';
import { CommercialByLocationQueryDto } from './dto/commercial.dto.js';

@ApiTags('commercial')
@Controller('commercial')
export class CommercialController {
  constructor(private readonly commercialService: CommercialService) {}

  @Get('by-location')
  @ApiOperation({ summary: 'Get commercial data by location and date range' })
  getByLocation(@Query() query: CommercialByLocationQueryDto) {
    return this.commercialService.getByLocation(
      query.locationId,
      query.startDate,
      query.endDate,
    );
  }

  @Get('business-types')
  @ApiOperation({ summary: 'List all business type codes and names' })
  getBusinessTypes() {
    return this.commercialService.getBusinessTypes();
  }
}
