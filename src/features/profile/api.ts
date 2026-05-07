import { decode } from 'base64-arraybuffer';
import { supabase } from '@/lib/supabase';

export interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
  streak_count: number;
  last_log_date: string | null;
  created_at: string;
  updated_at: string;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return (data as Profile | null) ?? null;
}

export async function updateProfileName(params: { userId: string; name: string }) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ name: params.name.trim() })
    .eq('id', params.userId)
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function uploadAvatar(params: {
  userId: string;
  base64: string;
  mimeType: string;
}): Promise<string> {
  const ext = (params.mimeType.split('/')[1] ?? 'jpg').replace('jpeg', 'jpg');
  // Path dạng folder pattern `{userId}/avatar.{ext}` — match RLS check
  // `(storage.foldername(name))[1] = auth.uid()::text` (consistent với mood-photos).
  const path = `${params.userId}/avatar.${ext}`;
  const arrayBuffer = decode(params.base64);

  const { error: uploadError } = await supabase.storage.from('avatars').upload(path, arrayBuffer, {
    contentType: params.mimeType,
    upsert: true,
  });
  if (uploadError) {
    console.warn('[uploadAvatar] error:', JSON.stringify(uploadError, null, 2));
    throw uploadError;
  }

  // Public bucket → URL công khai (cache-bust bằng timestamp)
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

  // Update profile.avatar_url
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', params.userId);
  if (updateError) throw updateError;

  return publicUrl;
}
