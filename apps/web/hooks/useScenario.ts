'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { Scenario, CreateScenarioDto, ComparisonReport } from '@seoul-opendata/shared';

export function useScenarios() {
  return useQuery({
    queryKey: ['scenarios'],
    queryFn: async () => {
      const { data } = await apiClient.get<Scenario[]>('/api/scenarios');
      return data;
    },
  });
}

export function useScenario(id: string) {
  return useQuery({
    queryKey: ['scenarios', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Scenario>(`/api/scenarios/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateScenario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateScenarioDto) => {
      const { data } = await apiClient.post<Scenario>('/api/scenarios', dto);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
    },
  });
}

export function useDeleteScenario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/scenarios/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
    },
  });
}

export function useGenerateReport(scenarioId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<ComparisonReport>('/api/reports/generate', {
        scenarioId,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', scenarioId] });
    },
  });
}

export function useReport(scenarioId: string) {
  return useQuery({
    queryKey: ['reports', scenarioId],
    queryFn: async () => {
      const { data } = await apiClient.get<ComparisonReport>(
        `/api/reports/scenario/${scenarioId}`
      );
      return data;
    },
    enabled: !!scenarioId,
  });
}
