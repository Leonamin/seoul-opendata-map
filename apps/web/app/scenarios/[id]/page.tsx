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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 mt-3">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">시나리오를 찾을 수 없습니다.</p>
          <Link href="/scenarios" className="text-blue-400 hover:text-blue-300 text-sm mt-2 block">
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Link href="/scenarios" className="text-gray-500 hover:text-gray-300 text-sm">
            ← 목록
          </Link>
          <span className="text-gray-700">/</span>
          <h1 className="text-base font-semibold text-gray-100">{scenario.name}</h1>
        </div>
        <Link
          href={`/scenarios/${id}/report`}
          className="px-4 py-2 text-sm bg-green-700 hover:bg-green-600 text-white rounded-lg transition-colors"
        >
          리포트 생성
        </Link>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
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

        {/* Side panel */}
        <div className="w-80 flex-shrink-0 bg-gray-800 border-l border-gray-700 overflow-y-auto">
          <div className="p-5 space-y-6">
            <div>
              <h2 className="text-sm font-medium text-gray-400 mb-3">시나리오 정보</h2>
              {scenario.description && (
                <p className="text-gray-300 text-sm mb-3">{scenario.description}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {scenario.locations.map((loc) => (
                  <span key={loc.id} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-md">
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
        <div className="flex-shrink-0 bg-gray-900/95 border-t border-gray-800 px-6 py-4">
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
