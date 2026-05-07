import { supabase } from '@/lib/supabase';
import { getMoodPhotoSignedUrls } from '@/features/mood/upload';
import type { MoodLevel } from '@/lib/theme';

export interface GalleryPhoto {
  url: string; // signed URL
  path: string; // storage path (cho tap action)
  entryDate: string; // YYYY-MM-DD
  moodLevel: MoodLevel;
  index: number; // index trong photo_urls của entry
}

/**
 * List tất cả ảnh của user, kèm metadata entry. Sort newest first.
 * Limit 100 ảnh để không quá tải — pagination thêm sau nếu cần.
 */
export async function listAllPhotos(userId: string): Promise<GalleryPhoto[]> {
  const { data, error } = await supabase
    .from('mood_entries')
    .select('id, entry_date, mood_level, photo_urls')
    .eq('user_id', userId)
    .not('photo_urls', 'is', null)
    .order('entry_date', { ascending: false })
    .limit(100);

  if (error) throw error;
  if (!data) return [];

  // Flatten entries → individual photos
  const flat: { path: string; entryDate: string; moodLevel: MoodLevel; index: number }[] = [];
  for (const entry of data) {
    const paths = (entry.photo_urls as string[]) ?? [];
    paths.forEach((path, idx) => {
      if (path) {
        flat.push({
          path,
          entryDate: entry.entry_date,
          moodLevel: entry.mood_level,
          index: idx,
        });
      }
    });
  }

  if (flat.length === 0) return [];

  // Batch generate signed URLs cho tất cả paths
  const urls = await getMoodPhotoSignedUrls(flat.map((p) => p.path));
  return flat.map((meta, idx) => ({
    url: urls[idx] ?? '',
    ...meta,
  }));
}
