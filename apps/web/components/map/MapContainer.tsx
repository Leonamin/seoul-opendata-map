'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface MapContainerProps {
  children?: ReactNode;
  onMapReady?: (map: unknown) => void;
}

export function MapContainer({ children, onMapReady }: MapContainerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const onMapReadyRef = useRef(onMapReady);

  useEffect(() => {
    onMapReadyRef.current = onMapReady;
  }, [onMapReady]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    let cancelled = false;
    let mapInstance: {
      remove: () => void;
      on: (event: string, callback: () => void) => void;
    } | null = null;

    import('maplibre-gl').then((maplibregl) => {
      if (cancelled || !mapContainerRef.current) return;

      mapInstance = new maplibregl.default.Map({
        container: mapContainerRef.current,
        style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
        center: [126.978, 37.5665],
        zoom: 11,
      });

      mapRef.current = mapInstance;

      mapInstance.on('load', () => {
        if (!cancelled && onMapReadyRef.current) {
          onMapReadyRef.current(mapInstance);
        }
      });
    });

    return () => {
      cancelled = true;
      if (mapInstance) {
        mapInstance.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="absolute inset-0" />
      {children}
    </div>
  );
}
