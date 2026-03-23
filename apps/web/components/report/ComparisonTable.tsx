import type { ChangeRateData } from '@seoul-opendata/shared';

interface ComparisonTableProps {
  data: ChangeRateData[];
}

function formatChange(rate: number) {
  const sign = rate >= 0 ? '+' : '';
  return `${sign}${rate.toFixed(1)}%`;
}

function changeColor(rate: number) {
  if (rate > 0) return 'text-green-400';
  if (rate < 0) return 'text-red-400';
  return 'text-gray-400';
}

export function ComparisonTable({ data }: ComparisonTableProps) {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-700">
        <h3 className="text-gray-300 text-sm font-medium">위치별 비교 데이터</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 bg-gray-900/50">
              <th className="text-left px-4 py-3 text-gray-400 font-medium">위치</th>
              <th className="text-right px-4 py-3 text-gray-400 font-medium">기준 평균 인구</th>
              <th className="text-right px-4 py-3 text-gray-400 font-medium">비교 평균 인구</th>
              <th className="text-right px-4 py-3 text-gray-400 font-medium">인구 변화율</th>
              <th className="text-right px-4 py-3 text-gray-400 font-medium">매출 변화율</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {data.map((row) => (
              <tr key={row.locationId} className="hover:bg-gray-700/30 transition-colors">
                <td className="px-4 py-3 text-gray-200 font-medium">{row.locationName}</td>
                <td className="px-4 py-3 text-right text-gray-300">
                  {row.baselineAvgPopulation.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-gray-300">
                  {row.comparisonAvgPopulation.toLocaleString()}
                </td>
                <td className={`px-4 py-3 text-right font-medium ${changeColor(row.populationChangeRate)}`}>
                  {formatChange(row.populationChangeRate)}
                </td>
                <td className={`px-4 py-3 text-right font-medium ${row.salesChangeRate != null ? changeColor(row.salesChangeRate) : 'text-gray-600'}`}>
                  {row.salesChangeRate != null ? formatChange(row.salesChangeRate) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
