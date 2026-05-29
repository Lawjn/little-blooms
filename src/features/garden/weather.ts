/**
 * Weather themes cho Garden — theo Figma "Choose your weather".
 * Lưu vào user_inventory.active_theme. 'default' → treat as 'sunny'.
 */
export type WeatherTheme = 'sunny' | 'cloudy' | 'rainy' | 'snowy';

export interface WeatherConfig {
  skyTop: string;
  skyBottom: string;
  showSun: boolean;
  cloudColor: string;
  particle: 'none' | 'snow' | 'rain';
  character: string; // emoji nhân vật ở hill (sheep / snowman)
  hillBack: string;
  hillFront: string;
}

export const WEATHER_CONFIGS: Record<WeatherTheme, WeatherConfig> = {
  sunny: {
    skyTop: '#9EE5FF',
    skyBottom: '#C8F0FF',
    showSun: true,
    cloudColor: '#FFFFFF',
    particle: 'none',
    character: '🐑',
    hillBack: '#75A843',
    hillFront: '#83BF4F',
  },
  cloudy: {
    skyTop: '#AEC4CE',
    skyBottom: '#CDD9DF',
    showSun: false,
    cloudColor: '#E8EDEF',
    particle: 'none',
    character: '🐑',
    hillBack: '#6E9A56',
    hillFront: '#7DA862',
  },
  rainy: {
    skyTop: '#7C909B',
    skyBottom: '#9DAEB7',
    showSun: false,
    cloudColor: '#C2CDD3',
    particle: 'rain',
    character: '🐑',
    hillBack: '#5E8A4E',
    hillFront: '#6E985C',
  },
  snowy: {
    skyTop: '#D6EFFF',
    skyBottom: '#EFF8FF',
    showSun: false,
    cloudColor: '#BFE4F5',
    particle: 'snow',
    character: '⛄',
    hillBack: '#A9C9B0',
    hillFront: '#BFD9C2',
  },
};

export function normalizeTheme(theme: string | undefined): WeatherTheme {
  if (theme === 'cloudy' || theme === 'rainy' || theme === 'snowy') return theme;
  return 'sunny';
}

export const WEATHER_OPTIONS: { theme: WeatherTheme; icon: string; color: string; label: string }[] = [
  { theme: 'sunny', icon: 'weather-sunny', color: '#FFA726', label: 'Sunny' },
  { theme: 'cloudy', icon: 'weather-cloudy', color: '#42A5F5', label: 'Cloudy' },
  { theme: 'rainy', icon: 'weather-pouring', color: '#7E57C2', label: 'Rainy' },
  { theme: 'snowy', icon: 'weather-snowy', color: '#4FC3F7', label: 'Snowy' },
];
