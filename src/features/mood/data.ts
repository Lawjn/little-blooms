/**
 * Mood + tag options cho Daily Mood Entry.
 * Single source of truth — tag value lưu vào DB, label hiển thị UI.
 */

import { colors, type MoodLevel } from '@/lib/theme';

export interface MoodOption {
  level: MoodLevel;
  emoji: string;
  label: string;
  color: string;
}

export const MOOD_OPTIONS: readonly MoodOption[] = [
  { level: 1, emoji: '😞', label: 'Very Bad', color: colors.mood.veryBad.main },
  { level: 2, emoji: '😟', label: 'Bad', color: colors.mood.bad.main },
  { level: 3, emoji: '😐', label: 'Neutral', color: colors.mood.neutral.main },
  { level: 4, emoji: '🙂', label: 'Good', color: colors.mood.good.main },
  { level: 5, emoji: '😄', label: 'Very Good', color: colors.mood.veryGood.main },
] as const;

/**
 * Mỗi nhóm tag có palette màu pastel riêng — UI hài hòa nhưng phân biệt section.
 * Khi save vào DB, lưu giá trị `value` (lowercase tiếng Anh, stable). `label` chỉ hiển thị.
 */
export interface TagOption {
  value: string;
  label: string;
}

export const EMOTIONS: readonly TagOption[] = [
  { value: 'happy', label: 'Happy' },
  { value: 'sad', label: 'Sad' },
  { value: 'excited', label: 'Excited' },
  { value: 'calm', label: 'Calm' },
  { value: 'anxious', label: 'Anxious' },
  { value: 'angry', label: 'Angry' },
  { value: 'grateful', label: 'Grateful' },
  { value: 'tired', label: 'Tired' },
  { value: 'stressed', label: 'Stressed' },
  { value: 'lonely', label: 'Lonely' },
  { value: 'loved', label: 'Loved' },
  { value: 'hopeful', label: 'Hopeful' },
  { value: 'confident', label: 'Confident' },
  { value: 'bored', label: 'Bored' },
  { value: 'confused', label: 'Confused' },
] as const;

export const HOBBIES: readonly TagOption[] = [
  { value: 'reading', label: 'Reading' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'music', label: 'Music' },
  { value: 'cooking', label: 'Cooking' },
  { value: 'sports', label: 'Sports' },
  { value: 'drawing', label: 'Drawing' },
  { value: 'writing', label: 'Writing' },
  { value: 'photo', label: 'Photo' },
  { value: 'movies', label: 'Movies' },
  { value: 'travel', label: 'Travel' },
] as const;

export const MEALS: readonly TagOption[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
  { value: 'dessert', label: 'Dessert' },
] as const;

export const SELF_CARE: readonly TagOption[] = [
  { value: 'sleep', label: 'Sleep 8h+' },
  { value: 'exercise', label: 'Exercise' },
  { value: 'meditate', label: 'Meditate' },
  { value: 'skincare', label: 'Skincare' },
  { value: 'hydrate', label: 'Hydrate' },
  { value: 'stretch', label: 'Stretch' },
  { value: 'bath', label: 'Bath' },
] as const;

export const WEATHER: readonly TagOption[] = [
  { value: 'sunny', label: 'Sunny' },
  { value: 'cloudy', label: 'Cloudy' },
  { value: 'rainy', label: 'Rainy' },
  { value: 'snowy', label: 'Snowy' },
  { value: 'windy', label: 'Windy' },
] as const;

export const OTHER_TAGS: readonly TagOption[] = [
  { value: 'work', label: 'Work' },
  { value: 'school', label: 'School' },
  { value: 'family', label: 'Family' },
  { value: 'friends', label: 'Friends' },
  { value: 'date', label: 'Date' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'pet', label: 'Pet' },
] as const;

/**
 * Pastel palette cho mỗi tag bubble — random từ list này, không quá rực.
 * Pattern: indexed by tag-position-in-section để 1 tag luôn có cùng màu mỗi lần render.
 */
export const TAG_PALETTE = [
  '#FFB3BA', // pink
  '#FFD89B', // peach
  '#FFF5B7', // pale yellow
  '#C5E1A5', // light green
  '#B3E5FC', // light blue
  '#D1C4E9', // lavender
  '#FFCC80', // orange
  '#F8BBD0', // rose
  '#DCEDC8', // sage
  '#B2EBF2', // cyan
] as const;

export function getTagColor(index: number): string {
  return TAG_PALETTE[index % TAG_PALETTE.length];
}
