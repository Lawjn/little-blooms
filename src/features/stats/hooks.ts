import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { listMoodEntriesInRange } from '@/features/garden/api';
import { moodKeys } from '@/features/mood/hooks';

export function useStatsRange(params: {
  userId: string | undefined;
  startDate: Date;
  endDate: Date;
}) {
  const start = format(params.startDate, 'yyyy-MM-dd');
  const end = format(params.endDate, 'yyyy-MM-dd');
  return useQuery({
    queryKey: [...moodKeys.all, 'stats-range', params.userId ?? 'anon', start, end],
    queryFn: () =>
      listMoodEntriesInRange({
        userId: params.userId!,
        startDate: start,
        endDate: end,
      }),
    enabled: !!params.userId,
  });
}
