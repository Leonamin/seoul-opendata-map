'use client';

import { useEffect, useRef } from 'react';
import type { CommercialData } from '@seoul-opendata/shared';

export interface LocationInfo {
  lat: number;
  lng: number;
  name: string;
}

interface CommercialLayerProps {
  map: unknown;
  data: CommercialData[];
  locationMap: Record<string, LocationInfo>;
  visible?: boolean;
}

type MapboxMap = {
  getSource: (id: string) => { setData: (data: unknown) => void } | undefined;
  addSource: (id: string, source: unknown) => void;
  addLayer: (layer: unknown) => void;
  getLayer: (id: string) => unknown;
  setLayoutProperty: (layer: string, name: string, value: unknown) => void;
  on: (event: string, callback: () => void) => void;
};

function toGeoJSON(data: CommercialData[], locationMap: Record<string, LocationInfo>) {
  return {
    type: 'FeatureCollection',
    features: data
      .filter((d) => locationMap[d.locationId])
      .map((d) => {
        const loc = locationMap[d.locationId]!;
        return {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [loc.lng, loc.lat] },
          properties: {
            totalSales: Number(d.totalSales) || 0,
            businessType: d.businessTypeName,
            storeCount: d.storeCount,
            name: loc.name,
          },
        };
      }),
  };
}

export function CommercialLayer({ map, data, locationMap, visible = true }: CommercialLayerProps) {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!map) return;
    const m = map as MapboxMap;

    const initialize = () => {
      if (initializedRef.current) return;
      initializedRef.current = true;

      const geojson = toGeoJSON(data, locationMap);

      if (!m.getSource('commercial')) {
        m.addSource('commercial', { type: 'geojson', data: geojson });
      }

      if (!m.getLayer('commercial-circles')) {
        m.addLayer({
          id: 'commercial-circles',
          type: 'circle',
          source: 'commercial',
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['get', 'totalSales'],
              0, 4,
              1000000, 20,
            ],
            'circle-color': '#f59e0b',
            'circle-opacity': 0.7,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fbbf24',
          },
        });
      }
    };

    try {
      initialize();
    } catch {
      m.on('load', initialize);
    }
  }, [map]);

  // Update data when it changes
  useEffect(() => {
    if (!map || !initializedRef.current) return;
    const m = map as MapboxMap;
    const src = m.getSource('commercial');
    if (src) src.setData(toGeoJSON(data, locationMap));
  }, [map, data, locationMap]);

  // Toggle visibility
  useEffect(() => {
    if (!map || !initializedRef.current) return;
    const m = map as MapboxMap;
    if (m.getLayer('commercial-circles')) {
      m.setLayoutProperty('commercial-circles', 'visibility', visible ? 'visible' : 'none');
    }
  }, [map, visible]);

  return null;
}
