import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { addMonths, format, isSameMonth, subMonths } from 'date-fns';
import { CalendarGrid } from '@/features/calendar/components/CalendarGrid';
import { useUser } from '@/features/auth/store';
import { useMonthMoodEntries } from '@/features/garden/hooks';
import { Button } from '@/components/Button';
import { colors, spacing, typography } from '@/lib/theme';

export default function HomeCalendarScreen() {
  const router = useRouter();
  const user = useUser();
  const [monthDate, setMonthDate] = useState(new Date());

  const yearMonth = format(monthDate, 'yyyy-MM');
  const entriesQuery = useMonthMoodEntries({ userId: user?.id, yearMonth });

  const today = new Date();
  const isCurrentMonth = isSameMonth(monthDate, today);

  const onDayPress = (date: string) => {
    router.replace({ pathname: '/home', params: { date } });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Calendar</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Month nav */}
      <View style={styles.monthNav}>
        <Pressable onPress={() => setMonthDate((d) => subMonths(d, 1))} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </Pressable>
        <Text style={styles.monthLabel}>{format(monthDate, 'MMMM yyyy')}</Text>
        <Pressable
          onPress={() => setMonthDate((d) => addMonths(d, 1))}
          hitSlop={8}
          disabled={isCurrentMonth}
          style={isCurrentMonth ? styles.disabledNav : null}
        >
          <Ionicons
            name="chevron-forward"
            size={22}
            color={isCurrentMonth ? colors.text.secondary : colors.primary}
          />
        </Pressable>
      </View>

      {/* Grid */}
      <View style={styles.gridWrap}>
        <CalendarGrid
          monthDate={monthDate}
          entries={entriesQuery.data ?? []}
          onDayPress={onDayPress}
        />
      </View>

      {/* Today quick jump */}
      {!isCurrentMonth ? (
        <View style={styles.footer}>
          <Button label="Today" onPress={() => setMonthDate(new Date())} variant="ghost" />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.lg,
    color: colors.primary,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  monthLabel: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
  },
  disabledNav: {
    opacity: 0.4,
  },
  gridWrap: {
    paddingHorizontal: spacing.lg,
  },
  footer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
});
