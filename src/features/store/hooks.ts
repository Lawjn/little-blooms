import { useQuery } from '@tanstack/react-query';
import { listStoreItems, type StoreItem } from './api';

export function useStoreItems(type?: StoreItem['type']) {
  return useQuery({
    queryKey: ['store-items', type ?? 'all'],
    queryFn: () => listStoreItems(type),
    staleTime: 10 * 60 * 1000, // 10 phút, hiếm khi đổi
  });
}
