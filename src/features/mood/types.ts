import type { MoodLevel } from '@/lib/theme';

/**
 * Row trong DB `mood_entries`.
 */
export interface MoodEntry {
  id: string;
  user_id: string;
  entry_date: string; // YYYY-MM-DD
  mood_level: MoodLevel;
  emotions: string[];
  hobbies: string[];
  meals: string[];
  self_care: string[];
  weather: string[];
  other_tags: string[];
  note: string | null;
  photo_urls: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Input cho upsert. user_id lấy từ auth session, không pass từ form.
 */
export interface MoodEntryInput {
  entry_date: string;
  mood_level: MoodLevel;
  emotions: string[];
  hobbies: string[];
  meals: string[];
  self_care: string[];
  weather: string[];
  other_tags: string[];
  note: string | null;
  photo_urls: string[];
}
