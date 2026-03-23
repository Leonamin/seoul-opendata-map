'use client';

import { useEffect, useRef, useState } from 'react';

interface DistrictLayerProps {
  map: unknown;
  selectedDistricts: string[];
  onDistrictSelect: (code: string, name: string) => void;
}

type MapboxMap = {
  getSource: (id: string) => { setData: (data: unknown) => void } | undefined;
  addSource: (id: string, source: unknown) => void;
  addLayer: (layer: unknown) => void;
  getLayer: (id: string) => unknown;
  setFeatureState: (feature: { source: string; id: number | string }, state: Record<string, unknown>) => void;
  removeFeatureState: (feature: { source: string; id?: number | string }) => void;
  on: (event: string, layerOrCallback: string | (() => void), callback?: (e: MapboxEvent) => void) => void;
  off: (event: string, layerOrCallback: string | (() => void), callback?: (e: MapboxEvent) => void) => void;
  getCanvas: () => HTMLCanvasElement;
};

interface MapboxEvent {
  lngLat: { lng: number; lat: number };
  features?: MapboxFeature[];
}

interface MapboxFeature {
  id: number | string | undefined;
  properties: Record<string, unknown> | null;
}

// code -> numeric feature id
type CodeToId = Record<string, number>;

export function DistrictLayer({ map, selectedDistricts, onDistrictSelect }: DistrictLayerProps) {
  const initializedRef = useRef(false);
  const hoveredIdRef = useRef<number | null>(null);
  const codeToIdRef = useRef<CodeToId>({});
  const [tooltipName, setTooltipName] = useState<string | null>(null);
  const selectedDistrictsRef = useRef<string[]>(selectedDistricts);

  // Keep selectedDistrictsRef in sync
  useEffect(() => {
    selectedDistrictsRef.current = selectedDistricts;
  }, [selectedDistricts]);

  useEffect(() => {
    if (!map) return;
    const m = map as MapboxMap;

    const initialize = async () => {
      if (initializedRef.current) return;
      initializedRef.current = true;

      const res = await fetch('/data/seoul-gu.geojson');
      const geojson = await res.json() as {
        type: string;
        features: Array<{ type: string; properties: { name: string; code: string; name_en: string }; geometry: unknown }>;
      };

      // Assign numeric ids and build code->id map
      geojson.features = geojson.features.map((f, i) => {
        codeToIdRef.current[f.properties.code] = i;
        return { ...f, id: i };
      });

      if (!m.getSource('seoul-gu')) {
        m.addSource('seoul-gu', { type: 'geojson', data: geojson });
      }

      if (!m.getLayer('seoul-gu-fill')) {
        m.addLayer({
          id: 'seoul-gu-fill',
          type: 'fill',
          source: 'seoul-gu',
          paint: {
            'fill-color': [
              'case',
              ['boolean', ['feature-state', 'selected'], false], '#3b82f6',
              ['boolean', ['feature-state', 'hover'], false], '#60a5fa',
              '#94a3b8',
            ],
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'selected'], false], 0.35,
              ['boolean', ['feature-state', 'hover'], false], 0.2,
              0.03,
            ],
          },
        });
      }

      if (!m.getLayer('seoul-gu-line')) {
        m.addLayer({
          id: 'seoul-gu-line',
          type: 'line',
          source: 'seoul-gu',
          paint: {
            'line-color': '#60a5fa',
            'line-opacity': 0.2,
            'line-width': 0.8,
          },
        });
      }

      const handleMouseMove = (e: MapboxEvent) => {
        const feature = e.features?.[0];
        if (!feature) return;

        const featureId = typeof feature.id === 'number' ? feature.id : null;
        const name = feature.properties?.['name'] as string | undefined;

        m.getCanvas().style.cursor = 'pointer';

        if (hoveredIdRef.current !== null && hoveredIdRef.current !== featureId) {
          m.setFeatureState({ source: 'seoul-gu', id: hoveredIdRef.current }, { hover: false });
        }

        if (featureId !== null) {
          hoveredIdRef.current = featureId;
          m.setFeatureState({ source: 'seoul-gu', id: featureId }, { hover: true });
        }

        setTooltipName(name ?? null);
      };

      const handleMouseLeave = () => {
        m.getCanvas().style.cursor = '';
        if (hoveredIdRef.current !== null) {
          m.setFeatureState({ source: 'seoul-gu', id: hoveredIdRef.current }, { hover: false });
          hoveredIdRef.current = null;
        }
        setTooltipName(null);
      };

      const handleClick = (e: MapboxEvent) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const code = feature.properties?.['code'] as string | undefined;
        const name = feature.properties?.['name'] as string | undefined;
        if (code && name) {
          onDistrictSelect(code, name);
        }
      };

      m.on('mousemove', 'seoul-gu-fill', handleMouseMove);
      m.on('mouseleave', 'seoul-gu-fill', handleMouseLeave);
      m.on('click', 'seoul-gu-fill', handleClick);

      return () => {
        m.off('mousemove', 'seoul-gu-fill', handleMouseMove);
        m.off('mouseleave', 'seoul-gu-fill', handleMouseLeave);
        m.off('click', 'seoul-gu-fill', handleClick);
      };
    };

    let cleanup: (() => void) | undefined;

    // Try to initialize immediately (map may already be loaded)
    initialize().then((c) => { cleanup = c; }).catch(() => {
      const onLoad = () => { initialize().then((c) => { cleanup = c; }); };
      m.on('load', onLoad as unknown as () => void);
    });

    return () => {
      cleanup?.();
      initializedRef.current = false;
    };
  }, [map, onDistrictSelect]);

  // Sync selected feature states whenever selectedDistricts changes
  useEffect(() => {
    if (!map || !initializedRef.current) return;
    const m = map as MapboxMap;
    const codeToId = codeToIdRef.current;

    // Guard: source may not exist yet
    if (!m.getSource('seoul-gu')) return;

    // Clear all feature states
    m.removeFeatureState({ source: 'seoul-gu' });

    // Re-apply hover
    if (hoveredIdRef.current !== null) {
      m.setFeatureState({ source: 'seoul-gu', id: hoveredIdRef.current }, { hover: true });
    }

    // Apply selected states
    for (const code of selectedDistricts) {
      const id = codeToId[code];
      if (id !== undefined) {
        m.setFeatureState({ source: 'seoul-gu', id }, { selected: true });
      }
    }
  }, [map, selectedDistricts]);

  if (!tooltipName) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
      <div className="glass rounded-lg px-3.5 py-1.5 text-sm font-medium text-slate-100 shadow-2xl shadow-black/30">
        {tooltipName}
      </div>
    </div>
  );
}
