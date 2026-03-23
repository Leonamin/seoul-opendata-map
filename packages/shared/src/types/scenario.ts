export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  areaCode: string;
  category: string;
}

export interface Scenario {
  id: string;
  userId: string;
  name: string;
  description?: string;
  status: ScenarioStatus;
  locations: ScenarioLocation[];
  periods: ScenarioPeriod[];
  createdAt: string;
  updatedAt: string;
}

export type ScenarioStatus = 'draft' | 'active' | 'completed';

export interface ScenarioLocation {
  id: string;
  scenarioId: string;
  locationId: string;
  location?: Location;
  displayOrder: number;
}

export interface ScenarioPeriod {
  id: string;
  scenarioId: string;
  label: string;
  startDate: string;
  endDate: string;
  isBaseline: boolean;
}

export interface CreateScenarioDto {
  name: string;
  description?: string;
  locationIds: string[];
  periods: {
    label: string;
    startDate: string;
    endDate: string;
    isBaseline: boolean;
  }[];
}
