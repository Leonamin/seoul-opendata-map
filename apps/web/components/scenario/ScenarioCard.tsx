import Link from 'next/link';
import type { Scenario } from '@seoul-opendata/shared';

interface ScenarioCardProps {
  scenario: Scenario;
  onDelete?: (id: string) => void;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: '초안', color: 'text-gray-400 bg-gray-700' },
  active: { label: '활성', color: 'text-blue-400 bg-blue-900/40' },
  completed: { label: '완료', color: 'text-green-400 bg-green-900/40' },
};

export function ScenarioCard({ scenario, onDelete }: ScenarioCardProps) {
  const status = statusLabels[scenario.status] ?? { label: '초안', color: 'text-gray-400 bg-gray-700' };
  const createdAt = new Date(scenario.createdAt).toLocaleDateString('ko-KR');

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg hover:border-gray-600 transition-colors p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-100 font-semibold truncate">{scenario.name}</h3>
          {scenario.description && (
            <p className="text-gray-400 text-sm mt-1 line-clamp-2">{scenario.description}</p>
          )}
        </div>
        <span className={`ml-3 flex-shrink-0 px-2 py-1 rounded-md text-xs font-medium ${status.color}`}>
          {status.label}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
        <span>{scenario.locations.length}개 위치</span>
        <span>{scenario.periods.length}개 기간</span>
        <span>{createdAt}</span>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={`/scenarios/${scenario.id}`}
          className="flex-1 text-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
        >
          상세 보기
        </Link>
        <Link
          href={`/scenarios/${scenario.id}/report`}
          className="flex-1 text-center px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
        >
          리포트
        </Link>
        {onDelete && (
          <button
            onClick={() => onDelete(scenario.id)}
            className="px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors text-sm"
          >
            삭제
          </button>
        )}
      </div>
    </div>
  );
}
