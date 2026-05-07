import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isSameWeek,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from 'date-fns';
import { useUser } from '@/features/auth/store';
import { useStatsRange } from '@/features/stats/hooks';
import {
  buildActivityBars,
  buildDailyMoodSeries,
  buildMoodDistribution,
  buildTopEmotions,
} from '@/features/stats/aggregate';
import { ActivityBarChart } from '@/features/stats/components/ActivityBarChart';
import { MoodLineChart } from '@/features/stats/components/MoodLineChart';
import { MoodPieChart } from '@/features/stats/components/MoodPieChart';
import { TopEmotionsList } from '@/features/stats/components/TopEmotionsList';
import { colors, radii, spacing, typography } from '@/lib/theme';

type RangeMode = 'weekly' | 'monthly';

export default function StatsScreen() {
  const user = useUser();
  const [mode, setMode] = useState<RangeMode>('weekly');
  const [anchorDate, setAnchorDate] = useState(new Date());

  const today = new Date();
  const { startDate, endDate, label } = useMemo(() => {
    if (mode === 'weekly') {
      const s = startOfWeek(anchorDate, { weekStartsOn: 0 });
      const e = endOfWeek(anchorDate, { weekStartsOn: 0 });
      return {
        startDate: s,
        endDate: e,
        label: `${format(s, 'MMM d')} - ${format(e, 'MMM d')}`,
      };
    }
    const s = startOfMonth(anchorDate);
    const e = endOfMonth(anchorDate);
    return {
      startDate: s,
      endDate: e,
      label: format(anchorDate, 'MMMM yyyy'),
    };
  }, [mode, anchorDate]);

  const entriesQuery = useStatsRange({ userId: user?.id, startDate, endDate });
  const entries = entriesQuery.data ?? [];

  const moodSeries = useMemo(
    () =>
      buildDailyMoodSeries({
        entries,
        startDate,
        endDate,
        labelMode: mode === 'weekly' ? 'weekday' : 'day',
      }),
    [entries, startDate, endDate, mode],
  );
  const distribution = useMemo(() => buildMoodDistribution(entries), [entries]);
  const activityBars = useMemo(
    () =>
      buildActivityBars({
        entries,
        startDate,
        endDate,
        labelMode: mode === 'weekly' ? 'weekday' : 'day',
      }),
    [entries, startDate, endDate, mode],
  );
  const topEmotions = useMemo(() => buildTopEmotions(entries, 5), [entries]);

  // Check anchorDate cùng tuần/tháng với today thay vì so sánh với time precision
  // (cũ dùng isAfter(addWeeks/Months(anchor, 1), today) bị sai vì time component)
  const isAtCurrent =
    mode === 'weekly'
      ? isSameWeek(anchorDate, today, { weekStartsOn: 0 })
      : isSameMonth(anchorDate, today);

  const onPrev = () => {
    setAnchorDate((d) => (mode === 'weekly' ? subWeeks(d, 1) : subMonths(d, 1)));
  };
  const onNext = () => {
    if (isAtCurrent) return;
    setAnchorDate((d) => (mode === 'weekly' ? addWeeks(d, 1) : addMonths(d, 1)));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Insights</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Toggle Weekly/Monthly */}
        <View style={styles.toggle}>
          <Pressable
            onPress={() => setMode('weekly')}
            style={[styles.toggleBtn, mode === 'weekly' && styles.toggleBtnActive]}
          >
            <Text style={[styles.toggleLabel, mode === 'weekly' && styles.toggleLabelActive]}>
              Weekly
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setMode('monthly')}
            style={[styles.toggleBtn, mode === 'monthly' && styles.toggleBtnActive]}
          >
            <Text style={[styles.toggleLabel, mode === 'monthly' && styles.toggleLabelActive]}>
              Monthly
            </Text>
          </Pressable>
        </View>

        {/* Date range nav */}
        <View style={styles.rangeNav}>
          <Pressable onPress={onPrev} hitSlop={8}>
            <Ionicons name="chevron-back" size={20} color={colors.primary} />
          </Pressable>
          <Text style={styles.rangeLabel}>{label}</Text>
          <Pressable onPress={onNext} hitSlop={8} disabled={isAtCurrent}>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isAtCurrent ? colors.text.secondary : colors.primary}
            />
          </Pressable>
        </View>

        {entriesQuery.isLoading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : (
          <>
            <MoodLineChart series={moodSeries} />
            <MoodPieChart distribution={distribution} />
            <TopEmotionsList emotions={topEmotions} />
            <ActivityBarChart data={activityBars} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  headerBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.extrabold,
    fontSize: typography.sizes.xl,
    color: colors.white,
    textAlign: 'center',
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.greenLight,
    borderRadius: radii.pill,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radii.pill,
  },
  toggleBtnActive: {
    backgroundColor: colors.white,
  },
  toggleLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  toggleLabelActive: {
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
  },
  rangeNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  rangeLabel: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.md,
    color: colors.primary,
  },
  loadingText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});
