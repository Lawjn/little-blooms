import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { listMoodEntriesInRange } from '@/features/garden/api';
import { listPulsesInRange } from '@/features/pulse/api';
import { moodKeys } from '@/features/mood/hooks';
import type { MoodEntry } from '@/features/mood/types';
import type { MoodLevel } from '@/lib/theme';

export function useStatsRange(params: {
  userId: string | undefined;
  startDate: Date;
  endDate: Date;
}) {
  const start = format(params.startDate, 'yyyy-MM-dd');
  const end = format(params.endDate, 'yyyy-MM-dd');

  const entriesQuery = useQuery({
    queryKey: [...moodKeys.all, 'stats-range', params.userId ?? 'anon', start, end],
    queryFn: () =>
      listMoodEntriesInRange({
        userId: params.userId!,
        startDate: start,
        endDate: end,
      }),
    enabled: !!params.userId,
  });

  const pulsesQuery = useQuery({
    queryKey: ['pulses', 'stats-range', params.userId ?? 'anon', start, end],
    queryFn: () =>
      listPulsesInRange({
        userId: params.userId!,
        startDate: start,
        endDate: end,
      }),
    enabled: !!params.userId,
  });

  // Enhanced data: merge entries với synthetic entries từ pulse-only days.
  const enhancedData = useMemo<MoodEntry[]>(() => {
    if (!entriesQuery.data) return [];
    const realEntries = entriesQuery.data;
    const pulses = pulsesQuery.data ?? [];
    const realDates = new Set(realEntries.map((e) => e.entry_date));

    const pulsesByDate = new Map<string, { sum: number; count: number }>();
    for (const p of pulses) {
      const date = format(parseISO(p.logged_at), 'yyyy-MM-dd');
      const acc = pulsesByDate.get(date) ?? { sum: 0, count: 0 };
      acc.sum += p.mood_level;
      acc.count += 1;
      pulsesByDate.set(date, acc);
    }

    const synthetic: MoodEntry[] = [];
    for (const [date, { sum, count }] of pulsesByDate.entries()) {
      if (realDates.has(date)) continue;
      const avg = Math.max(1, Math.min(5, Math.round(sum / count))) as MoodLevel;
      synthetic.push({
        id: `synthetic-${date}`,
        user_id: params.userId ?? '',
        entry_date: date,
        mood_level: avg,
        emotions: [],
        hobbies: [],
        meals: [],
        self_care: [],
        weather: [],
        other_tags: [],
        note: null,
        photo_urls: [],
        created_at: '',
        updated_at: '',
      });
    }

    return [...realEntries, ...synthetic];
  }, [entriesQuery.data, pulsesQuery.data, params.userId]);

  return {
    data: enhancedData,
    isLoading: entriesQuery.isLoading || pulsesQuery.isLoading,
    error: entriesQuery.error || pulsesQuery.error,
  };
}
