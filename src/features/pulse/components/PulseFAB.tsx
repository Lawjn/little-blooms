import { Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radii, shadows } from '@/lib/theme';

interface PulseFABProps {
  onPress: () => void;
  bottomOffset?: number; // distance từ bottom, thường là tab bar height
}

/**
 * Floating Action Button "+" để mở Quick Log Modal.
 * Position absolute, bottom-right.
 */
export function PulseFAB({ onPress, bottomOffset = 24 }: PulseFABProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.fab,
        { bottom: bottomOffset },
        pressed && styles.pressed,
      ]}
      hitSlop={8}
    >
      <MaterialCommunityIcons name="plus" size={28} color={colors.white} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
});
