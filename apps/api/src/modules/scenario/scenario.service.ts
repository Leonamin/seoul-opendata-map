import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScenarioEntity } from './entities/scenario.entity.js';
import { ScenarioLocationEntity } from './entities/scenario-location.entity.js';
import { ScenarioPeriodEntity } from './entities/scenario-period.entity.js';
import { CreateScenarioDto, UpdateScenarioDto } from './dto/scenario.dto.js';

@Injectable()
export class ScenarioService {
  constructor(
    @InjectRepository(ScenarioEntity)
    private readonly scenarioRepository: Repository<ScenarioEntity>,
    @InjectRepository(ScenarioLocationEntity)
    private readonly scenarioLocationRepository: Repository<ScenarioLocationEntity>,
    @InjectRepository(ScenarioPeriodEntity)
    private readonly scenarioPeriodRepository: Repository<ScenarioPeriodEntity>,
  ) {}

  async create(userId: string, dto: CreateScenarioDto): Promise<ScenarioEntity> {
    const scenario = this.scenarioRepository.create({
      userId,
      name: dto.name,
      description: dto.description,
      status: 'draft',
    });
    const saved = await this.scenarioRepository.save(scenario);

    const locations = dto.locationIds.map((locationId, index) =>
      this.scenarioLocationRepository.create({
        scenarioId: saved.id,
        locationId,
        displayOrder: index,
      }),
    );
    await this.scenarioLocationRepository.save(locations);

    const periods = dto.periods.map((p) =>
      this.scenarioPeriodRepository.create({
        scenarioId: saved.id,
        label: p.label,
        startDate: p.startDate,
        endDate: p.endDate,
        isBaseline: p.isBaseline,
      }),
    );
    await this.scenarioPeriodRepository.save(periods);

    return this.findOne(saved.id, userId);
  }

  findAllByUser(userId: string): Promise<ScenarioEntity[]> {
    return this.scenarioRepository.find({
      where: { userId },
      relations: ['locations', 'locations.location', 'periods'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<ScenarioEntity> {
    const scenario = await this.scenarioRepository.findOne({
      where: { id },
      relations: ['locations', 'locations.location', 'periods'],
    });
    if (!scenario) {
      throw new NotFoundException(`Scenario ${id} not found`);
    }
    if (scenario.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return scenario;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateScenarioDto,
  ): Promise<ScenarioEntity> {
    const scenario = await this.findOne(id, userId);

    if (dto.name !== undefined) scenario.name = dto.name;
    if (dto.description !== undefined) scenario.description = dto.description;
    if (dto.status !== undefined) scenario.status = dto.status;
    await this.scenarioRepository.save(scenario);

    if (dto.locationIds !== undefined) {
      await this.scenarioLocationRepository.delete({ scenarioId: id });
      const locations = dto.locationIds.map((locationId, index) =>
        this.scenarioLocationRepository.create({
          scenarioId: id,
          locationId,
          displayOrder: index,
        }),
      );
      await this.scenarioLocationRepository.save(locations);
    }

    if (dto.periods !== undefined) {
      await this.scenarioPeriodRepository.delete({ scenarioId: id });
      const periods = dto.periods.map((p) =>
        this.scenarioPeriodRepository.create({
          scenarioId: id,
          label: p.label,
          startDate: p.startDate,
          endDate: p.endDate,
          isBaseline: p.isBaseline,
        }),
      );
      await this.scenarioPeriodRepository.save(periods);
    }

    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);
    await this.scenarioRepository.delete({ id });
  }
}
