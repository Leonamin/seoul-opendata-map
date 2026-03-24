'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ScenarioForm } from '@/components/scenario/ScenarioForm';
import { useCreateScenario } from '@/hooks/useScenario';

export default function NewScenarioPage() {
  const router = useRouter();
  const { mutateAsync: createScenario, isPending } = useCreateScenario();

  const handleSubmit = async (data: {
    name: string;
    description: string;
    locationIds: string[];
    periods: { label: string; startDate: string; endDate: string; isBaseline: boolean }[];
  }) => {
    const scenario = await createScenario({
      name: data.name,
      description: data.description,
      locationIds: data.locationIds,
      periods: data.periods,
    });
    router.push(`/scenarios/${scenario.id}`);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] px-6 py-3.5">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/scenarios" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
            &larr; 목록
          </Link>
          <span className="text-slate-800">/</span>
          <h1 className="text-sm font-semibold text-slate-200">새 시나리오</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <ScenarioForm
          onSubmit={handleSubmit}
          isLoading={isPending}
        />
      </main>
    </div>
  );
}
