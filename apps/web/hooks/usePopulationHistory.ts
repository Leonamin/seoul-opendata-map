'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useTimelineStore } from '@/store/timeline-store';
import type { PopulationHotspot } from '@seoul-opendata/shared';

interface HistoryRecord {
  locationId: string;
  name: string;
  lat: number;
  lng: number;
  population: number;
  congestionLevel: string;
  timestamp: string;
}

/**
 * Fetches population history for a location and populates the timeline store.
 * When locationId is null, clears the timeline.
 */
export function usePopulationHistory(locationId: string | null) {
  const { setTimelineData, setTimeRange, setCurrentTimestamp, pause } = useTimelineStore();

  // Default to last 24 hours
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const startDate = yesterday.toISOString();
  const endDate = now.toISOString();

  const query = useQuery({
    queryKey: ['population', 'history', locationId],
    queryFn: async () => {
      if (!locationId) return [];
      const { data } = await apiClient.get<HistoryRecord[]>('/api/population/history', {
        params: { locationId, startDate, endDate },
      });
      return data;
    },
    enabled: !!locationId,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!locationId) {
      setTimelineData(new Map());
      setTimeRange(null);
      setCurrentTimestamp('');
      pause();
      return;
    }

    const records = query.data;
    if (!records || records.length === 0) return;

    // Group records by timestamp
    const grouped = new Map<string, PopulationHotspot[]>();
    for (const r of records) {
      const ts = r.timestamp;
      if (!grouped.has(ts)) grouped.set(ts, []);
      grouped.get(ts)!.push({
        locationId: r.locationId,
        name: r.name,
        lat: r.lat,
        lng: r.lng,
        population: r.population,
        congestionLevel: r.congestionLevel as PopulationHotspot['congestionLevel'],
        timestamp: r.timestamp,
      });
    }

    const timestamps = Array.from(grouped.keys()).sort();
    if (timestamps.length > 0) {
      setTimelineData(grouped);
      setTimeRange({ start: timestamps[0]!, end: timestamps[timestamps.length - 1]! });
      setCurrentTimestamp(timestamps[0]!);
    }
  }, [query.data, locationId, setTimelineData, setTimeRange, setCurrentTimestamp, pause]);

  return query;
}
