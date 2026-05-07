import { supabase } from '@/lib/supabase';
import type { MoodEntry } from '@/features/mood/types';

/**
 * List mood entries trong khoảng date (inclusive).
 * Dùng cho Garden (tháng), Stats (tuần/tháng), Calendar.
 */
export async function listMoodEntriesInRange(params: {
  userId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}) {
  const { data, error } = await supabase
    .from('mood_entries')
    .select('*')
    .eq('user_id', params.userId)
    .gte('entry_date', params.startDate)
    .lte('entry_date', params.endDate)
    .order('entry_date', { ascending: true });

  if (error) throw error;
  return (data ?? []) as MoodEntry[];
}
