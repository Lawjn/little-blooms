import { StyleSheet, Text, View } from 'react-native';
import { eachDayOfInterval, endOfWeek, format, isSameDay, startOfWeek } from 'date-fns';
import { useUser } from '@/features/auth/store';
import { useStatsRange } from '@/features/stats/hooks';
import { colors, radii, spacing, typography } from '@/lib/theme';

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function StreakIndicator() {
  const user = useUser();
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  const entriesQuery = useStatsRange({
    userId: user?.id,
    startDate: weekStart,
    endDate: weekEnd,
  });

  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const loggedDates = new Set(entriesQuery.data?.map((e) => e.entry_date) ?? []);

  // Streak count = số ngày đã log trong tuần này
  const streakCount = loggedDates.size;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>This week's streak</Text>
        <Text style={styles.count}>{streakCount}/7</Text>
      </View>
      <View style={styles.row}>
        {days.map((d, idx) => {
          const dateStr = format(d, 'yyyy-MM-dd');
          const isLogged = loggedDates.has(dateStr);
          const isToday = isSameDay(d, today);
          return (
            <View key={idx} style={styles.dayCol}>
              <View
                style={[
                  styles.dot,
                  isLogged ? styles.dotLogged : styles.dotEmpty,
                  isToday && !isLogged && styles.dotToday,
                ]}
              />
              <Text style={[styles.label, isToday && styles.labelToday]}>
                {WEEKDAY_LABELS[idx]}
              </Text>
            </View>
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
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.md,
    color: colors.primary,
  },
  count: {
    fontFamily: typography.fontFamily.extrabold,
    fontSize: typography.sizes.md,
    color: colors.primary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCol: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
  },
  dotLogged: {
    backgroundColor: colors.primary,
  },
  dotEmpty: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dotToday: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  label: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  labelToday: {
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
  },
});
