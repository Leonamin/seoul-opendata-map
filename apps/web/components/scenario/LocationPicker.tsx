'use client';

import { useState, useCallback, useEffect, useRef, ComponentType } from 'react';

interface LocationPickerProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

interface DistrictInfo {
  code: string;
  name: string;
}

type MapboxMap = {
  remove: () => void;
  on: (event: string, callback: () => void) => void;
};

interface DistrictLayerProps {
  map: object;
  selectedDistricts: string[];
  onDistrictSelect: (code: string, name: string) => void;
}

function DistrictMapPicker({
  selectedCodes,
  onToggle,
}: {
  selectedCodes: string[];
  onToggle: (code: string, name: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const [mapInstance, setMapInstance] = useState<object | null>(null);
  const [DistrictLayerComponent, setDistrictLayerComponent] =
    useState<ComponentType<DistrictLayerProps> | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let instance: MapboxMap | null = null;

    import('maplibre-gl').then((maplibregl) => {
      if (!containerRef.current) return;
      instance = new maplibregl.default.Map({
        container: containerRef.current,
        style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
        center: [126.978, 37.5665],
        zoom: 10,
      }) as unknown as MapboxMap;
      mapRef.current = instance;
      instance.on('load', () => {
        setMapInstance(instance as unknown as object);
      });
    });

    return () => {
      if (instance) {
        instance.remove();
        mapRef.current = null;
        setMapInstance(null);
      }
    };
  }, []);

  useEffect(() => {
    import('@/components/map/DistrictLayer').then((mod) => {
      setDistrictLayerComponent(
        () => mod.DistrictLayer as unknown as ComponentType<DistrictLayerProps>
      );
    });
  }, []);

  return (
    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-600">
      <div ref={containerRef} className="absolute inset-0" />
      {mapInstance !== null && DistrictLayerComponent !== null && (
        <DistrictLayerComponent
          map={mapInstance}
          selectedDistricts={selectedCodes}
          onDistrictSelect={onToggle}
        />
      )}
      {mapInstance === null && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <span className="text-gray-500 text-xs">지도 로딩 중...</span>
        </div>
      )}
    </div>
  );
}

export function LocationPicker({ selectedIds, onChange }: LocationPickerProps) {
  const [selectedDistricts, setSelectedDistricts] = useState<DistrictInfo[]>(() =>
    selectedIds.map((id) => ({ code: id, name: id }))
  );

  const handleToggle = useCallback(
    (code: string, name: string) => {
      setSelectedDistricts((prev) => {
        const exists = prev.some((d) => d.code === code);
        const next = exists
          ? prev.filter((d) => d.code !== code)
          : [...prev, { code, name }];
        onChange(next.map((d) => d.code));
        return next;
      });
    },
    [onChange]
  );

  const handleRemove = useCallback(
    (code: string) => {
      setSelectedDistricts((prev) => {
        const next = prev.filter((d) => d.code !== code);
        onChange(next.map((d) => d.code));
        return next;
      });
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    setSelectedDistricts([]);
    onChange([]);
  }, [onChange]);

  const selectedCodes = selectedDistricts.map((d) => d.code);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-300">
          구 선택{' '}
          <span className="text-gray-500">({selectedDistricts.length}개 선택됨)</span>
        </label>
        {selectedDistricts.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-gray-500 hover:text-gray-300"
          >
            전체 해제
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500">지도에서 구를 클릭하여 선택/해제하세요</p>

      <DistrictMapPicker selectedCodes={selectedCodes} onToggle={handleToggle} />

      {selectedDistricts.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedDistricts.map((d) => (
            <span
              key={d.code}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600/30 border border-blue-500/40 rounded-full text-xs text-blue-300"
            >
              {d.name}
              <button
                type="button"
                onClick={() => handleRemove(d.code)}
                className="hover:text-white leading-none"
                aria-label={`${d.name} 해제`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {selectedIds.length < 2 && (
        <p className="text-amber-400 text-xs">최소 2개 구를 선택하세요</p>
      )}
    </div>
  );
}
