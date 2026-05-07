import { supabase } from '@/lib/supabase';
import type { MoodEntry, MoodEntryInput } from './types';

/**
 * Lấy entry của user cho 1 ngày cụ thể. Trả null nếu chưa log.
 */
export async function getMoodEntry(params: { userId: string; date: string }) {
  const { data, error } = await supabase
    .from('mood_entries')
    .select('*')
    .eq('user_id', params.userId)
    .eq('entry_date', params.date)
    .maybeSingle();

  if (error) throw error;
  return data as MoodEntry | null;
}

/**
 * Upsert mood_entry. RLS yêu cầu user_id = auth.uid().
 * `onConflict: 'user_id,entry_date'` → nếu đã có entry cùng ngày thì update.
 */
export async function upsertMoodEntry(params: {
  userId: string;
  input: MoodEntryInput;
}) {
  const row = {
    user_id: params.userId,
    ...params.input,
  };
  const { data, error } = await supabase
    .from('mood_entries')
    .upsert(row, { onConflict: 'user_id,entry_date' })
    .select()
    .single();

  if (error) throw error;
  return data as MoodEntry;
}
