'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useScenario, useReport, useGenerateReport } from '@/hooks/useScenario';
import { ReportSummary } from '@/components/report/ReportSummary';
import { ChangeRateChart } from '@/components/report/ChangeRateChart';
import { ComparisonTable } from '@/components/report/ComparisonTable';
import { Button } from '@/components/ui/Button';

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: scenario } = useScenario(id);
  const { data: report, isLoading: reportLoading } = useReport(id);
  const { mutateAsync: generateReport, isPending } = useGenerateReport(id);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerateError(null);
    try {
      await generateReport();
    } catch {
      setGenerateError('리포트 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/scenarios/${id}`} className="text-gray-500 hover:text-gray-300 text-sm">
              ← 시나리오
            </Link>
            <span className="text-gray-700">/</span>
            <h1 className="text-lg font-semibold text-gray-100">
              {scenario?.name ?? '리포트'} — 비교 분석
            </h1>
          </div>
          <Button onClick={handleGenerate} disabled={isPending} variant="secondary" size="sm">
            {isPending ? '생성 중...' : '리포트 재생성'}
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {generateError && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-4">
            <p className="text-red-300 text-sm">{generateError}</p>
          </div>
        )}

        {reportLoading && (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 mt-3">리포트 로딩 중...</p>
          </div>
        )}

        {!reportLoading && !report && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-gray-300 font-medium mb-2">리포트가 없습니다</h2>
            <p className="text-gray-500 text-sm mb-6">리포트를 생성하면 기간별 인구 및 매출 변화를 확인할 수 있습니다.</p>
            <Button onClick={handleGenerate} disabled={isPending}>
              {isPending ? '생성 중...' : '리포트 생성하기'}
            </Button>
          </div>
        )}

        {report && (
          <>
            <div>
              <h2 className="text-gray-400 text-xs uppercase tracking-wider mb-4">요약</h2>
              <ReportSummary reportData={report.reportData} />
            </div>

            <div>
              <h2 className="text-gray-400 text-xs uppercase tracking-wider mb-4">위치별 변화율</h2>
              <ChangeRateChart data={report.reportData.changeRates} />
            </div>

            <div>
              <h2 className="text-gray-400 text-xs uppercase tracking-wider mb-4">상세 비교 데이터</h2>
              <ComparisonTable data={report.reportData.changeRates} />
            </div>

            <p className="text-gray-600 text-xs text-right">
              생성일: {new Date(report.generatedAt).toLocaleString('ko-KR')}
            </p>
          </>
        )}
      </main>
    </div>
  );
}
