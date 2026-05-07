import { StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import type { ActivityCount } from '../aggregate';
import { colors, radii, spacing, typography } from '@/lib/theme';

interface ActivityBarChartProps {
  data: ActivityCount[];
}

export function ActivityBarChart({ data }: ActivityBarChartProps) {
  const hasData = data.some((d) => d.tagsCount > 0);

  if (!hasData) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Chưa có activity nào trong khoảng này</Text>
      </View>
    );
  }

  const chartData = data.map((d) => ({
    value: d.tagsCount,
    label: d.dayLabel,
    frontColor: colors.primary,
    topLabelComponent: () =>
      d.tagsCount > 0 ? <Text style={styles.barLabel}>{d.tagsCount}</Text> : null,
  }));

  const max = Math.max(...data.map((d) => d.tagsCount), 5);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity</Text>
      <Text style={styles.subtitle}>Số tags chọn mỗi ngày</Text>
      <BarChart
        data={chartData}
        height={140}
        barWidth={Math.max(16, Math.min(32, Math.floor(280 / Math.max(data.length, 1)) - 8))}
        spacing={6}
        initialSpacing={10}
        endSpacing={10}
        barBorderRadius={4}
        maxValue={max + 2}
        noOfSections={4}
        xAxisLabelTextStyle={styles.axisLabel}
        yAxisTextStyle={styles.axisLabel}
        rulesType="dashed"
        rulesColor={colors.border}
        xAxisColor={colors.border}
        yAxisColor={colors.border}
        adjustToWidth
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cream,
    borderRadius: radii.xl,
    padding: spacing.md,
    gap: spacing.xs,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.md,
    color: colors.primary,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  axisLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 10,
    color: colors.text.secondary,
  },
  barLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 10,
    color: colors.text.primary,
    textAlign: 'center',
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
