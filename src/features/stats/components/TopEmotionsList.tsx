import { StyleSheet, Text, View } from 'react-native';
import { getTagColor } from '@/features/mood/data';
import type { EmotionRank } from '../aggregate';
import { colors, radii, spacing, typography } from '@/lib/theme';

interface TopEmotionsListProps {
  emotions: EmotionRank[];
}

export function TopEmotionsList({ emotions }: TopEmotionsListProps) {
  if (emotions.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Chưa chọn emotion nào</Text>
      </View>
    );
  }

  const max = emotions[0]?.count ?? 1;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Top Emotions</Text>
      <View style={styles.list}>
        {emotions.map((em, idx) => {
          const widthPct = (em.count / max) * 100;
          const color = getTagColor(idx);
          return (
            <View key={em.value} style={styles.row}>
              <Text style={styles.label}>{em.label}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${widthPct}%`, backgroundColor: color }]} />
              </View>
              <Text style={styles.percent}>{em.percent}%</Text>
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
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.md,
    color: colors.primary,
  },
  list: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    width: 80,
  },
  barTrack: {
    flex: 1,
    height: 18,
    backgroundColor: colors.white,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: radii.pill,
  },
  percent: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    width: 40,
    textAlign: 'right',
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
