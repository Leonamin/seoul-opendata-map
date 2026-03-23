'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LocationPicker } from './LocationPicker';
import { Button } from '@/components/ui/Button';

interface PeriodInput {
  label: string;
  startDate: string;
  endDate: string;
  isBaseline: boolean;
}

interface ScenarioFormProps {
  onSubmit: (data: {
    name: string;
    description: string;
    locationIds: string[];
    periods: PeriodInput[];
  }) => Promise<void>;
  isLoading?: boolean;
}

const emptyPeriod = (): PeriodInput => ({
  label: '',
  startDate: '',
  endDate: '',
  isBaseline: false,
});

export function ScenarioForm({ onSubmit, isLoading }: ScenarioFormProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [locationIds, setLocationIds] = useState<string[]>([]);
  const [periods, setPeriods] = useState<PeriodInput[]>([
    { ...emptyPeriod(), label: '기간 A', isBaseline: true },
    { ...emptyPeriod(), label: '기간 B' },
  ]);
  const [errors, setErrors] = useState<string[]>([]);

  const validate = () => {
    const errs: string[] = [];
    if (!name.trim()) errs.push('시나리오 이름을 입력하세요.');
    if (locationIds.length < 2) errs.push('최소 2개 위치를 선택하세요.');
    if (periods.length < 2) errs.push('최소 2개 기간을 추가하세요.');
    periods.forEach((p, i) => {
      if (!p.label.trim()) errs.push(`기간 ${i + 1}의 레이블을 입력하세요.`);
      if (!p.startDate) errs.push(`기간 ${i + 1}의 시작일을 입력하세요.`);
      if (!p.endDate) errs.push(`기간 ${i + 1}의 종료일을 입력하세요.`);
      if (p.startDate && p.endDate && p.startDate >= p.endDate)
        errs.push(`기간 ${i + 1}의 종료일이 시작일보다 이후여야 합니다.`);
    });
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (errs.length > 0) { setErrors(errs); return; }
    setErrors([]);
    await onSubmit({ name, description, locationIds, periods });
  };

  const updatePeriod = (idx: number, field: keyof PeriodInput, value: string | boolean) => {
    setPeriods((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)));
  };

  const addPeriod = () => setPeriods((prev) => [...prev, { ...emptyPeriod(), label: `기간 ${String.fromCharCode(65 + prev.length)}` }]);
  const removePeriod = (idx: number) => setPeriods((prev) => prev.filter((_, i) => i !== idx));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.length > 0 && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
          <ul className="space-y-1">
            {errors.map((e, i) => (
              <li key={i} className="text-red-300 text-sm">{e}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            시나리오 이름 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 강남구 여름 vs 겨울 비교"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="시나리오에 대한 설명을 입력하세요"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
        <LocationPicker
          selectedIds={locationIds}
          onChange={setLocationIds}
        />
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-300">기간 설정</h3>
          <Button type="button" variant="secondary" size="sm" onClick={addPeriod}>
            + 기간 추가
          </Button>
        </div>

        <div className="space-y-4">
          {periods.map((period, idx) => (
            <div key={idx} className="bg-gray-700/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={period.label}
                    onChange={(e) => updatePeriod(idx, 'label', e.target.value)}
                    placeholder="기간 레이블"
                    className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-200 text-sm w-32 focus:outline-none focus:border-blue-500"
                  />
                  <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={period.isBaseline}
                      onChange={(e) => updatePeriod(idx, 'isBaseline', e.target.checked)}
                      className="accent-blue-500"
                    />
                    기준 기간
                  </label>
                </div>
                {periods.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removePeriod(idx)}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    삭제
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">시작일</label>
                  <input
                    type="date"
                    value={period.startDate}
                    onChange={(e) => updatePeriod(idx, 'startDate', e.target.value)}
                    className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-gray-200 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">종료일</label>
                  <input
                    type="date"
                    value={period.endDate}
                    onChange={(e) => updatePeriod(idx, 'endDate', e.target.value)}
                    className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-gray-200 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? '저장 중...' : '시나리오 생성'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          취소
        </Button>
      </div>
    </form>
  );
}
