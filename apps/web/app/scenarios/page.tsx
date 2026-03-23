'use client';

import Link from 'next/link';
import { useScenarios, useDeleteScenario } from '@/hooks/useScenario';
import { ScenarioCard } from '@/components/scenario/ScenarioCard';
import { Button } from '@/components/ui/Button';

export default function ScenariosPage() {
  const { data: scenarios, isLoading, error } = useScenarios();
  const { mutate: deleteScenario } = useDeleteScenario();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] px-6 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/map" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
              &larr; 지도
            </Link>
            <span className="text-slate-800">/</span>
            <h1 className="text-sm font-semibold text-slate-200">시나리오</h1>
          </div>
          <Link href="/scenarios/new">
            <Button size="sm">+ 새 시나리오</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {isLoading && (
          <div className="text-center py-24">
            <div className="inline-block w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-slate-500 text-sm mt-4">불러오는 중...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-6 text-center">
            <p className="text-red-300 text-sm">시나리오를 불러오는 데 실패했습니다.</p>
          </div>
        )}

        {scenarios && scenarios.length === 0 && (
          <div className="text-center py-24">
            <div className="w-14 h-14 bg-[var(--surface)] border border-[var(--border)] rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-slate-300 font-medium mb-1.5">시나리오가 없습니다</h2>
            <p className="text-slate-600 text-sm mb-6">새 시나리오를 만들어 지역별 인구 변화를 분석하세요.</p>
            <Link href="/scenarios/new">
              <Button>첫 시나리오 만들기</Button>
            </Link>
          </div>
        )}

        {scenarios && scenarios.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                onDelete={(id) => deleteScenario(id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
