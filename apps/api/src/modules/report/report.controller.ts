import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReportService } from './report.service.js';
import { GenerateReportDto } from './dto/report.dto.js';
import { JweAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

interface ReqUser { sub: string; email: string; name: string }

@ApiTags('reports')
@Controller('reports')
@UseGuards(JweAuthGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate a comparison report from a scenario' })
  generate(
    @Body() dto: GenerateReportDto,
    @CurrentUser() user: ReqUser,
  ) {
    return this.reportService.generate(user.sub, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a saved report by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportService.findOne(id);
  }
}
