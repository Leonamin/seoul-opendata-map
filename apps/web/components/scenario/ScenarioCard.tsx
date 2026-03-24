import Link from 'next/link';
import type { Scenario } from '@seoul-opendata/shared';

interface ScenarioCardProps {
  scenario: Scenario;
  onDelete?: (id: string) => void;
}

const statusLabels: Record<string, { label: string; dot: string; bg: string }> = {
  draft: { label: '초안', dot: 'bg-slate-400', bg: 'text-slate-400 bg-slate-400/10' },
  active: { label: '활성', dot: 'bg-blue-400', bg: 'text-blue-300 bg-blue-400/10' },
  completed: { label: '완료', dot: 'bg-emerald-400', bg: 'text-emerald-300 bg-emerald-400/10' },
};

export function ScenarioCard({ scenario, onDelete }: ScenarioCardProps) {
  const status = statusLabels[scenario.status] ?? statusLabels.draft!;
  const createdAt = new Date(scenario.createdAt).toLocaleDateString('ko-KR');

  return (
    <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] hover:border-[var(--border-hover)] transition-all p-5 group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-slate-100 font-semibold truncate">{scenario.name}</h3>
          {scenario.description && (
            <p className="text-slate-500 text-sm mt-1 line-clamp-2">{scenario.description}</p>
          )}
        </div>
        <span className={`ml-3 flex-shrink-0 inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${status.bg}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-600 mb-4">
        <span>{scenario.locations.length}개 위치</span>
        <span className="text-slate-800">&middot;</span>
        <span>{scenario.periods.length}개 기간</span>
        <span className="text-slate-800">&middot;</span>
        <span>{createdAt}</span>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={`/scenarios/${scenario.id}`}
          className="flex-1 text-center px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-all shadow-lg shadow-blue-600/20"
        >
          상세 보기
        </Link>
        <Link
          href={`/scenarios/${scenario.id}/report`}
          className="flex-1 text-center px-3 py-2 bg-[var(--surface-elevated)] hover:bg-slate-700 border border-[var(--border)] text-slate-300 text-xs font-medium rounded-lg transition-all"
        >
          리포트
        </Link>
        {onDelete && (
          <button
            onClick={() => onDelete(scenario.id)}
            className="px-3 py-2 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all text-xs"
          >
            삭제
          </button>
        )}
      </div>
    </div>
  );
}
