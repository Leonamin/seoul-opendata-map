'use client';

import { useEffect, useRef } from 'react';
import { useTimelineStore } from '@/store/timeline-store';

export function useTimeline() {
  const {
    isPlaying,
    speed,
    currentTimestamp,
    timeRange,
    timelineData,
    pause,
    setCurrentTimestamp,
  } = useTimelineStore();

  const currentTimestampRef = useRef(currentTimestamp);
  useEffect(() => {
    currentTimestampRef.current = currentTimestamp;
  }, [currentTimestamp]);

  const pauseRef = useRef(pause);
  useEffect(() => {
    pauseRef.current = pause;
  }, [pause]);

  const setCurrentTimestampRef = useRef(setCurrentTimestamp);
  useEffect(() => {
    setCurrentTimestampRef.current = setCurrentTimestamp;
  }, [setCurrentTimestamp]);

  useEffect(() => {
    if (!isPlaying || !timeRange) return;

    const timestamps = Array.from(timelineData.keys()).sort();
    if (timestamps.length === 0) return;

    // Build index map for O(1) lookup
    const indexMap = new Map<string, number>();
    timestamps.forEach((ts, i) => indexMap.set(ts, i));

    const tick = () => {
      const first = timestamps[0];
      if (!first) return;
      const current = currentTimestampRef.current ?? first;
      const idx = indexMap.get(current) ?? -1;
      const next = timestamps[idx + 1];
      if (idx === -1 || !next) {
        pauseRef.current();
        return;
      }
      setCurrentTimestampRef.current(next);
    };

    const intervalMs = 1000 / speed;
    const id = setInterval(tick, intervalMs);

    return () => clearInterval(id);
  }, [isPlaying, speed, timeRange, timelineData]);

  return useTimelineStore();
}
