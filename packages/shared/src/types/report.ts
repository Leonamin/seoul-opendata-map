export interface ComparisonReport {
  id: string;
  scenarioId: string;
  userId: string;
  reportData: ReportData;
  generatedAt: string;
}

export interface ReportData {
  summary: ReportSummary;
  changeRates: ChangeRateData[];
  locationMetrics: LocationMetric[];
}

export interface ReportSummary {
  totalLocations: number;
  totalPeriods: number;
  baselinePeriod: string;
  comparisonPeriods: string[];
}

export interface ChangeRateData {
  locationId: string;
  locationName: string;
  populationChangeRate: number;
  salesChangeRate: number | null;
  baselineAvgPopulation: number;
  comparisonAvgPopulation: number;
  baselineAvgSales: number | null;
  comparisonAvgSales: number | null;
}

export interface LocationMetric {
  locationId: string;
  locationName: string;
  periods: PeriodMetric[];
}

export interface PeriodMetric {
  periodLabel: string;
  avgPopulation: number;
  peakPopulation: number;
  minPopulation: number;
  totalSales: number | null;
  dominantBusinessType: string | null;
}

export interface GenerateReportDto {
  scenarioId: string;
}
