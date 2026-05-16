import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPulse, deletePulse, listPulsesByDate, listPulsesInRange } from './api';

const pulseKeys = {
  all: ['pulses'] as const,
  byDate: (userId: string, date: string) => [...pulseKeys.all, 'date', userId, date] as const,
  range: (userId: string, start: string, end: string) =>
    [...pulseKeys.all, 'range', userId, start, end] as const,
};

export function useTodayPulses(params: { userId: string | undefined; date: string }) {
  return useQuery({
    queryKey: pulseKeys.byDate(params.userId ?? 'anon', params.date),
    queryFn: () => listPulsesByDate({ userId: params.userId!, date: params.date }),
    enabled: !!params.userId,
  });
}

export function usePulsesInRange(params: {
  userId: string | undefined;
  startDate: string;
  endDate: string;
}) {
  return useQuery({
    queryKey: pulseKeys.range(params.userId ?? 'anon', params.startDate, params.endDate),
    queryFn: () =>
      listPulsesInRange({
        userId: params.userId!,
        startDate: params.startDate,
        endDate: params.endDate,
      }),
    enabled: !!params.userId,
  });
}

export function useCreatePulse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPulse,
    onSuccess: () => {
      // Invalidate tất cả pulse queries để refetch
      qc.invalidateQueries({ queryKey: pulseKeys.all });
    },
  });
}

export function useDeletePulse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletePulse,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pulseKeys.all });
    },
  });
}

export { pulseKeys };
