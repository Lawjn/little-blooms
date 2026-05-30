import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { SVG_WATERING_CAN } from '../gardenAssets';
import { colors, radii, shadows, typography } from '@/lib/theme';

interface WateringCanButtonProps {
  alreadyWatered: boolean;
  waterStreak: number;
  onWater: () => void;
  /** Vị trí — mặc định float bottom-right. */
  style?: object;
}

/**
 * Floating watering-can button — daily streak action.
 * Tap → haptic + tilt/pour animation → onWater() callback.
 * alreadyWatered=true → hiện streak + disable.
 */
export function WateringCanButton({
  alreadyWatered,
  waterStreak,
  onWater,
  style,
}: WateringCanButtonProps) {
  const tilt = useRef(new Animated.Value(0)).current;
  const [pouring, setPouring] = useState(false);

  useEffect(() => () => tilt.stopAnimation(), [tilt]);

  const trigger = () => {
    if (alreadyWatered || pouring) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setPouring(true);
    Animated.sequence([
      Animated.timing(tilt, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(tilt, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start(() => {
      setPouring(false);
      onWater();
    });
  };

  const rotate = tilt.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-35deg'] });

  return (
    <Pressable
      onPress={trigger}
      disabled={alreadyWatered || pouring}
      style={[styles.wrap, style]}
    >
      <View style={[styles.circle, alreadyWatered && styles.circleDone]}>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <SvgXml xml={SVG_WATERING_CAN} width={34} height={34} />
        </Animated.View>
      </View>
      <View style={styles.labelPill}>
        <Text style={styles.labelText}>
          {alreadyWatered ? `🔥 ${waterStreak}d` : 'Tưới cây'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 4,
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
  circleDone: {
    borderColor: colors.warning,
    opacity: 0.85,
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
