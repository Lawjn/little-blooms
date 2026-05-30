import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  addMonths,
  endOfMonth,
  format,
  getDaysInMonth,
  isSameMonth,
  parseISO,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { IsometricGarden } from '@/features/garden/components/IsometricGarden';
import { WeatherPicker } from '@/features/garden/components/WeatherPicker';
import { WateringCanButton } from '@/features/garden/components/WateringCanButton';
import { useMonthMoodEntries } from '@/features/garden/hooks';
import { DEFAULT_PLANT } from '@/features/garden/mapping';
import { normalizeTheme, type WeatherTheme } from '@/features/garden/weather';
import { useInventory, useUpdateActiveTheme } from '@/features/inventory/hooks';
import { usePulsesInRange } from '@/features/pulse/hooks';
import { PlantSwitcher } from '@/features/profile/components/PlantSwitcher';
import { useUser } from '@/features/auth/store';
import { Button } from '@/components/Button';
import { colors, radii, spacing } from '@/lib/theme';
import type { MoodEntry } from '@/features/mood/types';
import type { MoodLevel } from '@/lib/theme';

export default function GardenScreen() {
  const user = useUser();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const today = new Date();
  const [viewDate, setViewDate] = useState<Date>(today);
  const yearMonth = format(viewDate, 'yyyy-MM');
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const daysInMonth = getDaysInMonth(viewDate);
  const isAtCurrentMonth = isSameMonth(viewDate, today);

  const entriesQuery = useMonthMoodEntries({ userId: user?.id, yearMonth });
  const pulsesRangeQuery = usePulsesInRange({
    userId: user?.id,
    startDate: format(monthStart, 'yyyy-MM-dd'),
    endDate: format(monthEnd, 'yyyy-MM-dd'),
  });

  // Merge entries + synthetic entries từ pulses (days không có main entry → avg mood)
  const enhancedEntries = useMemo<MoodEntry[]>(() => {
    const realEntries = entriesQuery.data ?? [];
    const pulses = pulsesRangeQuery.data ?? [];
    const realDates = new Set(realEntries.map((e) => e.entry_date));

    const pulsesByDate = new Map<string, { sum: number; count: number }>();
    for (const p of pulses) {
      const date = format(parseISO(p.logged_at), 'yyyy-MM-dd');
      const acc = pulsesByDate.get(date) ?? { sum: 0, count: 0 };
      acc.sum += p.mood_level;
      acc.count += 1;
      pulsesByDate.set(date, acc);
    }

    const synthetic: MoodEntry[] = [];
    for (const [date, { sum, count }] of pulsesByDate.entries()) {
      if (realDates.has(date)) continue;
      const avg = Math.max(1, Math.min(5, Math.round(sum / count))) as MoodLevel;
      synthetic.push({
        id: `synthetic-${date}`,
        user_id: user?.id ?? '',
        entry_date: date,
        mood_level: avg,
        emotions: [],
        hobbies: [],
        meals: [],
        self_care: [],
        weather: [],
        other_tags: [],
        note: null,
        photo_urls: [],
        created_at: '',
        updated_at: '',
      });
    }
    return [...realEntries, ...synthetic];
  }, [entriesQuery.data, pulsesRangeQuery.data, user?.id]);

  const inventoryQuery = useInventory(user?.id);
  const activePlant = inventoryQuery.data?.active_plant ?? DEFAULT_PLANT;
  const activeTheme = normalizeTheme(inventoryQuery.data?.active_theme);
  const updateTheme = useUpdateActiveTheme();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [weatherOpen, setWeatherOpen] = useState(false);

  const onCellPress = (date: string) => {
    router.push({ pathname: '/garden/[date]', params: { date } });
  };

  const onSelectTheme = (theme: WeatherTheme) => {
    if (user) updateTheme.mutate({ userId: user.id, theme });
  };

  // Bấm bình tưới ngoài vườn → chuyển vào cây hoa hôm nay để tưới trực tiếp
  const handleWater = () => {
    onCellPress(format(today, 'yyyy-MM-dd'));
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <IsometricGarden
          monthStart={monthStart}
          daysInMonth={daysInMonth}
          entries={enhancedEntries}
          plantType={activePlant}
          theme={activeTheme}
          topInset={insets.top}
          isAtCurrentMonth={isAtCurrentMonth}
          onCellPress={onCellPress}
          onPlantPress={() => setPickerOpen(true)}
          onWeatherPress={() => setWeatherOpen(true)}
          onPrevMonth={() => setViewDate((d) => subMonths(d, 1))}
          onNextMonth={() => !isAtCurrentMonth && setViewDate((d) => addMonths(d, 1))}
        />
      </ScrollView>

      {/* Floating watering can — tưới để nhận lời động viên (chỉ tháng hiện tại) */}
      {isAtCurrentMonth ? (
        <WateringCanButton
          onWater={handleWater}
          style={[styles.waterFab, { bottom: insets.bottom + spacing.md }]}
        />
      ) : null}

      {/* Weather picker modal */}
      <WeatherPicker
        visible={weatherOpen}
        current={activeTheme}
        onClose={() => setWeatherOpen(false)}
        onSelect={onSelectTheme}
      />

      {/* Plant picker modal */}
      <Modal
        visible={pickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setPickerOpen(false)}>
          <Pressable style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <PlantSwitcher />
            <Button label="Done" onPress={() => setPickerOpen(false)} fullWidth />
          </Pressable>
        </Pressable>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#78C9E6',
  },
  scroll: {
    flexGrow: 1,
  },
  waterFab: {
    position: 'absolute',
    right: spacing.lg,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
    alignSelf: 'center',
  },
});
