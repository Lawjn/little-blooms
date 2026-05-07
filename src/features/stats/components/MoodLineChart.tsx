import { StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { MOOD_VISUAL } from '@/features/garden/mapping';
import type { DailyMoodPoint } from '../aggregate';
import { colors, radii, spacing, typography } from '@/lib/theme';
import type { MoodLevel } from '@/lib/theme';

interface MoodLineChartProps {
  series: DailyMoodPoint[];
}

export function MoodLineChart({ series }: MoodLineChartProps) {
  const data = series.map((p) => ({
    value: p.moodLevel ?? 0,
    label: p.dayLabel,
    dataPointColor: p.moodLevel ? MOOD_VISUAL[p.moodLevel].bgColor : 'transparent',
    hideDataPoint: p.moodLevel === null,
  }));

  const hasData = series.some((p) => p.moodLevel !== null);

  if (!hasData) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Chưa có data trong khoảng này</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mood History</Text>
      <LineChart
        data={data}
        height={140}
        spacing={Math.max(28, Math.floor(280 / Math.max(series.length - 1, 1)))}
        initialSpacing={20}
        endSpacing={10}
        thickness={2}
        color={colors.primary}
        dataPointsRadius={5}
        yAxisLabelTexts={['', '😞', '😟', '😐', '🙂', '😄']}
        yAxisLabelWidth={28}
        maxValue={5}
        noOfSections={5}
        stepValue={1}
        xAxisLabelTextStyle={styles.axisLabel}
        yAxisTextStyle={styles.axisLabel}
        rulesType="dashed"
        rulesColor={colors.border}
        xAxisColor={colors.border}
        yAxisColor={colors.border}
        curved
        adjustToWidth
      />
      <View style={styles.legend}>
        {([5, 4, 3, 2, 1] as MoodLevel[]).map((level) => (
          <View key={level} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: MOOD_VISUAL[level].bgColor }]} />
            <Text style={styles.legendText}>{level}</Text>
          </View>
        ))}
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
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.md,
    color: colors.primary,
  },
  axisLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 10,
    color: colors.text.secondary,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: radii.full,
  },
  legendText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  empty: {
    backgroundColor: colors.cream,
    borderRadius: radii.xl,
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
});
