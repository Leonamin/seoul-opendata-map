'use client';

import { useState, useCallback } from 'react';
import { MapContainer } from '@/components/map/MapContainer';
import { PopulationHeatmap } from '@/components/map/PopulationHeatmap';
import { CommercialLayer } from '@/components/map/CommercialLayer';
import { DistrictLayer } from '@/components/map/DistrictLayer';
import { LayerControls } from '@/components/map/LayerControls';
import { TimelineSlider } from '@/components/timeline/TimelineSlider';
import { PlaybackControls } from '@/components/timeline/PlaybackControls';
import { useMapData } from '@/hooks/useMapData';
import { useMapStore } from '@/store/map-store';
import { useTimelineStore } from '@/store/timeline-store';
import Link from 'next/link';

interface SelectedDistrictInfo {
  code: string;
  name: string;
}

export default function MapPage() {
  const [mapInstance, setMapInstance] = useState<object | null>(null);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [activeDistrict, setActiveDistrict] = useState<SelectedDistrictInfo | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { data, isLoading, error } = useMapData();
  const { activeLayer, heatmapIntensity } = useMapStore();
  const { currentTimestamp, timeRange, timelineData, setCurrentTimestamp } = useTimelineStore();

  const handleMapReady = useCallback((m: unknown) => {
    setMapInstance(m as object);
  }, []);

  const handleDistrictSelect = useCallback((code: string, name: string) => {
    setSelectedDistricts((prev) => {
      const exists = prev.includes(code);
      return exists ? prev.filter((c) => c !== code) : [...prev, code];
    });
    setActiveDistrict({ code, name });
    setSidebarOpen(true);
  }, []);

  const hotspots = data?.hotspots ?? [];
  const timestamps = Array.from(timelineData.keys()).sort();
  const currentData = currentTimestamp
    ? (timelineData.get(currentTimestamp) ?? hotspots)
    : hotspots;

  const isDistrictSelected = activeDistrict ? selectedDistricts.includes(activeDistrict.code) : false;

  return (
    <div className="flex flex-col h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-5 py-2.5 bg-[var(--surface)]/80 backdrop-blur-xl border-b border-[var(--border)] z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <h1 className="text-sm font-semibold tracking-tight text-slate-100">서울 실시간 생활인구</h1>
          </div>

          <div className="h-4 w-px bg-slate-700/50" />

          {isLoading && (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-xs text-blue-400/80">동기화 중</span>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <span className="text-xs text-red-400/80">연결 실패</span>
            </div>
          )}
          {data && !isLoading && (
            <span className="text-xs text-slate-500">
              {hotspots.length}개 지점 &middot; {new Date(data.fetchedAt).toLocaleTimeString('ko-KR')}
            </span>
          )}
        </div>

        <nav className="flex items-center gap-2">
          <Link
            href="/scenarios"
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-md transition-all"
          >
            시나리오
          </Link>
          <Link
            href="/scenarios/new"
            className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-all shadow-lg shadow-blue-600/20"
          >
            + 새 시나리오
          </Link>
        </nav>
      </header>

      {/* Map + Side Panel */}
      <div className="flex-1 relative flex overflow-hidden">
        <div className="flex-1 relative">
          <MapContainer onMapReady={handleMapReady}>
            {mapInstance !== null && activeLayer.population && (
              <PopulationHeatmap
                map={mapInstance}
                data={currentData}
                intensity={heatmapIntensity}
                visible={activeLayer.population}
              />
            )}
            {mapInstance !== null && activeLayer.commercial && (
              <CommercialLayer
                map={mapInstance}
                data={[]}
                visible={activeLayer.commercial}
              />
            )}
            {mapInstance !== null && (
              <DistrictLayer
                map={mapInstance}
                selectedDistricts={selectedDistricts}
                onDistrictSelect={handleDistrictSelect}
              />
            )}
            <LayerControls />
          </MapContainer>
        </div>

        {/* District info side panel */}
        {activeDistrict && sidebarOpen && (
          <div className="w-72 flex-shrink-0 bg-[var(--surface)] border-l border-[var(--border)] flex flex-col z-10 animate-in slide-in-from-right">
            {/* Panel Header */}
            <div className="px-5 py-4 border-b border-[var(--border)]">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-100">{activeDistrict.name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5 font-mono">{activeDistrict.code}</p>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 -mr-1 text-slate-500 hover:text-slate-300 hover:bg-white/5 rounded-md transition-colors"
                  aria-label="닫기"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {/* Status Card */}
              <div className="rounded-lg bg-[var(--surface-elevated)] p-3.5 border border-[var(--border)]">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-1.5">상태</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isDistrictSelected ? 'bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.5)]' : 'bg-slate-600'}`} />
                  <p className={`text-sm font-medium ${isDistrictSelected ? 'text-blue-300' : 'text-slate-400'}`}>
                    {isDistrictSelected ? '분석 대상 선택됨' : '선택 안 됨'}
                  </p>
                </div>
              </div>

              {/* Population Card */}
              <div className="rounded-lg bg-[var(--surface-elevated)] p-3.5 border border-[var(--border)]">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-1.5">인구 데이터</p>
                <p className="text-2xl font-bold text-slate-200 tabular-nums">--</p>
                <p className="text-xs text-slate-500 mt-1">실시간 생활인구</p>
              </div>

              {/* Congestion Card */}
              <div className="rounded-lg bg-[var(--surface-elevated)] p-3.5 border border-[var(--border)]">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-1.5">혼잡도</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <p className="text-sm text-slate-300">데이터 대기 중</p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleDistrictSelect(activeDistrict.code, activeDistrict.name)}
                className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  isDistrictSelected
                    ? 'bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
                }`}
              >
                {isDistrictSelected ? '선택 해제' : '분석 대상 추가'}
              </button>
            </div>

            {/* Selected Districts */}
            {selectedDistricts.length > 0 && (
              <div className="px-5 py-4 border-t border-[var(--border)]">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-2.5">
                  선택된 구 ({selectedDistricts.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDistricts.map((code) => (
                    <span
                      key={code}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 border border-blue-500/15 rounded-md text-xs text-blue-300 font-mono"
                    >
                      {code}
                      <button
                        onClick={() => setSelectedDistricts((prev) => prev.filter((c) => c !== code))}
                        className="hover:text-white ml-0.5 opacity-50 hover:opacity-100 transition-opacity"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Timeline bar */}
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
