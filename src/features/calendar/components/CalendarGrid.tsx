import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  endOfMonth,
  format,
  getDay,
  getDaysInMonth,
  isAfter,
  isSameDay,
  startOfDay,
  startOfMonth,
} from 'date-fns';
import { MOOD_VISUAL } from '@/features/garden/mapping';
import type { MoodEntry } from '@/features/mood/types';
import { colors, radii, spacing, typography } from '@/lib/theme';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface CalendarGridProps {
  monthDate: Date;
  entries: MoodEntry[];
  selectedDate?: string; // YYYY-MM-DD
  onDayPress: (date: string) => void;
}

export function CalendarGrid({ monthDate, entries, selectedDate, onDayPress }: CalendarGridProps) {
  const monthStart = startOfMonth(monthDate);
  const daysInMonth = getDaysInMonth(monthDate);
  const startWeekday = getDay(monthStart); // 0=Sun, 6=Sat
  const today = new Date();

  // Index entries by date string
  const entryByDate = new Map<string, MoodEntry>();
  for (const e of entries) entryByDate.set(e.entry_date, e);

  // Build cells: leading empty cells for offset, then 1..N for month days
  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;
  const cells: { day: number | null; date: Date | null }[] = [];
  for (let i = 0; i < totalCells; i++) {
    if (i < startWeekday || i >= startWeekday + daysInMonth) {
      cells.push({ day: null, date: null });
    } else {
      const day = i - startWeekday + 1;
      const date = new Date(monthStart);
      date.setDate(day);
      cells.push({ day, date });
    }
  }

  return (
    <View style={styles.container}>
      {/* Weekday headers */}
      <View style={styles.weekRow}>
        {WEEKDAYS.map((wd, idx) => (
          <View key={idx} style={styles.weekCell}>
            <Text style={styles.weekText}>{wd}</Text>
          </View>
        ))}
      </View>

      {/* Day cells */}
      <View style={styles.grid}>
        {cells.map((cell, idx) => {
          if (!cell.date || cell.day === null) {
            return <View key={idx} style={styles.dayCell} />;
          }
          const dateStr = format(cell.date, 'yyyy-MM-dd');
          const entry = entryByDate.get(dateStr);
          const isToday = isSameDay(cell.date, today);
          const isSelected = selectedDate === dateStr;
          const isFuture = isAfter(startOfDay(cell.date), startOfDay(today));
          const dotColor = entry ? MOOD_VISUAL[entry.mood_level].bgColor : null;

          return (
            <Pressable
              key={idx}
              onPress={() => onDayPress(dateStr)}
              disabled={isFuture}
              style={({ pressed }) => [
                styles.dayCell,
                isSelected && styles.dayCellSelected,
                isToday && !isSelected && styles.dayCellToday,
                isFuture && styles.dayCellFuture,
                pressed && !isFuture && styles.dayCellPressed,
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  isSelected && styles.dayTextSelected,
                  isToday && !isSelected && styles.dayTextToday,
                  isFuture && styles.dayTextFuture,
                ]}
              >
                {cell.day}
              </Text>
              {dotColor ? <View style={[styles.dot, { backgroundColor: dotColor }]} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cream,
    borderRadius: radii.xl,
    padding: spacing.md,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  weekCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
    borderRadius: radii.full,
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radii.full,
  },
  dayCellPressed: {
    opacity: 0.6,
  },
  dayCellFuture: {
    opacity: 0.3,
  },
  dayText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  dayTextSelected: {
    color: colors.white,
  },
  dayTextToday: {
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
  },
  dayTextFuture: {
    color: colors.text.secondary,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radii.full,
    marginTop: 2,
  },
});
