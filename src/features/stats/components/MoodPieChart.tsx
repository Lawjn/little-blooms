import { StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { MOOD_VISUAL } from '@/features/garden/mapping';
import { MOOD_OPTIONS } from '@/components/MoodPicker';
import type { MoodDistribution } from '../aggregate';
import { colors, radii, spacing, typography } from '@/lib/theme';

interface MoodPieChartProps {
  distribution: MoodDistribution[];
}

export function MoodPieChart({ distribution }: MoodPieChartProps) {
  const nonZero = distribution.filter((d) => d.count > 0);

  if (nonZero.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Chưa có data</Text>
      </View>
    );
  }

  const data = nonZero.map((d) => ({
    value: d.count,
    color: MOOD_VISUAL[d.level].bgColor,
    text: `${d.percent}%`,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mood Distribution</Text>
      <View style={styles.pieRow}>
        <PieChart
          data={data}
          donut
          radius={70}
          innerRadius={40}
          showText
          textColor={colors.text.primary}
          textSize={11}
          fontStyle="normal"
          centerLabelComponent={() => (
            <View style={styles.center}>
              <Text style={styles.centerCount}>{distribution.reduce((s, d) => s + d.count, 0)}</Text>
              <Text style={styles.centerLabel}>days</Text>
            </View>
          )}
        />
        <View style={styles.legendCol}>
          {nonZero.map((d) => (
            <View key={d.level} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: MOOD_VISUAL[d.level].bgColor }]} />
              <Text style={styles.legendLabel}>
                {MOOD_OPTIONS.find((m) => m.level === d.level)?.label}
              </Text>
              <Text style={styles.legendPercent}>{d.percent}%</Text>
            </View>
          ))}
        </View>
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
  pieRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  center: {
    alignItems: 'center',
  },
  centerCount: {
    fontFamily: typography.fontFamily.extrabold,
    fontSize: typography.sizes.xl,
    color: colors.primary,
  },
  centerLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  legendCol: {
    flex: 1,
    gap: spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: radii.full,
  },
  legendLabel: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  legendPercent: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
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
