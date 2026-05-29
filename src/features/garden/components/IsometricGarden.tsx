import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Defs, Ellipse, LinearGradient, Path, Line, Stop, Rect } from 'react-native-svg';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Flower } from './Flower';
import type { PlantType } from '../mapping';
import { WEATHER_CONFIGS, type WeatherTheme } from '../weather';
import type { MoodEntry } from '@/features/mood/types';
import { colors, typography } from '@/lib/theme';

/**
 * Pixel-perfect Garden scene theo Figma design (node 17:218).
 * Toàn bộ positioned absolute trên virtual canvas 430×932, scale theo screen width.
 *
 * Specs lấy từ Figma:
 * - Plot isometric: 3 rhombus layers offset 8px (grass #8FD34A / soil #947151 / dark #865A3D)
 * - Sky #9EE5FF, header #78C9E6, hills back #75A843 + front #83BF4F
 * - Sun 90×90 @ (330,141), clouds @ (21,123)+(301,213), bird @ (353,379)
 */

const FIGMA_W = 430;
const FIGMA_H = 932;

// Plot top-layer trong Figma coords
const PLOT = { x: 23.296, y: 340, w: 381.857, h: 227.82 };

// Rhombus corners (trong viewBox 381.857 × 227.82 của plot path)
const RH = {
  top: { x: 191, y: 1 },
  right: { x: 382, y: 100 },
  bottom: { x: 192, y: 227 },
  left: { x: 1, y: 114 },
};

// Path data 3 layers (giống nhau, fill khác — offset bằng translateY)
const PLOT_PATH =
  'M183.324 2.04824C188.92 -0.700128 195.478 -0.681736 201.058 2.09798L370.774 86.6361C384.862 93.6536 385.699 113.442 372.253 121.623L202.527 224.905C196.179 228.768 188.213 228.793 181.841 224.97L9.71063 121.694C-3.87729 113.541 -3.03951 93.5775 11.1837 86.592L183.324 2.04824Z';

const ROWS = 6;
const COLS = 6;
const TOTAL_CELLS = ROWS * COLS;

// Vị trí scatter cho snow/rain particles (Figma coords trong 430-width canvas)
const PARTICLE_POSITIONS = [
  { x: 50, y: 280, size: 22 },
  { x: 300, y: 290, size: 20 },
  { x: 30, y: 420, size: 18 },
  { x: 340, y: 430, size: 22 },
  { x: 130, y: 500, size: 16 },
  { x: 250, y: 470, size: 20 },
  { x: 80, y: 350, size: 16 },
  { x: 370, y: 350, size: 18 },
  { x: 180, y: 250, size: 16 },
  { x: 320, y: 530, size: 18 },
];

interface IsometricGardenProps {
  monthStart: Date;
  daysInMonth: number;
  entries: MoodEntry[];
  plantType: PlantType;
  onCellPress?: (date: string) => void;
  onPlantPress?: () => void;
  onWeatherPress?: () => void;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  isAtCurrentMonth?: boolean;
  topInset?: number; // safe area top
  theme?: WeatherTheme;
}

// Map (row, col) → point trong plot viewBox
function cellToPoint(row: number, col: number) {
  const u = (col + 0.5) / COLS;
  const v = (row + 0.5) / ROWS;
  const x = RH.top.x + u * (RH.right.x - RH.top.x) + v * (RH.left.x - RH.top.x);
  const y = RH.top.y + u * (RH.right.y - RH.top.y) + v * (RH.left.y - RH.top.y);
  return { x, y };
}

// Grid line endpoints theo edges của rhombus
function gridLines() {
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  // Lines song song trục col (chạy top→left, vạch theo từng col)
  for (let i = 1; i < COLS; i++) {
    const t = i / COLS;
    const a = {
      x: RH.top.x + t * (RH.right.x - RH.top.x),
      y: RH.top.y + t * (RH.right.y - RH.top.y),
    };
    const b = {
      x: RH.left.x + t * (RH.bottom.x - RH.left.x),
      y: RH.left.y + t * (RH.bottom.y - RH.left.y),
    };
    lines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
  }
  // Lines song song trục row (chạy top→right)
  for (let j = 1; j < ROWS; j++) {
    const t = j / ROWS;
    const a = {
      x: RH.top.x + t * (RH.left.x - RH.top.x),
      y: RH.top.y + t * (RH.left.y - RH.top.y),
    };
    const b = {
      x: RH.right.x + t * (RH.bottom.x - RH.right.x),
      y: RH.right.y + t * (RH.bottom.y - RH.right.y),
    };
    lines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
  }
  return lines;
}

export function IsometricGarden({
  monthStart,
  daysInMonth,
  entries,
  plantType,
  onCellPress,
  onPlantPress,
  onWeatherPress,
  onPrevMonth,
  onNextMonth,
  isAtCurrentMonth,
  topInset = 0,
  theme = 'sunny',
}: IsometricGardenProps) {
  const { width: screenW } = useWindowDimensions();
  const scale = screenW / FIGMA_W;
  const S = (v: number) => v * scale;
  const wx = WEATHER_CONFIGS[theme];

  const entryByDate = new Map<string, MoodEntry>();
  for (const e of entries) entryByDate.set(e.entry_date, e);

  const lines = gridLines();
  const today = new Date();

  // Plot SVG vùng: cao hơn rhombus 1 chút để chứa 3D depth (offset 16px)
  const plotSvgW = PLOT.w;
  const plotSvgH = PLOT.h + 20;

  return (
    <View style={[styles.scene, { width: screenW, height: S(FIGMA_H) }]}>
      {/* Sky + hills background (full canvas) */}
      <Svg width={screenW} height={S(FIGMA_H)} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={wx.skyTop} />
            <Stop offset="1" stopColor={wx.skyBottom} />
          </LinearGradient>
        </Defs>
        {/* Header bar */}
        <Rect x={0} y={0} width={screenW} height={S(131)} fill="#78C9E6" />
        {/* Sky */}
        <Rect x={0} y={S(128)} width={screenW} height={S(FIGMA_H - 128)} fill="url(#sky)" />
        {/* Hills — back (darker) + front (lighter) — theme-aware */}
        <Ellipse
          cx={S(-188 + 548 / 2)}
          cy={S(637 + 408 / 2)}
          rx={S(548 / 2)}
          ry={S(408 / 2)}
          fill={wx.hillBack}
        />
        <Ellipse
          cx={S(124 + 548 / 2)}
          cy={S(631 + 408 / 2)}
          rx={S(548 / 2)}
          ry={S(408 / 2)}
          fill={wx.hillFront}
        />
      </Svg>

      {/* Header: Garden title + icons (plain white — match Figma) */}
      <View style={[styles.headerBar, { top: topInset + S(8), width: screenW, paddingHorizontal: S(24) }]}>
        <Text style={[styles.headerTitle, { fontSize: S(24) }]}>Garden</Text>
        <View style={styles.headerIcons}>
          <Pressable onPress={onPlantPress} hitSlop={10}>
            <MaterialCommunityIcons name="flower-tulip" size={S(26)} color={colors.white} />
          </Pressable>
          <Pressable onPress={onWeatherPress} hitSlop={10}>
            <MaterialCommunityIcons name="weather-partly-cloudy" size={S(26)} color={colors.white} />
          </Pressable>
          <Pressable hitSlop={10}>
            <MaterialCommunityIcons name="music" size={S(26)} color={colors.white} />
          </Pressable>
        </View>
      </View>

      {/* Sun — chỉ sunny */}
      {wx.showSun ? (
        <Text style={[styles.deco, { left: S(330), top: S(141), fontSize: S(72) }]}>☀️</Text>
      ) : null}
      {/* Clouds — theme-aware emoji */}
      <Text style={[styles.deco, { left: S(21), top: S(140), fontSize: S(90) }]}>
        {theme === 'snowy' ? '🌨️' : theme === 'rainy' ? '🌧️' : '☁️'}
      </Text>
      <Text style={[styles.deco, { left: S(305), top: S(225), fontSize: S(72) }]}>
        {theme === 'snowy' ? '🌨️' : theme === 'rainy' ? '🌧️' : '☁️'}
      </Text>

      {/* Particles — snow / rain scattered */}
      {wx.particle !== 'none'
        ? PARTICLE_POSITIONS.map((pos, i) => (
            <Text
              key={i}
              style={[styles.deco, { left: S(pos.x), top: S(pos.y), fontSize: S(pos.size) }]}
            >
              {wx.particle === 'snow' ? '❄️' : '💧'}
            </Text>
          ))
        : null}

      {/* Date range + month nav + plant count */}
      <View style={[styles.headerRow, { top: S(132), width: screenW }]}>
        <View style={styles.dateNavRow}>
          <Pressable onPress={onPrevMonth} hitSlop={10} style={styles.navArrow}>
            <Ionicons name="chevron-back" size={S(20)} color="#15607D" />
          </Pressable>
          <Text style={[styles.dateText, { fontSize: S(20) }]}>
            {format(monthStart, 'MM.dd')} — {format(monthStart, 'MM')}.{daysInMonth}
          </Text>
          <Pressable
            onPress={onNextMonth}
            hitSlop={10}
            disabled={isAtCurrentMonth}
            style={styles.navArrow}
          >
            <Ionicons
              name="chevron-forward"
              size={S(20)}
              color={isAtCurrentMonth ? 'rgba(21,96,125,0.3)' : '#15607D'}
            />
          </Pressable>
        </View>
        <View style={styles.countRow}>
          <Text style={{ fontSize: S(16) }}>🌱</Text>
          <Text style={[styles.countText, { fontSize: S(22) }]}>{entries.length}</Text>
        </View>
      </View>

      {/* Isometric plot (3 layers) */}
      <View style={[styles.plotWrap, { left: S(PLOT.x), top: S(PLOT.y), width: S(plotSvgW), height: S(plotSvgH) }]}>
        <Svg width={S(plotSvgW)} height={S(plotSvgH)} viewBox={`0 0 ${plotSvgW} ${plotSvgH}`}>
          {/* bottom dark layer (+16) */}
          <Path d={PLOT_PATH} fill="#865A3D" translateY={16} />
          {/* mid soil layer (+8) */}
          <Path d={PLOT_PATH} fill="#947151" translateY={8} />
          {/* top grass layer */}
          <Path d={PLOT_PATH} fill="#8FD34A" />
          {/* grid lines */}
          {lines.map((ln, i) => (
            <Line
              key={i}
              x1={ln.x1}
              y1={ln.y1}
              x2={ln.x2}
              y2={ln.y2}
              stroke="rgba(255,255,255,0.45)"
              strokeWidth={1.5}
            />
          ))}
        </Svg>

        {/* Flowers positioned isometrically trên plot */}
        {Array.from({ length: TOTAL_CELLS }).map((_, idx) => {
          const day = idx + 1;
          if (day > daysInMonth) return null;
          const row = Math.floor(idx / COLS);
          const col = idx % COLS;
          const date = new Date(monthStart);
          date.setDate(day);
          const dateStr = format(date, 'yyyy-MM-dd');
          const entry = entryByDate.get(dateStr);
          if (!entry) return null;

          const p = cellToPoint(row, col);
          const flowerSize = 30;
          return (
            <Pressable
              key={idx}
              onPress={() => onCellPress?.(dateStr)}
              style={{
                position: 'absolute',
                left: S(p.x) - S(flowerSize) / 2,
                top: S(p.y) - S(flowerSize), // flower mọc lên trên điểm
                width: S(flowerSize),
                height: S(flowerSize),
              }}
            >
              <Flower moodLevel={entry.mood_level} plantType={plantType} size={S(flowerSize)} />
            </Pressable>
          );
        })}
      </View>

      {/* Bird trên rìa plot */}
      <Text style={[styles.deco, { left: S(353), top: S(372), fontSize: S(34) }]}>🐦</Text>

      {/* House trên hill */}
      <Text style={[styles.deco, { left: S(350), top: S(508), fontSize: S(40) }]}>🏠</Text>

      {/* Character trên hill — sheep (sunny/cloudy/rainy) hoặc snowman (snowy) */}
      <Text style={[styles.deco, { left: S(35), top: S(575), fontSize: S(60) }]}>{wx.character}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: {
    position: 'relative',
    alignSelf: 'center',
  },
  deco: {
    position: 'absolute',
  },
  headerBar: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: typography.fontFamily.extrabold,
    color: colors.white,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {
    position: 'absolute',
    alignItems: 'center',
    gap: 2,
  },
  dateNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navArrow: {
    padding: 2,
  },
  dateText: {
    fontFamily: typography.fontFamily.extrabold,
    color: '#15607D',
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countText: {
    fontFamily: typography.fontFamily.extrabold,
    color: '#15607D',
  },
  plotWrap: {
    position: 'absolute',
  },
});
