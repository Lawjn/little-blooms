import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MOOD_OPTIONS } from '@/components/MoodPicker';
import { colors, radii, spacing, typography } from '@/lib/theme';
import type { MoodLevel } from '@/lib/theme';

interface MoodStepProps {
  value: MoodLevel | null;
  onChange: (level: MoodLevel) => void;
}

export function MoodStep({ value, onChange }: MoodStepProps) {
  const selected = MOOD_OPTIONS.find((m) => m.level === value);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How was your day?</Text>
      <Text style={styles.subtitle}>Tap để chọn cảm xúc tổng thể của ngày hôm nay</Text>

      <View style={styles.row}>
        {MOOD_OPTIONS.map((mood) => {
          const isSelected = value === mood.level;
          return (
            <Pressable
              key={mood.level}
              onPress={() => onChange(mood.level)}
              style={({ pressed }) => [
                styles.bubble,
                { backgroundColor: mood.color },
                isSelected && styles.bubbleSelected,
                pressed && styles.bubblePressed,
              ]}
            >
              <Text style={styles.emoji}>{mood.emoji}</Text>
            </Pressable>
          );
        })}
      </View>

      {selected ? (
        <Text style={styles.label}>{selected.label}</Text>
      ) : (
        <Text style={styles.labelHint}>‎ </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  title: {
    fontFamily: typography.fontFamily.extrabold,
    fontSize: typography.sizes.xxl,
    color: colors.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginVertical: spacing.lg,
  },
  bubble: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  bubbleSelected: {
    borderColor: colors.text.primary,
    transform: [{ scale: 1.15 }],
  },
  bubblePressed: {
    opacity: 0.85,
  },
  emoji: {
    fontSize: 28,
  },
  label: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.lg,
    color: colors.primary,
    minHeight: 28,
  },
  labelHint: {
    minHeight: 28,
  },
});
