import { useQuery } from '@tanstack/react-query';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { listMoodEntriesInRange } from './api';
import { moodKeys } from '@/features/mood/hooks';

/**
 * Lấy mood entries của 1 tháng. yearMonth format 'yyyy-MM' (ví dụ '2026-05').
 */
export function useMonthMoodEntries(params: {
  userId: string | undefined;
  yearMonth: string;
}) {
  const [year, month] = params.yearMonth.split('-').map(Number);
  const monthStart = new Date(year, month - 1, 1);
  const startDate = format(startOfMonth(monthStart), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(monthStart), 'yyyy-MM-dd');

  return useQuery({
    queryKey: [...moodKeys.entriesByMonth(params.userId ?? 'anon', params.yearMonth)],
    queryFn: () =>
      listMoodEntriesInRange({
        userId: params.userId!,
        startDate,
        endDate,
      }),
    enabled: !!params.userId,
  });
}
