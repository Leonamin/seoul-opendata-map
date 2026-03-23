'use client';

interface TimelineSliderProps {
  min: string;
  max: string;
  current: string;
  timestamps: string[];
  onChange: (timestamp: string) => void;
}

function formatTimestamp(ts: string) {
  try {
    return new Date(ts).toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return ts;
  }
}

export function TimelineSlider({
  min,
  max,
  current,
  timestamps,
  onChange,
}: TimelineSliderProps) {
  const currentIdx = timestamps.indexOf(current);
  const maxIdx = Math.max(0, timestamps.length - 1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const idx = parseInt(e.target.value, 10);
    if (timestamps[idx]) onChange(timestamps[idx]);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between text-xs text-gray-400">
        <span>{formatTimestamp(min)}</span>
        <span className="text-gray-200 font-medium">{formatTimestamp(current)}</span>
        <span>{formatTimestamp(max)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={maxIdx}
        value={currentIdx >= 0 ? currentIdx : 0}
        onChange={handleChange}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
    </div>
  );
}
