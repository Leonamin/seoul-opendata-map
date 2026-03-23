'use client';

import type { ChangeRateData } from '@seoul-opendata/shared';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';

interface ChangeRateChartProps {
  data: ChangeRateData[];
}

export function ChangeRateChart({ data }: ChangeRateChartProps) {
  const chartData = data.map((d) => ({
    name: d.locationName.length > 6 ? d.locationName.slice(0, 6) + '…' : d.locationName,
    인구변화율: parseFloat(d.populationChangeRate.toFixed(1)),
    매출변화율: d.salesChangeRate != null ? parseFloat(d.salesChangeRate.toFixed(1)) : null,
  }));

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
      <h3 className="text-gray-300 text-sm font-medium mb-4">위치별 변화율 (%)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
          <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} unit="%" />
          <ReferenceLine y={0} stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#e5e7eb' }}
          />
          <Legend
            wrapperStyle={{ color: '#9ca3af', fontSize: '12px' }}
          />
          <Bar dataKey="인구변화율" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={entry['인구변화율'] >= 0 ? '#3b82f6' : '#ef4444'}
              />
            ))}
          </Bar>
          <Bar dataKey="매출변화율" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  entry['매출변화율'] == null
                    ? '#4b5563'
                    : entry['매출변화율'] >= 0
                    ? '#22c55e'
                    : '#f97316'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
