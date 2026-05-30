/**
 * Design tokens cho Little Blooms.
 * Single source of truth — không hardcode màu/spacing trong component.
 * Tham khảo Figma: https://www.figma.com/design/DOGpUXq5sQdj7ZNQ17GVxH/Little-Blooms-UX-UI
 */

export const colors = {
  primary: '#7CB342',
  primaryDark: '#558B2F',
  primaryLight: '#AED581',

  cream: '#FFF8E7',
  greenLight: '#E8F5E8',
  sky: '#A8DADC',

  // Garden center FAB (tab bar) — pink theo Figma
  accent: '#F19EC2',
  accentDark: '#E57BA8',
  tabBar: '#C7E7C2',

  mood: {
    veryGood: { main: '#7CB342', light: '#C5E1A5' },
    good: { main: '#FFEB3B', light: '#FFF59D' },
    neutral: { main: '#FFC107', light: '#FFE082' },
    bad: { main: '#FF7043', light: '#FFAB91' },
    veryBad: { main: '#9575CD', light: '#D1C4E9' },
  },

  text: {
    primary: '#212121',
    secondary: '#757575',
    inverse: '#FFFFFF',
  },

  border: '#E0E0E0',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  error: '#E53935',
  success: '#43A047',
  warning: '#FB8C00',
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 32,
  full: 9999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const typography = {
  fontFamily: {
    regular: 'Nunito_400Regular',
    semibold: 'Nunito_600SemiBold',
    bold: 'Nunito_700Bold',
    extrabold: 'Nunito_800ExtraBold',
  },
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    display: 40,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
} as const;

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export const moodLabels: Record<MoodLevel, string> = {
  1: 'Very Bad',
  2: 'Bad',
  3: 'Neutral',
  4: 'Good',
  5: 'Very Good',
};
