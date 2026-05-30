import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Defs, Ellipse, LinearGradient, Path, Stop, Rect, SvgXml } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Flower } from './Flower';
import type { PlantType } from '../mapping';
import { WEATHER_CONFIGS, type WeatherTheme } from '../weather';
import {
  SVG_CLOUD,
  SVG_CLOUD2,
  SVG_HOUSE,
  SVG_SHEEP,
  SVG_SNOWMAN,
  SVG_SUN,
  SVG_TREE,
  SVG_WATERING_CAN,
} from '../gardenAssets';
import type { MoodLevel } from '@/lib/theme';
import { radii, shadows, spacing, typography } from '@/lib/theme';

const FIGMA_W = 430;

// Single isometric tile (rhombus) — scaled-down plot path
const TILE_PATH =
  'M183.324 2.04824C188.92 -0.700128 195.478 -0.681736 201.058 2.09798L370.774 86.6361C384.862 93.6536 385.699 113.442 372.253 121.623L202.527 224.905C196.179 228.768 188.213 228.793 181.841 224.97L9.71063 121.694C-3.87729 113.541 -3.03951 93.5775 11.1837 86.592L183.324 2.04824Z';
const TILE_VB = 381.857; // viewBox width/height base

interface SinglePlantSceneProps {
  moodLevel: MoodLevel;
  plantType: PlantType;
  theme: WeatherTheme;
  dateLabel: string; // "Mar 18"
  isToday: boolean;
  onWater: () => void;
  topInset?: number;
  height: number;
}

export function SinglePlantScene({
  moodLevel,
  plantType,
  theme,
  dateLabel,
  isToday,
  onWater,
  topInset = 0,
  height,
}: SinglePlantSceneProps) {
  const { width: screenW } = useWindowDimensions();
  const scale = screenW / FIGMA_W;
  const S = (v: number) => v * scale;
  const wx = WEATHER_CONFIGS[theme];

  // Tile: render ~42% screen width, centered
  const tileW = screenW * 0.42;
  const tileScale = tileW / TILE_VB;
  const tileH = TILE_VB * tileScale + 14;
  const tileLeft = (screenW - tileW) / 2;
  const tileTop = height * 0.42;

  // Toạ độ cây (để đặt bình tưới rót nước đúng chỗ)
  const plantCenterX = tileLeft + tileW / 2;
  const plantTopY = tileTop - tileW * 0.34;

  // Water pour animation: bình tưới nghiêng + giọt nước rơi xuống cây
  const tilt = useRef(new Animated.Value(0)).current; // 0 = thẳng, 1 = nghiêng rót
  const stream = useRef(new Animated.Value(0)).current; // loop giọt nước
  const plantBounce = useRef(new Animated.Value(0)).current;
  const [pouring, setPouring] = useState(false);
  const streamLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  const triggerWater = () => {
    if (!isToday || pouring) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setPouring(true);
    tilt.setValue(0);
    stream.setValue(0);

    // Loop giọt nước trong lúc nghiêng
    const loop = Animated.loop(
      Animated.timing(stream, { toValue: 1, duration: 460, useNativeDriver: true }),
      { iterations: 3 },
    );
    streamLoopRef.current = loop;
    loop.start();

    // Bình tưới nghiêng → giữ → trả lại
    Animated.sequence([
      Animated.timing(tilt, { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.delay(900),
      Animated.timing(tilt, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start(() => {
      loop.stop();
      stream.setValue(0);
      // Cây nảy nhẹ "uống nước"
      Animated.sequence([
        Animated.timing(plantBounce, { toValue: 1, duration: 160, useNativeDriver: true }),
        Animated.spring(plantBounce, { toValue: 0, friction: 4, useNativeDriver: true }),
      ]).start();
      setPouring(false);
      onWater();
    });
  };

  useEffect(() => {
    return () => {
      tilt.stopAnimation();
      stream.stopAnimation();
      streamLoopRef.current?.stop();
    };
  }, [tilt, stream]);

  // Vòi bình tưới (mặc định chỉa lên NE) → xoay cho vòi chúc xuống cây.
  // Tip in từ 70° → 140° (vòi quét từ ngang xuống dưới) = động tác đang rót.
  const canRotate = tilt.interpolate({ inputRange: [0, 1], outputRange: ['70deg', '140deg'] });
  const streamTranslateY = stream.interpolate({ inputRange: [0, 1], outputRange: [0, S(56)] });
  const streamOpacity = stream.interpolate({
    inputRange: [0, 0.15, 0.85, 1],
    outputRange: [0, 1, 1, 0],
  });
  const plantScale = plantBounce.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });

  return (
    <View style={[styles.scene, { height }]}>
      {/* Sky + hills */}
      <Svg width={screenW} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="ssky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={wx.skyTop} />
            <Stop offset="1" stopColor={wx.skyBottom} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={screenW} height={height} fill="url(#ssky)" />
        <Ellipse cx={S(-188 + 274)} cy={height - S(120)} rx={S(274)} ry={S(150)} fill={wx.hillBack} />
        <Ellipse cx={S(124 + 274)} cy={height - S(90)} rx={S(274)} ry={S(150)} fill={wx.hillFront} />
      </Svg>

      {/* Date.Month header */}
      <Text style={[styles.dateText, { top: topInset + S(56), fontSize: S(26) }]}>{dateLabel}</Text>

      {/* Sun + clouds */}
      {wx.showSun ? (
        <View style={[styles.deco, { right: S(20), top: topInset + S(40) }]}>
          <SvgXml xml={SVG_SUN} width={S(80)} height={S(80)} />
        </View>
      ) : null}
      <View style={[styles.deco, { left: S(10), top: topInset + S(70) }]}>
        <SvgXml xml={SVG_CLOUD} width={S(110)} height={S(110)} />
      </View>
      <View style={[styles.deco, { right: S(30), top: topInset + S(150) }]}>
        <SvgXml xml={SVG_CLOUD2} width={S(90)} height={S(90)} />
      </View>

      {/* Tree + house — đặt cao trên hill, xa khỏi nút bình tưới (góc dưới phải) */}
      <View style={[styles.deco, { right: S(60), bottom: S(150) }]}>
        <SvgXml xml={SVG_TREE} width={S(48)} height={S(48)} />
      </View>
      <View style={[styles.deco, { right: S(18), bottom: S(132) }]}>
        <SvgXml xml={SVG_HOUSE} width={S(52)} height={S(52)} />
      </View>

      {/* Character trái */}
      <View style={[styles.deco, { left: S(24), bottom: S(40) }]}>
        <SvgXml xml={theme === 'snowy' ? SVG_SNOWMAN : SVG_SHEEP} width={S(70)} height={S(70)} />
      </View>

      {/* Single tile + plant */}
      <View style={{ position: 'absolute', left: tileLeft, top: tileTop, width: tileW, height: tileH }}>
        <Svg width={tileW} height={tileH} viewBox={`0 0 ${TILE_VB} ${TILE_VB + 40}`}>
          <Path d={TILE_PATH} fill="#865A3D" translateY={28} />
          <Path d={TILE_PATH} fill="#947151" translateY={14} />
          <Path d={TILE_PATH} fill="#8FD34A" />
        </Svg>
        {/* Plant centered on tile, mọc lên */}
        <Animated.View
          style={{
            position: 'absolute',
            left: tileW / 2 - tileW * 0.28,
            top: -tileW * 0.34,
            width: tileW * 0.56,
            height: tileW * 0.56,
            transform: [{ scale: plantScale }],
          }}
        >
          <Flower moodLevel={moodLevel} plantType={plantType} size={tileW * 0.56} />
        </Animated.View>
      </View>

      {/* Pour animation: bình tưới nghiêng vòi xuống + giọt nước rơi xuống cây */}
      {pouring ? (
        <>
          <Animated.View
            style={{
              position: 'absolute',
              left: plantCenterX - S(30),
              top: plantTopY - S(64),
              transform: [{ rotate: canRotate }],
            }}
          >
            <SvgXml xml={SVG_WATERING_CAN} width={S(58)} height={S(58)} />
          </Animated.View>
          {[0, 1, 2].map((i) => (
            <Animated.Text
              key={i}
              style={{
                position: 'absolute',
                left: plantCenterX - S(12) + i * S(7),
                top: plantTopY - S(16) + i * S(10),
                fontSize: S(13),
                opacity: streamOpacity,
                transform: [{ translateY: streamTranslateY }],
              }}
            >
              💧
            </Animated.Text>
          ))}
        </>
      ) : null}

      {/* Watering can button bottom-right (ẩn khi đang rót) */}
      {isToday && !pouring ? (
        <Pressable
          onPress={triggerWater}
          style={[styles.canBtn, { right: S(20), bottom: S(20) }]}
        >
          <View style={styles.canInner}>
            <SvgXml xml={SVG_WATERING_CAN} width={S(34)} height={S(34)} />
          </View>
          <Text style={styles.canLabel}>Tưới cây</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  scene: {
    position: 'relative',
    width: '100%',
  },
  deco: {
    position: 'absolute',
  },
  dateText: {
    position: 'absolute',
    left: spacing.lg,
    fontFamily: typography.fontFamily.extrabold,
    color: '#15607D',
  },
  canBtn: {
    position: 'absolute',
    alignItems: 'center',
    gap: 2,
  },
  canInner: {
    width: 56,
    height: 56,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#7CB342',
    ...shadows.md,
  },
  canLabel: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xs,
    color: '#15607D',
  },
});
