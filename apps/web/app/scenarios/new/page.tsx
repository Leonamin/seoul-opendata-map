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
    <div className="min-h-screen bg-gray-900">
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/scenarios" className="text-gray-500 hover:text-gray-300 text-sm">
            ← 목록으로
          </Link>
          <span className="text-gray-700">/</span>
          <h1 className="text-lg font-semibold text-gray-100">새 시나리오 만들기</h1>
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
