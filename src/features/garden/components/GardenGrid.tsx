import { Pressable, StyleSheet, View } from 'react-native';
import { format } from 'date-fns';
import { Flower } from './Flower';
import type { PlantType } from '../mapping';
import type { MoodEntry } from '@/features/mood/types';
import { colors, radii, spacing } from '@/lib/theme';

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
}

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
}: GardenGridProps) {
  // Index entries by entry_date để lookup nhanh
  const entryByDate = new Map<string, MoodEntry>();
  for (const e of entries) entryByDate.set(e.entry_date, e);

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
    </View>
  );
}

const CELL_SIZE = 50;

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
});

export { ROWS, COLS, TOTAL_CELLS };
