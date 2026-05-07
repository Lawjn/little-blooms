import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format, parseISO } from 'date-fns';
import { Flower } from '@/features/garden/components/Flower';
import { DEFAULT_PLANT } from '@/features/garden/mapping';
import { useInventory } from '@/features/inventory/hooks';
import { useUser } from '@/features/auth/store';
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
  const user = useUser();
  const entryQuery = useMoodEntry({ userId: user?.id, date: date ?? '' });
  const inventoryQuery = useInventory(user?.id);
  const activePlant = inventoryQuery.data?.active_plant ?? DEFAULT_PLANT;
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

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

  const dateLabel = format(parseISO(date), 'EEEE, MMMM d, yyyy');
  const entry = entryQuery.data;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Garden info</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {entryQuery.isLoading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : !entry ? (
          <Text style={styles.emptyText}>Không có entry cho ngày này.</Text>
        ) : (
          <>
            {/* Mood + date */}
            <View style={styles.heroBox}>
              <Flower moodLevel={entry.mood_level} plantType={activePlant} size={80} />
              <Text style={styles.dateText}>{dateLabel}</Text>
              <Text style={styles.moodLabel}>
                {MOOD_OPTIONS.find((m) => m.level === entry.mood_level)?.label}
              </Text>
            </View>

            {/* Tag sections — chỉ hiện section có data */}
            <TagSection title="Emotions" options={EMOTIONS} selected={entry.emotions} />
            <TagSection title="Hobbies" options={HOBBIES} selected={entry.hobbies} />
            <TagSection title="Meals" options={MEALS} selected={entry.meals} />
            <TagSection title="Self-Care" options={SELF_CARE} selected={entry.self_care} />
            <TagSection title="Weather" options={WEATHER} selected={entry.weather} />
            <TagSection title="Other" options={OTHER_TAGS} selected={entry.other_tags} />

            {/* Note */}
            {entry.note ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Note</Text>
                <Text style={styles.noteText}>{entry.note}</Text>
              </View>
            ) : null}

            {/* Photos */}
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
        )}
      </ScrollView>
    </SafeAreaView>
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
  safeArea: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.lg,
    color: colors.primary,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  loadingText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  emptyText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  heroBox: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    backgroundColor: colors.cream,
    borderRadius: radii.xl,
    ...shadows.sm,
  },
  dateText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
  },
  moodLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.md,
    color: colors.primary,
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
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
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
  photoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  photo: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radii.md,
  },
});
