import { StyleSheet, View } from 'react-native';
import { colors, radii, spacing } from '@/lib/theme';

interface StepProgressProps {
  current: number; // 0-based index
  total: number;
}

export function StepProgress({ current, total }: StepProgressProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, idx) => {
        const isActive = idx === current;
        const isPast = idx < current;
        return (
          <View
            key={idx}
            style={[
              styles.dot,
              isActive && styles.dotActive,
              isPast && styles.dotPast,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  dot: {
    height: 6,
    width: 24,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 36,
    backgroundColor: colors.primary,
  },
  dotPast: {
    backgroundColor: colors.primaryLight,
  },
});
