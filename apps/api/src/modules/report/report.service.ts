import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ReportEntity } from './report.entity.js';
import { ScenarioService } from '../scenario/scenario.service.js';
import { PopulationDataEntity } from '../population/population.entity.js';
import { CommercialDataEntity } from '../commercial/commercial.entity.js';
import { GenerateReportDto } from './dto/report.dto.js';

const ANON_USER_ID = '00000000-0000-0000-0000-000000000001';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(ReportEntity)
    private readonly reportRepository: Repository<ReportEntity>,
    @InjectRepository(PopulationDataEntity)
    private readonly populationRepository: Repository<PopulationDataEntity>,
    @InjectRepository(CommercialDataEntity)
    private readonly commercialRepository: Repository<CommercialDataEntity>,
    private readonly scenarioService: ScenarioService,
  ) {}

  async generate(userId: string, dto: GenerateReportDto): Promise<ReportEntity> {
    const scenario = await this.scenarioService.findOne(dto.scenarioId, userId);

    const locationIds = scenario.locations.map((sl) => sl.locationId);
    const baselinePeriod = scenario.periods.find((p) => p.isBaseline);
    const comparisonPeriods = scenario.periods.filter((p) => !p.isBaseline);

    const locationMetrics = await Promise.all(
      locationIds.map(async (locationId) => {
        const loc = scenario.locations.find((sl) => sl.locationId === locationId);
        const locationName = loc?.location?.name ?? locationId;

        const periods = await Promise.all(
          scenario.periods.map(async (period) => {
            const popRecords = await this.populationRepository.find({
              where: {
                locationId,
                timestamp: Between(
                  new Date(period.startDate),
                  new Date(period.endDate),
                ),
              },
            });

            const populations = popRecords.map((p) => p.totalPopulation ?? 0);
            const avgPopulation =
              populations.length > 0
                ? populations.reduce((a, b) => a + b, 0) / populations.length
                : 0;
            const peakPopulation = populations.length > 0 ? Math.max(...populations) : 0;
            const minPopulation = populations.length > 0 ? Math.min(...populations) : 0;

            const commRecords = await this.commercialRepository
              .createQueryBuilder('c')
              .where('c.locationId = :locationId', { locationId })
              .andWhere('c.periodDate BETWEEN :start AND :end', {
                start: period.startDate,
                end: period.endDate,
              })
              .getMany();

            const totalSales =
              commRecords.length > 0
                ? commRecords.reduce((sum, c) => sum + Number(c.totalSales ?? 0), 0)
                : null;

            const dominantBusinessType =
              commRecords.length > 0
                ? commRecords.sort(
                    (a, b) =>
                      Number(b.totalSales ?? 0) - Number(a.totalSales ?? 0),
                  )[0].businessTypeName
                : null;

            return {
              periodLabel: period.label,
              avgPopulation,
              peakPopulation,
              minPopulation,
              totalSales,
              dominantBusinessType,
            };
          }),
        );

        return { locationId, locationName, periods };
      }),
    );

    const changeRates = locationIds.map((locationId) => {
      const metric = locationMetrics.find((m) => m.locationId === locationId);
      const baselineMetric = metric?.periods.find(
        (p) => p.periodLabel === baselinePeriod?.label,
      );
      const comparisonMetric = metric?.periods.find(
        (p) => p.periodLabel === comparisonPeriods[0]?.label,
      );

      const baselineAvgPop = baselineMetric?.avgPopulation ?? 0;
      const comparisonAvgPop = comparisonMetric?.avgPopulation ?? 0;
      const populationChangeRate =
        baselineAvgPop > 0
          ? ((comparisonAvgPop - baselineAvgPop) / baselineAvgPop) * 100
          : 0;

      const baselineAvgSales = baselineMetric?.totalSales ?? null;
      const comparisonAvgSales = comparisonMetric?.totalSales ?? null;
      const salesChangeRate =
        baselineAvgSales && baselineAvgSales > 0 && comparisonAvgSales !== null
          ? ((comparisonAvgSales - baselineAvgSales) / baselineAvgSales) * 100
          : null;

      return {
        locationId,
        locationName: metric?.locationName ?? locationId,
        populationChangeRate,
        salesChangeRate,
        baselineAvgPopulation: baselineAvgPop,
        comparisonAvgPopulation: comparisonAvgPop,
        baselineAvgSales,
        comparisonAvgSales,
      };
    });

    const reportData = {
      summary: {
        totalLocations: locationIds.length,
        totalPeriods: scenario.periods.length,
        baselinePeriod: baselinePeriod?.label ?? '',
        comparisonPeriods: comparisonPeriods.map((p) => p.label),
      },
      changeRates,
      locationMetrics,
    };

    const report = this.reportRepository.create({
      scenarioId: dto.scenarioId,
      userId,
      reportData,
    });

    return this.reportRepository.save(report);
  }

  async findOne(id: string): Promise<ReportEntity> {
    const report = await this.reportRepository.findOne({ where: { id } });
    if (!report) {
      throw new NotFoundException(`Report ${id} not found`);
    }
    return report;
  }
}
