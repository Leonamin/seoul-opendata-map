'use client';

import { useState } from 'react';
import type { PopulationHotspot, ScenarioPeriod } from '@seoul-opendata/shared';

interface PeriodCompareProps {
  periods: ScenarioPeriod[];
  periodData: Record<string, PopulationHotspot[]>;
  map: unknown;
}

export function PeriodCompare({ periods, periodData, map }: PeriodCompareProps) {
  const [activePeriod, setActivePeriod] = useState<string>(periods[0]?.id ?? '');

  const currentData = periodData[activePeriod] ?? [];

  const totalPop = currentData.reduce((sum, h) => sum + h.population, 0);
  const avgPop = currentData.length > 0 ? Math.round(totalPop / currentData.length) : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-sm">기간:</span>
        {periods.map((period) => (
          <button
            key={period.id}
            onClick={() => setActivePeriod(period.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activePeriod === period.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {period.label}
            {period.isBaseline && (
              <span className="ml-1 text-xs opacity-70">(기준)</span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {periods.map((period) => {
          const data = periodData[period.id] ?? [];
          const pop = data.reduce((s, h) => s + h.population, 0);
          const avg = data.length > 0 ? Math.round(pop / data.length) : 0;
          const isActive = activePeriod === period.id;

          return (
            <div
              key={period.id}
              className={`rounded-xl p-4 border transition-colors ${
                isActive
                  ? 'bg-blue-900/30 border-blue-600'
                  : 'bg-gray-800 border-gray-700'
              }`}
            >
              <p className="text-sm font-medium text-gray-300 mb-2">{period.label}</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">평균 인구</span>
                  <span className="text-gray-200">{avg.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">총 인구</span>
                  <span className="text-gray-200">{pop.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">지점 수</span>
                  <span className="text-gray-200">{data.length}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
