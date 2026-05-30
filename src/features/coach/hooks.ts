import { useMutation, useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { listMoodEntriesInRange } from '@/features/garden/api';
import { sendCoachMessage } from './api';

/**
 * Lấy mood entries 7 ngày gần nhất (để build context cho AI).
 */
export function useRecentMoodEntries(userId: string | undefined) {
  const today = new Date();
  const start = subDays(today, 6);
  return useQuery({
    queryKey: ['coach', 'recent-mood', userId ?? 'anon'],
    queryFn: () =>
      listMoodEntriesInRange({
        userId: userId!,
        startDate: format(start, 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd'),
      }),
    enabled: !!userId,
  });
}

export function useSendCoachMessage() {
  return useMutation({ mutationFn: sendCoachMessage });
}
