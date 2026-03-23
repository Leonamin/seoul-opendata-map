import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LocationService } from './location.service.js';
import { SearchLocationDto } from './dto/location.dto.js';

@ApiTags('locations')
@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get()
  @ApiOperation({ summary: 'List all 115 Seoul hotspots' })
  findAll() {
    return this.locationService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search locations by name' })
  search(@Query() query: SearchLocationDto) {
    if (!query.q) {
      return this.locationService.findAll();
    }
    return this.locationService.search(query.q);
  }
}
