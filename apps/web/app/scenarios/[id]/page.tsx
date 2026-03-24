'use client';

import { use, useState, useCallback } from 'react';
import Link from 'next/link';
import { useScenario } from '@/hooks/useScenario';
import { MapContainer } from '@/components/map/MapContainer';
import { PopulationHeatmap } from '@/components/map/PopulationHeatmap';
import { LayerControls } from '@/components/map/LayerControls';
import { PeriodCompare } from '@/components/scenario/PeriodCompare';
import { TimelineSlider } from '@/components/timeline/TimelineSlider';
import { PlaybackControls } from '@/components/timeline/PlaybackControls';
import { useTimelineStore } from '@/store/timeline-store';
import { useMapStore } from '@/store/map-store';
import type { PopulationHotspot } from '@seoul-opendata/shared';

export default function ScenarioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: scenario, isLoading } = useScenario(id);
  const [mapInstance, setMapInstance] = useState<object | null>(null);
  const { activeLayer, heatmapIntensity } = useMapStore();
  const { currentTimestamp, timeRange, timelineData, setCurrentTimestamp } = useTimelineStore();

  const handleMapReady = useCallback((m: unknown) => setMapInstance(m as object), []);

  const timestamps = Array.from(timelineData.keys()).sort();
  const currentData: PopulationHotspot[] = currentTimestamp
    ? (timelineData.get(currentTimestamp) ?? [])
    : [];

  const periodData: Record<string, PopulationHotspot[]> = {};
  if (scenario) {
    for (const period of scenario.periods) {
      periodData[period.id] = [];
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm mt-4">불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400">시나리오를 찾을 수 없습니다.</p>
          <Link href="/scenarios" className="text-blue-400 hover:text-blue-300 text-sm mt-2 block">
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[var(--background)]">
      <header className="flex-shrink-0 flex items-center justify-between px-5 py-2.5 bg-[var(--surface)]/80 backdrop-blur-xl border-b border-[var(--border)] z-20">
        <div className="flex items-center gap-3">
          <Link href="/scenarios" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
            &larr; 목록
          </Link>
          <span className="text-slate-800">/</span>
          <h1 className="text-sm font-semibold text-slate-100">{scenario.name}</h1>
        </div>
        <Link
          href={`/scenarios/${id}/report`}
          className="px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-all shadow-lg shadow-emerald-600/20"
        >
          리포트 생성
        </Link>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          <MapContainer onMapReady={handleMapReady}>
            {mapInstance !== null && (
              <PopulationHeatmap
                map={mapInstance}
                data={currentData}
                intensity={heatmapIntensity}
                visible={activeLayer.population}
              />
            )}
            <LayerControls />
          </MapContainer>
        </div>

        <div className="w-72 flex-shrink-0 bg-[var(--surface)] border-l border-[var(--border)] overflow-y-auto">
          <div className="p-5 space-y-5">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-2.5">시나리오 정보</p>
              {scenario.description && (
                <p className="text-slate-300 text-sm mb-3">{scenario.description}</p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {scenario.locations.map((loc) => (
                  <span key={loc.id} className="px-2 py-1 bg-[var(--surface-elevated)] border border-[var(--border)] text-slate-300 text-xs rounded-md">
                    {loc.location?.name ?? loc.locationId}
                  </span>
                ))}
              </div>
            </div>

            <PeriodCompare
              periods={scenario.periods}
              periodData={periodData}
              map={mapInstance}
            />
          </div>
        </div>
      </div>

      {timestamps.length > 0 && timeRange && (
        <div className="flex-shrink-0 bg-[var(--surface)]/90 backdrop-blur-xl border-t border-[var(--border)] px-5 py-3">
          <div className="flex items-center gap-4">
            <PlaybackControls />
            <div className="flex-1">
              <TimelineSlider
                min={timeRange.start}
                max={timeRange.end}
                current={currentTimestamp ?? timeRange.start}
                timestamps={timestamps}
                onChange={setCurrentTimestamp}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
