import { create } from 'zustand';

interface MapState {
  viewport: { lat: number; lng: number; zoom: number };
  activeLayer: { population: boolean; commercial: boolean };
  selectedHotspot: string | null;
  heatmapIntensity: number;
  setActiveLayer: (layer: string, active: boolean) => void;
  setSelectedHotspot: (id: string | null) => void;
  setHeatmapIntensity: (intensity: number) => void;
  setViewport: (viewport: { lat: number; lng: number; zoom: number }) => void;
}

export const useMapStore = create<MapState>((set) => ({
  viewport: { lat: 37.5665, lng: 126.978, zoom: 11 },
  activeLayer: { population: true, commercial: false },
  selectedHotspot: null,
  heatmapIntensity: 1,
  setActiveLayer: (layer, active) =>
    set((state) => ({
      activeLayer: { ...state.activeLayer, [layer]: active },
    })),
  setSelectedHotspot: (id) => set({ selectedHotspot: id }),
  setHeatmapIntensity: (intensity) => set({ heatmapIntensity: intensity }),
  setViewport: (viewport) => set({ viewport }),
}));
