import { StyleSheet, Text, View } from 'react-native';
import { getMoodVisual, PLANT_EMOJI, type PlantType } from '../mapping';
import { radii } from '@/lib/theme';
import type { MoodLevel } from '@/lib/theme';

interface FlowerProps {
  moodLevel: MoodLevel;
  plantType: PlantType;
  size?: number;
}

/**
 * Render 1 cây của 1 ngày: cùng loài (plantType), màu nền + opacity + scale theo mood.
 */
export function Flower({ moodLevel, plantType, size = 32 }: FlowerProps) {
  const visual = getMoodVisual(moodLevel);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          backgroundColor: visual.bgColor,
          opacity: visual.opacity,
        },
      ]}
    >
      <Text
        style={{
          fontSize: size * 0.65 * visual.scale,
        }}
      >
        {PLANT_EMOJI[plantType]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.full,
  },
});
