import {
  EMOTIONS,
  HOBBIES,
  MEALS,
  MOOD_OPTIONS,
  OTHER_TAGS,
  SELF_CARE,
  WEATHER,
} from '@/features/mood/data';
import type { MoodEntry } from '@/features/mood/types';

// value → label cho tất cả nhóm tag
const TAG_LABELS = new Map<string, string>();
for (const group of [EMOTIONS, HOBBIES, MEALS, SELF_CARE, WEATHER, OTHER_TAGS]) {
  for (const t of group) TAG_LABELS.set(t.value, t.label);
}

const moodLabel = (level: number) =>
  MOOD_OPTIONS.find((m) => m.level === level)?.label ?? String(level);

const toLabels = (values: string[]) =>
  values.map((v) => TAG_LABELS.get(v) ?? v).join(', ');

/**
 * Gói các entry gần đây thành đoạn text gọn để AI tham khảo (cá nhân hoá lời khuyên).
 */
export function buildMoodContext(entries: MoodEntry[]): string {
  if (entries.length === 0) {
    return 'Người dùng chưa ghi nhật ký cảm xúc nào trong 7 ngày gần đây.';
  }

  const lines = entries.slice(-7).map((e) => {
    const parts: string[] = [`tâm trạng ${moodLabel(e.mood_level)}`];
    if (e.emotions.length) parts.push(`cảm xúc: ${toLabels(e.emotions)}`);
    if (e.meals.length) parts.push(`bữa ăn: ${toLabels(e.meals)}`);
    if (e.self_care.length) parts.push(`tự chăm sóc: ${toLabels(e.self_care)}`);
    if (e.hobbies.length) parts.push(`sở thích: ${toLabels(e.hobbies)}`);
    if (e.other_tags.length) parts.push(`bối cảnh: ${toLabels(e.other_tags)}`);
    if (e.note) parts.push(`ghi chú: "${e.note}"`);
    return `- ${e.entry_date}: ${parts.join('; ')}`;
  });

  return lines.join('\n');
}
