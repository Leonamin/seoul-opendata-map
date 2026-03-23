import { create } from 'zustand';
import type { Scenario } from '@seoul-opendata/shared';

interface ScenarioState {
  activeScenario: Scenario | null;
  scenarios: Scenario[];
  setActiveScenario: (scenario: Scenario | null) => void;
  setScenarios: (scenarios: Scenario[]) => void;
}

export const useScenarioStore = create<ScenarioState>((set) => ({
  activeScenario: null,
  scenarios: [],
  setActiveScenario: (scenario) => set({ activeScenario: scenario }),
  setScenarios: (scenarios) => set({ scenarios }),
}));
