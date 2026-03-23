'use client';

import { useMapStore } from '@/store/map-store';

export function LayerControls() {
  const { activeLayer, heatmapIntensity, setActiveLayer, setHeatmapIntensity } = useMapStore();

  return (
    <div className="absolute top-4 right-4 z-10 glass rounded-xl shadow-2xl shadow-black/20 p-4 w-52">
      <h3 className="text-slate-300 font-semibold text-xs uppercase tracking-wider mb-3">레이어</h3>

      <div className="space-y-2.5">
        {/* Population toggle */}
        <label className="flex items-center justify-between cursor-pointer group">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full transition-colors ${activeLayer.population ? 'bg-blue-400 shadow-[0_0_4px_rgba(96,165,250,0.5)]' : 'bg-slate-600'}`} />
            <span className="text-slate-300 text-sm group-hover:text-slate-200 transition-colors">인구 밀도</span>
          </div>
          <button
            onClick={() => setActiveLayer('population', !activeLayer.population)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all ${
              activeLayer.population ? 'bg-blue-600 shadow-[0_0_8px_rgba(59,130,246,0.3)]' : 'bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
                activeLayer.population ? 'translate-x-[18px]' : 'translate-x-[3px]'
              }`}
            />
          </button>
        </label>

        {/* Commercial toggle */}
        <label className="flex items-center justify-between cursor-pointer group">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full transition-colors ${activeLayer.commercial ? 'bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.5)]' : 'bg-slate-600'}`} />
            <span className="text-slate-300 text-sm group-hover:text-slate-200 transition-colors">상업 데이터</span>
          </div>
          <button
            onClick={() => setActiveLayer('commercial', !activeLayer.commercial)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all ${
              activeLayer.commercial ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]' : 'bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
                activeLayer.commercial ? 'translate-x-[18px]' : 'translate-x-[3px]'
              }`}
            />
          </button>
        </label>

        {/* Heatmap intensity slider */}
        {activeLayer.population && (
          <div className="pt-2 mt-1 border-t border-white/5">
            <div className="flex justify-between mb-2">
              <span className="text-slate-500 text-xs">히트맵 강도</span>
              <span className="text-slate-400 text-xs font-mono tabular-nums">{heatmapIntensity.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={heatmapIntensity}
              onChange={(e) => setHeatmapIntensity(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 pt-3 border-t border-white/5">
        <p className="text-slate-500 text-[11px] uppercase tracking-wider mb-2">혼잡도</p>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.4)]" />
            <span className="text-slate-400">여유</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.4)]" />
            <span className="text-slate-400">보통</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_4px_rgba(248,113,113,0.4)]" />
            <span className="text-slate-400">붐빔</span>
          </div>
        </div>
      </div>
    </div>
  );
}
