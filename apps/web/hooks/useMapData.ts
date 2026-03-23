'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { PopulationRealtimeResponse } from '@seoul-opendata/shared';

export function useMapData() {
  return useQuery({
    queryKey: ['population', 'realtime'],
    queryFn: async () => {
      const { data } = await apiClient.get<PopulationRealtimeResponse>(
        '/api/population/realtime'
      );
      return data;
    },
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}
