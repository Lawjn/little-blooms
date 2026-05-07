import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getInventory, updateActivePlant } from './api';

const inventoryKeys = {
  all: ['inventory'] as const,
  detail: (userId: string) => [...inventoryKeys.all, userId] as const,
};

export function useInventory(userId: string | undefined) {
  return useQuery({
    queryKey: inventoryKeys.detail(userId ?? 'anon'),
    queryFn: () => getInventory(userId!),
    enabled: !!userId,
  });
}

export function useUpdateActivePlant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateActivePlant,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: inventoryKeys.detail(data.user_id) });
    },
  });
}

export { inventoryKeys };
