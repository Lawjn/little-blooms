import type { MoodLevel } from '@/lib/theme';

/**
 * Plant species (loài cây). 1 user chọn 1 cây cho cả vườn — không đổi theo ngày.
 * Phase 8 (Store) sẽ thêm field `user_inventory.active_plant` để user mua/đổi.
 * Hiện tạm hardcode default 'tulip'.
 */
export type PlantType = 'tulip' | 'sunflower' | 'rose' | 'cherry' | 'clover';

export const DEFAULT_PLANT: PlantType = 'tulip';

export const PLANT_EMOJI: Record<PlantType, string> = {
  tulip: '🌷',
  sunflower: '🌻',
  rose: '🌹',
  cherry: '🌸',
  clover: '🍀',
};

export const PLANT_LABEL: Record<PlantType, string> = {
  tulip: 'Tulip',
  sunflower: 'Sunflower',
  rose: 'Rose',
  cherry: 'Cherry Blossom',
  clover: 'Clover',
};

/**
 * Mood level → màu sắc cell + opacity của cây ngày đó.
 * Cây vẫn là 1 loài (PLANT_EMOJI), nhưng cell background + opacity khác nhau:
 * - Mood 5 (Very Good): nền vàng kim, cây sáng đầy đủ
 * - Mood 4 (Good): nền hồng nhạt
 * - Mood 3 (Neutral): nền vàng nhạt
 * - Mood 2 (Bad): nền cam nhạt, opacity giảm nhẹ
 * - Mood 1 (Very Bad): nền tím xám, opacity thấp (cây héo)
 */
export interface MoodVisual {
  bgColor: string;
  opacity: number;
  scale: number;
}

export const MOOD_VISUAL: Record<MoodLevel, MoodVisual> = {
  5: { bgColor: '#FFE082', opacity: 1.0, scale: 1.0 }, // bright gold
  4: { bgColor: '#F8BBD0', opacity: 1.0, scale: 0.95 }, // pink
  3: { bgColor: '#FFF59D', opacity: 1.0, scale: 0.9 }, // soft yellow
  2: { bgColor: '#FFCCBC', opacity: 0.85, scale: 0.85 }, // peach (slightly faded)
  1: { bgColor: '#D1C4E9', opacity: 0.6, scale: 0.75 }, // muted purple (wilting)
};

export function getMoodVisual(level: MoodLevel): MoodVisual {
  return MOOD_VISUAL[level];
}
