import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addSeeds,
  fakePurchaseSeeds,
  getInventory,
  setPremium,
  unlockPlant,
  updateActivePlant,
} from './api';

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

export function useAddSeeds() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addSeeds,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: inventoryKeys.detail(data.user_id) });
    },
  });
}

export function useUnlockPlant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: unlockPlant,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: inventoryKeys.detail(data.user_id) });
    },
  });
}

export function useFakePurchaseSeeds() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fakePurchaseSeeds,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: inventoryKeys.detail(data.user_id) });
    },
  });
}

export function useSetPremium() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: setPremium,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export { inventoryKeys };
