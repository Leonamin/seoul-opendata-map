import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PopulationService } from './population.service.js';
import {
  PopulationHistoryQueryDto,
  PopulationBulkQueryDto,
} from './dto/population.dto.js';

@ApiTags('population')
@Controller('population')
export class PopulationController {
  constructor(private readonly populationService: PopulationService) {}

  @Get('realtime')
  @ApiOperation({ summary: 'Get latest population data for all hotspots' })
  async getRealtime() {
    const hotspots = await this.populationService.getRealtimeAll();
    return {
      hotspots,
      fetchedAt: new Date().toISOString(),
    };
  }

  @Get('history')
  @ApiOperation({ summary: 'Get population time-series for a location' })
  getHistory(@Query() query: PopulationHistoryQueryDto) {
    return this.populationService.getHistory(
      query.locationId,
      query.startDate,
      query.endDate,
    );
  }

  @Get('bulk')
  @ApiOperation({ summary: 'Bulk fetch population for multiple locations' })
  getBulk(@Query() query: PopulationBulkQueryDto) {
    const ids = Array.isArray(query['locationIds[]'])
      ? query['locationIds[]']
      : [query['locationIds[]']];
    return this.populationService.getBulk(ids, query.startDate, query.endDate);
  }
}
