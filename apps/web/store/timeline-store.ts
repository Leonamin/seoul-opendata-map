import { create } from 'zustand';
import type { PopulationHotspot } from '@seoul-opendata/shared';

export interface TimelineState {
  isPlaying: boolean;
  speed: 1 | 2 | 4;
  currentTimestamp: string | null;
  timeRange: { start: string; end: string } | null;
  timelineData: Map<string, PopulationHotspot[]>;
  play: () => void;
  pause: () => void;
  setSpeed: (speed: 1 | 2 | 4) => void;
  setCurrentTimestamp: (ts: string) => void;
  setTimelineData: (data: Map<string, PopulationHotspot[]>) => void;
  setTimeRange: (range: { start: string; end: string } | null) => void;
}

export const useTimelineStore = create<TimelineState>((set) => ({
  isPlaying: false,
  speed: 1,
  currentTimestamp: null,
  timeRange: null,
  timelineData: new Map(),
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  setSpeed: (speed) => set({ speed }),
  setCurrentTimestamp: (ts) => set({ currentTimestamp: ts }),
  setTimelineData: (data) => set({ timelineData: data }),
  setTimeRange: (range) => set({ timeRange: range }),
}));
