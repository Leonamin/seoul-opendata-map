'use client';

import { useEffect, useRef } from 'react';
import type { PopulationHotspot } from '@seoul-opendata/shared';

interface PopulationHeatmapProps {
  map: unknown;
  data: PopulationHotspot[];
  intensity?: number;
  visible?: boolean;
}

type MapboxMap = {
  getSource: (id: string) => { setData: (data: unknown) => void } | undefined;
  addSource: (id: string, source: unknown) => void;
  addLayer: (layer: unknown) => void;
  getLayer: (id: string) => unknown;
  setLayoutProperty: (layer: string, name: string, value: unknown) => void;
  setPaintProperty: (layer: string, name: string, value: unknown) => void;
  on: (event: string, callback: () => void) => void;
};

function toGeoJSON(hotspots: PopulationHotspot[]) {
  return {
    type: 'FeatureCollection',
    features: hotspots.map((h) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [h.lng, h.lat] },
      properties: {
        population: h.population,
        congestion: h.congestionLevel,
        locationId: h.locationId,
        name: h.name,
      },
    })),
  };
}

export function PopulationHeatmap({
  map,
  data,
  intensity = 1,
  visible = true,
}: PopulationHeatmapProps) {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!map) return;
    const m = map as MapboxMap;

    const initialize = () => {
      if (initializedRef.current) return;
      initializedRef.current = true;

      const geojson = toGeoJSON(data);

      if (!m.getSource('population-heatmap')) {
        m.addSource('population-heatmap', {
          type: 'geojson',
          data: geojson,
        });
      }

      if (!m.getLayer('population-heatmap-layer')) {
        m.addLayer({
          id: 'population-heatmap-layer',
          type: 'heatmap',
          source: 'population-heatmap',
          paint: {
            'heatmap-weight': [
              'interpolate',
              ['linear'],
              ['get', 'population'],
              0, 0,
              50000, 1,
            ],
            'heatmap-intensity': intensity,
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(33,102,172,0)',
              0.2, 'rgb(103,169,207)',
              0.4, 'rgb(209,229,240)',
              0.6, 'rgb(253,219,199)',
              0.8, 'rgb(239,138,98)',
              1, 'rgb(178,24,43)',
            ],
            'heatmap-radius': 30,
            'heatmap-opacity': 0.8,
          },
        });
      }
    };

    // If map is already loaded
    try {
      initialize();
    } catch {
      m.on('load', initialize);
    }
  }, [map]);

  useEffect(() => {
    if (!map || !initializedRef.current) return;
    const m = map as MapboxMap;
    const src = m.getSource('population-heatmap');
    if (src) {
      src.setData(toGeoJSON(data));
    }
  }, [map, data]);

  useEffect(() => {
    if (!map || !initializedRef.current) return;
    const m = map as MapboxMap;
    if (m.getLayer('population-heatmap-layer')) {
      m.setLayoutProperty(
        'population-heatmap-layer',
        'visibility',
        visible ? 'visible' : 'none'
      );
    }
  }, [map, visible]);

  useEffect(() => {
    if (!map || !initializedRef.current) return;
    const m = map as MapboxMap;
    if (m.getLayer('population-heatmap-layer')) {
      m.setPaintProperty('population-heatmap-layer', 'heatmap-intensity', intensity);
    }
  }, [map, intensity]);

  return null;
}
