import type { MoodLevel } from '@/lib/theme';

export interface MoodPulse {
  id: string;
  user_id: string;
  logged_at: string; // ISO timestamp
  mood_level: MoodLevel;
  note: string | null;
  photo_urls: string[];
  created_at: string;
}

export interface MoodPulseInput {
  mood_level: MoodLevel;
  note: string | null;
  photo_urls: string[];
}
