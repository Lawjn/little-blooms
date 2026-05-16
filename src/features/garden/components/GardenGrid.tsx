import { Pressable, StyleSheet, Text, View } from 'react-native';
import { format } from 'date-fns';
import { Flower } from './Flower';
import type { PlantType } from '../mapping';
import type { MoodEntry } from '@/features/mood/types';
import { colors, radii, shadows, spacing, typography } from '@/lib/theme';

// 6 rows × 6 cols = 36 cells để fit mọi tháng:
// - Feb (28-29 ngày): cells 28-35 inactive (8 dư)
// - Apr/Jun/Sep/Nov (30 ngày): cells 30-35 inactive (6 dư)
// - Jan/Mar/May/Jul/Aug/Oct/Dec (31 ngày): cells 31-35 inactive (5 dư)
// Trước đây 5×6=30 → day 31 ngoài grid → bug "cây không hiện".
const ROWS = 6;
const COLS = 6;
const TOTAL_CELLS = ROWS * COLS; // 36 cells

interface GardenGridProps {
  monthStart: Date;
  daysInMonth: number;
  entries: MoodEntry[];
  plantType: PlantType;
  onCellPress?: (date: string) => void;
  /** Day number của hôm nay nếu đang view tháng hiện tại + today có data (entry/pulse).
   * Show speech bubble tooltip "chạm vào cây để xem chi tiết" pointing to today's cell. */
  todayHintDay?: number;
}

const CELL_SIZE = 50;
const FRAME_PADDING = 8; // spacing.sm

/**
 * Grid 5×6 = 30 cells, mỗi cell là 1 ngày trong tháng.
 * Cell index 0 = ngày 1, cell 29 = ngày 30. Tháng 31 ngày sẽ có ngày 31 ở cell ngoài grid (pending).
 *
 * Mapping flat (Phase 3 MVP). Polish isometric ở Phase 9.
 */
export function GardenGrid({
  monthStart,
  daysInMonth,
  entries,
  plantType,
  onCellPress,
  todayHintDay,
}: GardenGridProps) {
  // Index entries by entry_date để lookup nhanh
  const entryByDate = new Map<string, MoodEntry>();
  for (const e of entries) entryByDate.set(e.entry_date, e);

  // Calculate position of today's cell cho speech bubble tooltip
  let todayCellLeft = 0;
  let todayCellTop = 0;
  if (todayHintDay && todayHintDay <= daysInMonth) {
    const idx = todayHintDay - 1;
    const col = idx % COLS;
    const row = Math.floor(idx / COLS);
    todayCellLeft = FRAME_PADDING + col * CELL_SIZE + CELL_SIZE / 2;
    todayCellTop = FRAME_PADDING + row * CELL_SIZE;
  }

  return (
    <View style={styles.frame}>
      <View style={styles.grid}>
        {Array.from({ length: TOTAL_CELLS }).map((_, idx) => {
          const day = idx + 1;
          const isInMonth = day <= daysInMonth;
          if (!isInMonth) {
            return <View key={idx} style={[styles.cell, styles.cellInactive]} />;
          }

          const date = new Date(monthStart);
          date.setDate(day);
          const dateStr = format(date, 'yyyy-MM-dd');
          const entry = entryByDate.get(dateStr);

          return (
            <Pressable
              key={idx}
              onPress={() => entry && onCellPress?.(dateStr)}
              disabled={!entry}
              style={({ pressed }) => [
                styles.cell,
                pressed && entry ? styles.cellPressed : null,
              ]}
            >
              {entry ? (
                <Flower moodLevel={entry.mood_level} plantType={plantType} size={36} />
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {/* Speech bubble tooltip cho today's cell — pointing down */}
      {todayHintDay && todayHintDay <= daysInMonth ? (
        <View
          pointerEvents="none"
          style={[
            styles.tooltip,
            {
              left: todayCellLeft - 90, // bubble width 180 / 2 = 90
              top: todayCellTop - 64, // bubble height ~52 + arrow 12
            },
          ]}
        >
          <View style={styles.tooltipBubble}>
            <Text style={styles.tooltipText}>
              Chạm cây để xem trọn vẹn cảm xúc hôm nay 💛
            </Text>
          </View>
          <View style={styles.tooltipArrow} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: '#8D6E63', // wooden brown frame
    padding: spacing.sm,
    borderRadius: radii.lg,
    alignSelf: 'center',
  },
  grid: {
    width: CELL_SIZE * COLS + 1,
    height: CELL_SIZE * ROWS + 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#A5D6A7', // grass green base
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  cellInactive: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  cellPressed: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  tooltip: {
    position: 'absolute',
    width: 180,
    alignItems: 'center',
    zIndex: 10,
  },
  tooltipBubble: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    ...shadows.md,
  },
  tooltipText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.xs,
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 16,
  },
  tooltipArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.white,
    marginTop: -1,
  },
});

export { ROWS, COLS, TOTAL_CELLS };
