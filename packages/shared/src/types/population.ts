export interface PopulationData {
  id: string;
  locationId: string;
  timestamp: string;
  totalPopulation: number;
  malePopulation: number;
  femalePopulation: number;
  age0to9: number;
  age10to19: number;
  age20to29: number;
  age30to39: number;
  age40to49: number;
  age50to59: number;
  age60plus: number;
  residentRatio: number;
  visitorRatio: number;
  congestionLevel: CongestionLevel;
  source: DataSource;
}

export type CongestionLevel = '여유' | '보통' | '약간 붐빔' | '붐빔';
export type DataSource = 'api' | 'bulk_import';

export interface PopulationRealtimeResponse {
  hotspots: PopulationHotspot[];
  fetchedAt: string;
}

export interface PopulationHotspot {
  locationId: string;
  name: string;
  lat: number;
  lng: number;
  population: number;
  congestionLevel: CongestionLevel;
  timestamp: string;
}

export interface PopulationHistoryQuery {
  locationId: string;
  startDate: string;
  endDate: string;
  interval?: 'hour' | 'day';
}

export interface PopulationCompareQuery {
  locationIds: string[];
  period1Start: string;
  period1End: string;
  period2Start: string;
  period2End: string;
}
