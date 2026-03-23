'use client';

import { useEffect, useRef } from 'react';
import type { PopulationHotspot } from '@seoul-opendata/shared';

interface LocationMarkerProps {
  map: unknown;
  hotspot: PopulationHotspot;
  isSelected?: boolean;
  onClick?: (hotspot: PopulationHotspot) => void;
}

type MapboxMap = {
  on: (event: string, layer: string, callback: (e: unknown) => void) => void;
};

type MapboxMarker = {
  setLngLat: (coords: [number, number]) => MapboxMarker;
  addTo: (map: unknown) => MapboxMarker;
  remove: () => void;
  getElement: () => HTMLElement;
};

const congestionColors: Record<string, string> = {
  '여유': '#3b82f6',
  '보통': '#eab308',
  '약간 붐빔': '#f97316',
  '붐빔': '#ef4444',
};

export function LocationMarker({ map, hotspot, isSelected, onClick }: LocationMarkerProps) {
  const markerRef = useRef<MapboxMarker | null>(null);

  useEffect(() => {
    if (!map) return;

    const color = congestionColors[hotspot.congestionLevel] ?? '#6b7280';

    import('maplibre-gl').then((maplibregl) => {
      if (!map) return;

      const el = document.createElement('div');
      el.className = 'location-marker';
      el.style.cssText = `
        width: ${isSelected ? '16px' : '10px'};
        height: ${isSelected ? '16px' : '10px'};
        border-radius: 50%;
        background-color: ${color};
        border: 2px solid ${isSelected ? '#fff' : 'transparent'};
        box-shadow: 0 0 8px ${color}80;
        cursor: pointer;
        transition: all 0.2s;
      `;

      if (onClick) {
        el.addEventListener('click', () => onClick(hotspot));
      }

      const marker = new maplibregl.default.Marker({ element: el })
        .setLngLat([hotspot.lng, hotspot.lat])
        .addTo(map as Parameters<typeof maplibregl.default.Marker.prototype.addTo>[0]);

      markerRef.current = marker as unknown as MapboxMarker;
    });

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, [map, hotspot, isSelected, onClick]);

  return null;
}
