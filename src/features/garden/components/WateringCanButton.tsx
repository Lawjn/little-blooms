import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { SVG_WATERING_CAN } from '../gardenAssets';
import { colors, radii, shadows, typography } from '@/lib/theme';

interface WateringCanButtonProps {
  /** Tap → chuyển vào cây hoa để tưới trực tiếp. */
  onWater: () => void;
  /** Vị trí — mặc định float bottom-right. */
  style?: object;
}

/**
 * Floating watering-can button trên màn Garden chính.
 * Tap → haptic → onWater() (parent điều hướng vào màn cây hoa).
 */
export function WateringCanButton({ onWater, style }: WateringCanButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onWater();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.wrap, style, pressed && styles.pressed]}
    >
      <View style={styles.circle}>
        <SvgXml xml={SVG_WATERING_CAN} width={34} height={34} />
      </View>
      <View style={styles.labelPill}>
        <Text style={styles.labelText}>Tưới cây</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 4,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: radii.full,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: colors.primary,
    ...shadows.lg,
  },
  labelPill: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radii.pill,
    ...shadows.sm,
  },
  labelText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xs,
    color: '#15607D',
  },
});
