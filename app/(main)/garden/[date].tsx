import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format, parseISO } from 'date-fns';
import { Flower } from '@/features/garden/components/Flower';
import { SinglePlantScene } from '@/features/garden/components/SinglePlantScene';
import { DEFAULT_PLANT } from '@/features/garden/mapping';
import { normalizeTheme } from '@/features/garden/weather';
import { useInventory, useWaterPlant } from '@/features/inventory/hooks';
import { useUser } from '@/features/auth/store';
import { Toast } from '@/components/Toast';
import { PulseTimelineCard } from '@/features/pulse/components/PulseTimelineCard';
import { useDeletePulse, useTodayPulses } from '@/features/pulse/hooks';
import {
  EMOTIONS,
  HOBBIES,
  MEALS,
  OTHER_TAGS,
  SELF_CARE,
  WEATHER,
  type TagOption,
} from '@/features/mood/data';
import { useMoodEntry } from '@/features/mood/hooks';
import { MOOD_OPTIONS } from '@/components/MoodPicker';
import { getMoodPhotoSignedUrls } from '@/features/mood/upload';
import { colors, radii, shadows, spacing, typography } from '@/lib/theme';

export default function GardenInfoScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: screenH } = useWindowDimensions();
  const user = useUser();
  const entryQuery = useMoodEntry({ userId: user?.id, date: date ?? '' });
  const inventoryQuery = useInventory(user?.id);
  const activePlant = inventoryQuery.data?.active_plant ?? DEFAULT_PLANT;
  const activeTheme = normalizeTheme(inventoryQuery.data?.active_theme);
  const pulsesQuery = useTodayPulses({ userId: user?.id, date: date ?? '' });
  const deletePulse = useDeletePulse();
  const waterMutation = useWaterPlant();
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const paths = entryQuery.data?.photo_urls ?? [];
    if (paths.length === 0) {
      setPhotoUrls([]);
      return;
    }
    getMoodPhotoSignedUrls(paths)
      .then(setPhotoUrls)
      .catch((err) => console.warn('[garden info photo url]', err));
  }, [entryQuery.data?.photo_urls]);

  if (!date) return null;

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const isToday = date === todayStr;
  const alreadyWatered = inventoryQuery.data?.last_watered_date === todayStr;
  const waterStreak = inventoryQuery.data?.water_streak ?? 0;
  const dateLabelShort = format(parseISO(date), 'MMM d');
  const dateLabelFull = format(parseISO(date), 'EEEE, MMMM d, yyyy');
  const entry = entryQuery.data;
  const sceneHeight = Math.min(screenH * 0.62, 560);

  const handleWater = () => {
    if (!user) return;
    waterMutation.mutate(
      { userId: user.id, todayStr },
      {
        onSuccess: (result) => {
          if (result.alreadyWatered) {
            setToastMsg('Đã tưới hôm nay rồi 💧');
          } else {
            setToastMsg(`Đã tưới! 🔥 Streak ${result.inventory.water_streak} ngày`);
          }
        },
      },
    );
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Hero: single plant garden scene */}
        {entry ? (
          <SinglePlantScene
            moodLevel={entry.mood_level}
            plantType={activePlant}
            theme={activeTheme}
            dateLabel={dateLabelShort}
            isToday={isToday}
            alreadyWatered={alreadyWatered}
            waterStreak={waterStreak}
            onWater={handleWater}
            topInset={insets.top}
            height={sceneHeight}
          />
        ) : (
          <View style={[styles.emptyHero, { paddingTop: insets.top + spacing.xxl }]}>
            <Text style={styles.emptyText}>
              {pulsesQuery.data && pulsesQuery.data.length > 0
                ? 'Chưa có main entry — chỉ có pulses'
                : 'Không có entry cho ngày này.'}
            </Text>
          </View>
        )}

        {/* Detail cards */}
        <View style={styles.details}>
          {entry ? (
            <>
              <View style={styles.moodHeader}>
                <Flower moodLevel={entry.mood_level} plantType={activePlant} size={40} />
                <View>
                  <Text style={styles.moodLabel}>
                    {MOOD_OPTIONS.find((m) => m.level === entry.mood_level)?.label}
                  </Text>
                  <Text style={styles.dateSubtle}>{dateLabelFull}</Text>
                </View>
              </View>

              <TagSection title="Emotions" options={EMOTIONS} selected={entry.emotions} />
              <TagSection title="Hobbies" options={HOBBIES} selected={entry.hobbies} />
              <TagSection title="Meals" options={MEALS} selected={entry.meals} />
              <TagSection title="Self-Care" options={SELF_CARE} selected={entry.self_care} />
              <TagSection title="Weather" options={WEATHER} selected={entry.weather} />
              <TagSection title="Other" options={OTHER_TAGS} selected={entry.other_tags} />

              {entry.note ? (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Note</Text>
                  <Text style={styles.noteText}>{entry.note}</Text>
                </View>
              ) : null}

              {photoUrls.length > 0 ? (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Photos</Text>
                  <View style={styles.photoRow}>
                    {photoUrls.map((url, idx) => (
                      <Image
                        key={idx}
                        source={{ uri: url }}
                        style={styles.photo}
                        contentFit="cover"
                        transition={200}
                        cachePolicy="memory-disk"
                      />
                    ))}
                  </View>
                </View>
              ) : null}
            </>
          ) : null}

          {pulsesQuery.data && pulsesQuery.data.length > 0 ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                Pulses throughout the day ({pulsesQuery.data.length})
              </Text>
              <View style={styles.pulseList}>
                {pulsesQuery.data.map((pulse) => (
                  <PulseTimelineCard
                    key={pulse.id}
                    pulse={pulse}
                    onDelete={(id) => deletePulse.mutate(id)}
                  />
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Back button overlay */}
      <SafeAreaView style={styles.backWrap} edges={['top']} pointerEvents="box-none">
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={colors.white} />
        </Pressable>
      </SafeAreaView>

      <Toast
        visible={!!toastMsg}
        message={toastMsg ?? ''}
        variant="success"
        onHide={() => setToastMsg(null)}
      />
    </View>
  );
}

interface TagSectionProps {
  title: string;
  options: readonly TagOption[];
  selected: string[];
}

function TagSection({ title, options, selected }: TagSectionProps) {
  if (selected.length === 0) return null;
  const selectedOptions = options.filter((opt) => selected.includes(opt.value));
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={styles.tagRow}>
        {selectedOptions.map((opt) => (
          <View key={opt.value} style={styles.tagChip}>
            <Text style={styles.tagLabel}>{opt.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  scroll: { flexGrow: 1 },
  backWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  backBtn: {
    margin: spacing.sm,
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHero: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  details: {
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.white,
  },
  moodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  moodLabel: {
    fontFamily: typography.fontFamily.extrabold,
    fontSize: typography.sizes.lg,
    color: colors.primary,
  },
  dateSubtle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  card: {
    backgroundColor: colors.cream,
    borderRadius: radii.xl,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.md,
    color: colors.primary,
  },
  noteText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    lineHeight: 22,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tagChip: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  tagLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  photoRow: { flexDirection: 'row', gap: spacing.sm },
  photo: { flex: 1, aspectRatio: 1, borderRadius: radii.md },
  pulseList: { gap: spacing.sm },
});
