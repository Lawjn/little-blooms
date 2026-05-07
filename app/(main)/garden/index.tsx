import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  addMonths,
  endOfMonth,
  format,
  getDaysInMonth,
  isSameMonth,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { GardenGrid } from '@/features/garden/components/GardenGrid';
import { useMonthMoodEntries } from '@/features/garden/hooks';
import { DEFAULT_PLANT, PLANT_LABEL } from '@/features/garden/mapping';
import { useInventory } from '@/features/inventory/hooks';
import { PlantSwitcher } from '@/features/profile/components/PlantSwitcher';
import { useUser } from '@/features/auth/store';
import { Button } from '@/components/Button';
import { colors, radii, shadows, spacing, typography } from '@/lib/theme';

export default function GardenScreen() {
  const user = useUser();
  const router = useRouter();
  const today = new Date();
  const [viewDate, setViewDate] = useState<Date>(today);
  const yearMonth = format(viewDate, 'yyyy-MM');
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const daysInMonth = getDaysInMonth(viewDate);
  const dateRangeLabel = `${format(monthStart, 'MM.dd')} — ${format(monthEnd, 'MM.dd')}`;
  const isAtCurrentMonth = isSameMonth(viewDate, today);

  const entriesQuery = useMonthMoodEntries({
    userId: user?.id,
    yearMonth,
  });

  const plantCount = useMemo(() => entriesQuery.data?.length ?? 0, [entriesQuery.data]);
  const inventoryQuery = useInventory(user?.id);
  const activePlant = inventoryQuery.data?.active_plant ?? DEFAULT_PLANT;
  const [pickerOpen, setPickerOpen] = useState(false);

  const onCellPress = (date: string) => {
    router.push({ pathname: '/garden/[date]', params: { date } });
  };

  return (
    <View style={styles.root}>
      {/* Sky background gradient */}
      <View style={styles.skyTop} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Garden</Text>
          <View style={styles.headerIcons}>
            <Pressable
              onPress={() => setPickerOpen(true)}
              hitSlop={8}
              style={[styles.headerIconBtn, styles.iconPlant]}
            >
              <MaterialCommunityIcons name="flower-tulip" size={20} color={colors.white} />
            </Pressable>
            <Pressable hitSlop={8} style={[styles.headerIconBtn, styles.iconWeather]}>
              <MaterialCommunityIcons name="weather-partly-cloudy" size={20} color={colors.white} />
            </Pressable>
            <Pressable hitSlop={8} style={[styles.headerIconBtn, styles.iconMusic]}>
              <MaterialCommunityIcons name="music" size={20} color={colors.white} />
            </Pressable>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Date range + plant count */}
          <View style={styles.statsRow}>
            <View style={styles.monthNav}>
              <Pressable onPress={() => setViewDate((d) => subMonths(d, 1))} hitSlop={12}>
                <Ionicons name="chevron-back" size={22} color={colors.white} />
              </Pressable>
              <Text style={styles.dateRange}>{format(viewDate, 'MMMM yyyy')}</Text>
              <Pressable
                onPress={() => !isAtCurrentMonth && setViewDate((d) => addMonths(d, 1))}
                hitSlop={12}
                disabled={isAtCurrentMonth}
              >
                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color={isAtCurrentMonth ? 'rgba(255,255,255,0.3)' : colors.white}
                />
              </Pressable>
            </View>
            <Text style={styles.dateRangeSub}>{dateRangeLabel}</Text>
            <View style={styles.countRow}>
              <Text style={styles.countEmoji}>🌱</Text>
              <Text style={styles.countNumber}>{plantCount}</Text>
            </View>
            <Text style={styles.plantName}>{PLANT_LABEL[activePlant]} garden</Text>
          </View>

          {/* Decorations: sun + clouds */}
          <View style={styles.skyDecorations}>
            <Text style={styles.cloudLeft}>☁️</Text>
            <Text style={styles.sun}>☀️</Text>
            <Text style={styles.cloudRight}>☁️</Text>
          </View>

          {/* Grid */}
          {entriesQuery.isLoading ? (
            <View style={styles.loadingBox}>
              <Text style={styles.loadingText}>Loading garden...</Text>
            </View>
          ) : (
            <GardenGrid
              monthStart={monthStart}
              daysInMonth={daysInMonth}
              entries={entriesQuery.data ?? []}
              plantType={activePlant}
              onCellPress={onCellPress}
            />
          )}

          {/* Foreground decorations: hills + sheep + bird + house */}
          <View style={styles.foreground}>
            <Text style={styles.sheep}>🐑</Text>
            <Text style={styles.bird}>🐦</Text>
            <Text style={styles.house}>🏠</Text>
          </View>

          {plantCount === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                Vườn chưa có cây nào — hãy log mood ở Home tab để cây hoa mọc!
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>

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
    backgroundColor: colors.sky,
  },
  skyTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: '#B3E5FC',
  },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerSpacer: { width: 90 },
  headerTitle: {
    fontFamily: typography.fontFamily.extrabold,
    fontSize: typography.sizes.xl,
    color: colors.white,
    flex: 1,
    textAlign: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: 90,
    justifyContent: 'flex-end',
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  iconPlant: {
    backgroundColor: '#EC407A', // hồng đậm — match garden/flower theme
  },
  iconWeather: {
    backgroundColor: '#FB8C00', // cam — match weather/sun
  },
  iconMusic: {
    backgroundColor: '#7E57C2', // tím — match music
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl * 2,
  },
  statsRow: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  dateRange: {
    fontFamily: typography.fontFamily.extrabold,
    fontSize: typography.sizes.lg,
    color: colors.white,
    minWidth: 140,
    textAlign: 'center',
  },
  dateRangeSub: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    color: 'rgba(255,255,255,0.85)',
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  countEmoji: {
    fontSize: 20,
  },
  countNumber: {
    fontFamily: typography.fontFamily.extrabold,
    fontSize: typography.sizes.xl,
    color: colors.white,
  },
  plantName: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.sm,
    color: 'rgba(255,255,255,0.85)',
    marginTop: spacing.xs,
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
  skyDecorations: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  cloudLeft: { fontSize: 36 },
  sun: { fontSize: 48 },
  cloudRight: { fontSize: 32 },
  loadingBox: {
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    color: colors.white,
  },
  foreground: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginTop: spacing.md,
  },
  sheep: { fontSize: 40 },
  bird: { fontSize: 32 },
  house: { fontSize: 36 },
  emptyBox: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    padding: spacing.lg,
    borderRadius: radii.lg,
    marginTop: spacing.md,
  },
  emptyText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    textAlign: 'center',
  },
});
