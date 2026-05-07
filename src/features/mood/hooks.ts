import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMoodEntry, upsertMoodEntry } from './api';
import type { MoodEntryInput } from './types';

const moodKeys = {
  all: ['mood'] as const,
  entry: (userId: string, date: string) => [...moodKeys.all, 'entry', userId, date] as const,
  entriesByMonth: (userId: string, yearMonth: string) =>
    [...moodKeys.all, 'month', userId, yearMonth] as const,
};

export function useMoodEntry(params: { userId: string | undefined; date: string }) {
  return useQuery({
    queryKey: moodKeys.entry(params.userId ?? 'anon', params.date),
    queryFn: () => getMoodEntry({ userId: params.userId!, date: params.date }),
    enabled: !!params.userId,
  });
}

export function useSaveMoodEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { userId: string; input: MoodEntryInput }) =>
      upsertMoodEntry(params),
    onSuccess: (data) => {
      // Invalidate entry cụ thể + month aggregation (Phase 3 garden + Phase 6 stats sẽ dùng)
      qc.invalidateQueries({ queryKey: moodKeys.entry(data.user_id, data.entry_date) });
      qc.invalidateQueries({ queryKey: moodKeys.all });
    },
  });
}

export { moodKeys };
