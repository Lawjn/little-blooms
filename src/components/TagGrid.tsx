import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTagColor, type TagOption } from '@/features/mood/data';
import { colors, radii, spacing, typography } from '@/lib/theme';

interface TagGridProps {
  options: readonly TagOption[];
  selected: string[];
  onChange: (next: string[]) => void;
}

export function TagGrid({ options, selected, onChange }: TagGridProps) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <View style={styles.grid}>
      {options.map((opt, idx) => {
        const isSelected = selected.includes(opt.value);
        const bg = getTagColor(idx);
        return (
          <Pressable
            key={opt.value}
            onPress={() => toggle(opt.value)}
            style={({ pressed }) => [
              styles.chip,
              { backgroundColor: bg },
              isSelected && styles.chipSelected,
              pressed && styles.chipPressed,
            ]}
          >
            {isSelected ? (
              <Ionicons
                name="checkmark"
                size={14}
                color={colors.text.primary}
                style={styles.checkIcon}
              />
            ) : null}
            <Text style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  chipSelected: {
    borderColor: colors.text.primary,
  },
  chipPressed: {
    opacity: 0.8,
  },
  checkIcon: {
    marginRight: 2,
  },
  chipLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  chipLabelSelected: {
    fontFamily: typography.fontFamily.bold,
  },
});
