import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { getMoodVisual, type PlantType } from '../mapping';
import {
  SVG_CHERRY,
  SVG_CLOVER,
  SVG_ROSE,
  SVG_SUNFLOWER,
  SVG_TULIP,
} from '../gardenAssets';
import type { MoodLevel } from '@/lib/theme';

interface FlowerProps {
  moodLevel: MoodLevel;
  plantType: PlantType;
  size?: number;
}

const PLANT_SVG: Record<PlantType, string> = {
  tulip: SVG_TULIP,
  sunflower: SVG_SUNFLOWER,
  rose: SVG_ROSE,
  cherry: SVG_CHERRY,
  clover: SVG_CLOVER,
};

/**
 * Render 1 cây của 1 ngày: SVG illustration thật (icon Figma dùng).
 * plantType → loài cây. moodLevel → opacity + scale (cây vui sáng, cây buồn héo).
 */
export function Flower({ moodLevel, plantType, size = 32 }: FlowerProps) {
  const visual = getMoodVisual(moodLevel);
  const renderSize = size * visual.scale;

  return (
    <View style={[styles.container, { width: size, height: size, opacity: visual.opacity }]}>
      <SvgXml xml={PLANT_SVG[plantType]} width={renderSize} height={renderSize} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});
