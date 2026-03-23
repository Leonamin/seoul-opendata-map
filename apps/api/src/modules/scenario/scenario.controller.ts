import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ScenarioService } from './scenario.service.js';
import { CreateScenarioDto, UpdateScenarioDto } from './dto/scenario.dto.js';
import { JweAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

interface ReqUser { sub: string; email: string; name: string }

@ApiTags('scenarios')
@Controller('scenarios')
@UseGuards(JweAuthGuard)
export class ScenarioController {
  constructor(private readonly scenarioService: ScenarioService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new scenario' })
  create(
    @Body() dto: CreateScenarioDto,
    @CurrentUser() user: ReqUser,
  ) {
    return this.scenarioService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: "List current user's scenarios" })
  findAll(@CurrentUser() user: ReqUser) {
    return this.scenarioService.findAllByUser(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get scenario with locations and periods' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: ReqUser,
  ) {
    return this.scenarioService.findOne(id, user.sub);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a scenario' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateScenarioDto,
    @CurrentUser() user: ReqUser,
  ) {
    return this.scenarioService.update(id, user.sub, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a scenario' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: ReqUser,
  ) {
    return this.scenarioService.remove(id, user.sub);
  }
}
