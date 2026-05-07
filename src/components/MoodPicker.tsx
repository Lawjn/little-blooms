import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MOOD_OPTIONS } from '@/features/mood/data';
import { colors, radii, spacing, typography } from '@/lib/theme';
import type { MoodLevel } from '@/lib/theme';

interface MoodPickerProps {
  value: MoodLevel | null;
  onChange: (level: MoodLevel) => void;
}

export function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
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
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bubble: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  bubbleSelected: {
    borderColor: colors.text.primary,
    transform: [{ scale: 1.1 }],
  },
  bubblePressed: {
    opacity: 0.8,
  },
  emoji: {
    fontSize: 28,
  },
});

// Re-export MOOD_OPTIONS labels nếu UI cần
export { MOOD_OPTIONS };
