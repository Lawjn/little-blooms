import { decode } from 'base64-arraybuffer';
import { supabase } from '@/lib/supabase';

export interface PendingPhotoAsset {
  uri: string;
  base64?: string | null;
  mimeType?: string | null;
}

/**
 * Upload 1 ảnh lên bucket `mood-photos` với path `{user_id}/{date}/{index}.{ext}`.
 * Trả về path (relative trong bucket) để lưu vào `mood_entries.photo_urls`.
 */
export async function uploadMoodPhoto(params: {
  userId: string;
  date: string;
  index: number;
  asset: PendingPhotoAsset;
}): Promise<string> {
  const { userId, date, index, asset } = params;

  if (!asset.base64) {
    throw new Error('Asset không có base64 — phải pass base64=true khi gọi ImagePicker');
  }

  const mime = asset.mimeType ?? 'image/jpeg';
  const ext = mime.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
  const path = `${userId}/${date}/${index}.${ext}`;
  const arrayBuffer = decode(asset.base64);

  const { error } = await supabase.storage
    .from('mood-photos')
    .upload(path, arrayBuffer, {
      contentType: mime,
      upsert: true,
    });

  if (error) throw error;
  return path;
}

/**
 * Tạo signed URLs cho 1 list paths (private bucket). 1 giờ expire — đủ cho session view.
 * Khi load entry, dùng URL này cho `<Image source={{ uri }} />`.
 */
export async function getMoodPhotoSignedUrls(paths: string[]): Promise<string[]> {
  if (paths.length === 0) return [];
  const { data, error } = await supabase.storage
    .from('mood-photos')
    .createSignedUrls(paths, 60 * 60);

  if (error) throw error;
  return data
    .map((d) => d.signedUrl)
    .filter((url): url is string => url !== null);
}

/**
 * Xóa ảnh khỏi storage (khi user remove slot).
 */
export async function deleteMoodPhoto(path: string): Promise<void> {
  const { error } = await supabase.storage.from('mood-photos').remove([path]);
  if (error) throw error;
}
