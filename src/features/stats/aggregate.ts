import { differenceInDays, format, parseISO } from 'date-fns';
import type { MoodEntry } from '@/features/mood/types';
import type { MoodLevel } from '@/lib/theme';
import { EMOTIONS } from '@/features/mood/data';

export interface DailyMoodPoint {
  date: string; // YYYY-MM-DD
  dayLabel: string; // 'Mon' or '5'
  moodLevel: MoodLevel | null;
}

/**
 * Trả về 1 point per day trong khoảng [startDate, endDate], null nếu chưa log.
 */
export function buildDailyMoodSeries(params: {
  entries: MoodEntry[];
  startDate: Date;
  endDate: Date;
  labelMode: 'weekday' | 'day';
}): DailyMoodPoint[] {
  const map = new Map<string, MoodEntry>();
  for (const e of params.entries) map.set(e.entry_date, e);

  const days = differenceInDays(params.endDate, params.startDate) + 1;
  const result: DailyMoodPoint[] = [];

  for (let i = 0; i < days; i++) {
    const d = new Date(params.startDate);
    d.setDate(d.getDate() + i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const entry = map.get(dateStr);
    const dayLabel =
      params.labelMode === 'weekday' ? format(d, 'EEE').toUpperCase() : format(d, 'd');
    result.push({
      date: dateStr,
      dayLabel,
      moodLevel: entry?.mood_level ?? null,
    });
  }
  return result;
}

export interface MoodDistribution {
  level: MoodLevel;
  count: number;
  percent: number;
}

export function buildMoodDistribution(entries: MoodEntry[]): MoodDistribution[] {
  const counts: Record<MoodLevel, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const e of entries) counts[e.mood_level]++;
  const total = entries.length || 1;
  return ([5, 4, 3, 2, 1] as MoodLevel[]).map((level) => ({
    level,
    count: counts[level],
    percent: Math.round((counts[level] / total) * 100),
  }));
}

export interface ActivityCount {
  date: string;
  dayLabel: string;
  tagsCount: number; // tổng số tags chọn ngày đó
}

/**
 * Số tags (emotions + hobbies + meals + self_care + weather + other) per day → activity heat.
 */
export function buildActivityBars(params: {
  entries: MoodEntry[];
  startDate: Date;
  endDate: Date;
  labelMode: 'weekday' | 'day';
}): ActivityCount[] {
  const map = new Map<string, MoodEntry>();
  for (const e of params.entries) map.set(e.entry_date, e);

  const days = differenceInDays(params.endDate, params.startDate) + 1;
  const result: ActivityCount[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(params.startDate);
    d.setDate(d.getDate() + i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const entry = map.get(dateStr);
    const dayLabel =
      params.labelMode === 'weekday' ? format(d, 'EEE').toUpperCase().slice(0, 3) : format(d, 'd');
    const tagsCount = entry
      ? entry.emotions.length +
        entry.hobbies.length +
        entry.meals.length +
        entry.self_care.length +
        entry.weather.length +
        entry.other_tags.length
      : 0;
    result.push({ date: dateStr, dayLabel, tagsCount });
  }
  return result;
}

export interface EmotionRank {
  value: string;
  label: string;
  count: number;
  percent: number;
}

/**
 * Top emotions ranked by frequency. Trả tối đa `limit` items.
 */
export function buildTopEmotions(entries: MoodEntry[], limit = 5): EmotionRank[] {
  const counts = new Map<string, number>();
  let total = 0;
  for (const e of entries) {
    for (const em of e.emotions) {
      counts.set(em, (counts.get(em) ?? 0) + 1);
      total++;
    }
  }
  if (total === 0) return [];

  const labelByValue = new Map<string, string>();
  for (const opt of EMOTIONS) labelByValue.set(opt.value, opt.label);

  return Array.from(counts.entries())
    .map(([value, count]) => ({
      value,
      label: labelByValue.get(value) ?? value,
      count,
      percent: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
