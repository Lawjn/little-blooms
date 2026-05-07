import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfileName, uploadAvatar } from './api';

const profileKeys = {
  all: ['profile'] as const,
  detail: (userId: string) => [...profileKeys.all, userId] as const,
};

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: profileKeys.detail(userId ?? 'anon'),
    queryFn: () => getProfile(userId!),
    enabled: !!userId,
  });
}

export function useUpdateProfileName() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateProfileName,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: profileKeys.detail(data.id) });
    },
  });
}

export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (_url, vars) => {
      qc.invalidateQueries({ queryKey: profileKeys.detail(vars.userId) });
    },
  });
}

export { profileKeys };
