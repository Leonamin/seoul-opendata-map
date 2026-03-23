'use client';

import type { ReportData } from '@seoul-opendata/shared';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ReportSummaryProps {
  reportData: ReportData;
}

export function ReportSummary({ reportData }: ReportSummaryProps) {
  const { summary, changeRates, locationMetrics } = reportData;

  const avgPop =
    locationMetrics.length > 0
      ? Math.round(
          locationMetrics.reduce((sum, lm) => {
            const baseline = lm.periods.find((p) => p.periodLabel === summary.baselinePeriod);
            return sum + (baseline?.avgPopulation ?? 0);
          }, 0) / locationMetrics.length
        )
      : 0;

  const peakPop =
    locationMetrics.length > 0
      ? Math.max(
          ...locationMetrics.flatMap((lm) => lm.periods.map((p) => p.peakPopulation))
        )
      : 0;

  const avgChangeRate =
    changeRates.length > 0
      ? changeRates.reduce((sum, cr) => sum + cr.populationChangeRate, 0) / changeRates.length
      : 0;

  const cards = [
    { label: '분석 위치', value: summary.totalLocations, unit: '개' },
    { label: '분석 기간', value: summary.totalPeriods, unit: '개' },
    { label: '기준 기간 평균 인구', value: avgPop.toLocaleString(), unit: '명' },
    { label: '최대 인구', value: peakPop.toLocaleString(), unit: '명' },
    {
      label: '평균 인구 변화율',
      value: `${avgChangeRate >= 0 ? '+' : ''}${avgChangeRate.toFixed(1)}`,
      unit: '%',
      color: avgChangeRate >= 0 ? 'text-green-400' : 'text-red-400',
    },
  ];

  const chartData = changeRates.map((cr) => ({
    name: cr.locationName.length > 6 ? cr.locationName.slice(0, 6) + '…' : cr.locationName,
    rate: parseFloat(cr.populationChangeRate.toFixed(1)),
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {cards.map((card) => (
          <div key={card.label} className="bg-gray-800 rounded-xl border border-gray-700 p-4">
            <p className="text-gray-500 text-xs mb-1">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color ?? 'text-gray-100'}`}>
              {card.value}
              <span className="text-sm font-normal text-gray-400 ml-1">{card.unit}</span>
            </p>
          </div>
        ))}
      </div>

      {chartData.length > 0 && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <h3 className="text-gray-300 text-sm font-medium mb-4">인구 변화율 (기준 기간 대비 %)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#e5e7eb' }}
                itemStyle={{ color: '#93c5fd' }}
              />
              <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.rate >= 0 ? '#22c55e' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
