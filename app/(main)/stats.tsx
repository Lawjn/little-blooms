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
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUser } from '@/features/auth/store';
import { useProfile } from '@/features/profile/hooks';
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
  const router = useRouter();
  const user = useUser();
  const profileQuery = useProfile(user?.id);
  const isPremium = profileQuery.data?.is_premium ?? false;
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
            {/* AI Insights — premium-gated */}
            {isPremium ? (
              <View style={styles.aiCard}>
                <View style={styles.aiHeader}>
                  <MaterialCommunityIcons name="auto-fix" size={20} color="#7E57C2" />
                  <Text style={styles.aiTitle}>AI Weekly Insight</Text>
                  <View style={styles.aiBadge}>
                    <Text style={styles.aiBadgeText}>BETA</Text>
                  </View>
                </View>
                <Text style={styles.aiText}>
                  Bạn có xu hướng vui hơn vào cuối tuần (Th7-CN). Stress level cao vào thứ 5 —
                  có thể schedule giải lao hoặc làm việc nhẹ hơn vào ngày này. Tags "exercise" và
                  "meditate" thường correlate với mood ≥ 4 ✨
                </Text>
                <Text style={styles.aiDisclaimer}>
                  Generated by AI · Demo placeholder. Production sẽ dùng Claude/Gemini API.
                </Text>
              </View>
            ) : (
              <Pressable
                onPress={() => router.push('/store/premium' as never)}
                style={styles.premiumLock}
              >
                <MaterialCommunityIcons name="lock" size={24} color="#7E57C2" />
                <View style={styles.premiumLockText}>
                  <Text style={styles.premiumLockTitle}>AI Weekly Insights</Text>
                  <Text style={styles.premiumLockSub}>
                    Unlock pattern analysis + lời khuyên cá nhân hoá với Bloom Premium
                  </Text>
                </View>
                <MaterialCommunityIcons name="crown" size={20} color="#FFB300" />
              </Pressable>
            )}

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
  aiCard: {
    backgroundColor: '#F3E5F5',
    borderRadius: radii.xl,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: '#CE93D8',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  aiTitle: {
    flex: 1,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.md,
    color: '#7E57C2',
  },
  aiBadge: {
    backgroundColor: '#7E57C2',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  aiBadgeText: {
    fontFamily: typography.fontFamily.extrabold,
    fontSize: 10,
    color: colors.white,
  },
  aiText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    lineHeight: 20,
  },
  aiDisclaimer: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  premiumLock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#F3E5F5',
    padding: spacing.md,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: '#CE93D8',
    borderStyle: 'dashed',
  },
  premiumLockText: { flex: 1, gap: 2 },
  premiumLockTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.md,
    color: '#7E57C2',
  },
  premiumLockSub: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
});
