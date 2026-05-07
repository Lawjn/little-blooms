import { useQuery } from '@tanstack/react-query';
import { listAllPhotos } from './api';

export function useAllPhotos(userId: string | undefined) {
  return useQuery({
    queryKey: ['gallery', userId ?? 'anon'],
    queryFn: () => listAllPhotos(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 phút (signed URLs expire sau 1 giờ, cache 5 phút OK)
  });
}
