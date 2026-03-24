'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { CommercialData, BusinessType } from '@seoul-opendata/shared';

export function useCommercialData(locationId: string | null, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['commercial', locationId, startDate, endDate],
    queryFn: async () => {
      if (!locationId) return [];
      const params: Record<string, string> = { locationId };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const { data } = await apiClient.get<CommercialData[]>('/api/commercial/by-location', { params });
      return data;
    },
    enabled: !!locationId,
    staleTime: 60_000,
  });
}

export function useBusinessTypes() {
  return useQuery({
    queryKey: ['commercial', 'business-types'],
    queryFn: async () => {
      const { data } = await apiClient.get<BusinessType[]>('/api/commercial/business-types');
      return data;
    },
    staleTime: Infinity,
  });
}
