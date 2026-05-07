import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format, isAfter, parseISO, startOfDay } from 'date-fns';
import { Button } from '@/components/Button';
import type { PhotoSlot } from '@/components/PhotoPicker';
import { useUser } from '@/features/auth/store';
import { DEFAULT_PLANT } from '@/features/garden/mapping';
import { useInventory } from '@/features/inventory/hooks';
import { SaveSuccessSheet } from '@/features/mood/components/SaveSuccessSheet';
import { StepProgress } from '@/features/mood/components/StepProgress';
import { ActivitiesStep } from '@/features/mood/components/steps/ActivitiesStep';
import { EmotionsStep } from '@/features/mood/components/steps/EmotionsStep';
import { MoodStep } from '@/features/mood/components/steps/MoodStep';
import { NoteStep } from '@/features/mood/components/steps/NoteStep';
import { PhotosStep } from '@/features/mood/components/steps/PhotosStep';
import { useMoodEntry, useSaveMoodEntry } from '@/features/mood/hooks';
import { getRandomQuote } from '@/features/mood/quotes';
import { getMoodPhotoSignedUrls, uploadMoodPhoto } from '@/features/mood/upload';
import { colors, radii, spacing, typography } from '@/lib/theme';
import type { MoodLevel } from '@/lib/theme';

const STEPS = ['mood', 'emotions', 'activities', 'note', 'photos'] as const;
type Step = (typeof STEPS)[number];

const STEP_HEADER: Record<Step, string> = {
  mood: 'Step 1 / 5',
  emotions: 'Step 2 / 5',
  activities: 'Step 3 / 5',
  note: 'Step 4 / 5',
  photos: 'Step 5 / 5',
};

const AUTO_ADVANCE_MS = 350;

export default function HomeScreen() {
  const user = useUser();
  const router = useRouter();
  const { date: dateParam } = useLocalSearchParams<{ date?: string }>();
  const activeDate = dateParam ?? format(new Date(), 'yyyy-MM-dd');
  const dateLabel = format(parseISO(activeDate), 'EEEE, MMMM d');

  const entryQuery = useMoodEntry({ userId: user?.id, date: activeDate });
  const saveMutation = useSaveMoodEntry();
  const inventoryQuery = useInventory(user?.id);
  const activePlant = inventoryQuery.data?.active_plant ?? DEFAULT_PLANT;

  const isFutureDate = isAfter(startOfDay(parseISO(activeDate)), startOfDay(new Date()));

  // Step state
  const [step, setStep] = useState<Step>('mood');
  const stepIndex = STEPS.indexOf(step);
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEPS.length - 1;

  // Form state
  const [moodLevel, setMoodLevel] = useState<MoodLevel | null>(null);
  const [emotions, setEmotions] = useState<string[]>([]);
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [meals, setMeals] = useState<string[]>([]);
  const [selfCare, setSelfCare] = useState<string[]>([]);
  const [weather, setWeather] = useState<string[]>([]);
  const [otherTags, setOtherTags] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [photos, setPhotos] = useState<(PhotoSlot | null)[]>([null, null, null]);
  const [hydrated, setHydrated] = useState(false);

  // Success sheet
  const [successVisible, setSuccessVisible] = useState(false);
  const [successQuote, setSuccessQuote] = useState('');
  const [successIsUpdate, setSuccessIsUpdate] = useState(false);

  // Reset form khi date đổi
  useEffect(() => {
    setHydrated(false);
    setStep('mood');
    setMoodLevel(null);
    setEmotions([]);
    setHobbies([]);
    setMeals([]);
    setSelfCare([]);
    setWeather([]);
    setOtherTags([]);
    setNote('');
    setPhotos([null, null, null]);
  }, [activeDate]);

  // Prefill khi load entry cũ
  useEffect(() => {
    if (hydrated || entryQuery.isLoading) return;
    const data = entryQuery.data;
    if (!data) {
      setHydrated(true);
      return;
    }
    setMoodLevel(data.mood_level);
    setEmotions(data.emotions);
    setHobbies(data.hobbies);
    setMeals(data.meals);
    setSelfCare(data.self_care);
    setWeather(data.weather);
    setOtherTags(data.other_tags);
    setNote(data.note ?? '');
    if (data.photo_urls.length > 0) {
      getMoodPhotoSignedUrls(data.photo_urls)
        .then((urls) => {
          const next: (PhotoSlot | null)[] = [null, null, null];
          urls.forEach((url, idx) => {
            next[idx] = { uri: url, path: data.photo_urls[idx] };
          });
          setPhotos(next);
        })
        .catch((err) => console.warn('[photo signed url]', err));
    }
    setHydrated(true);
  }, [entryQuery.data, entryQuery.isLoading, hydrated]);

  const goNext = () => {
    if (!isLast) setStep(STEPS[stepIndex + 1]);
  };
  const goPrev = () => {
    if (!isFirst) setStep(STEPS[stepIndex - 1]);
  };

  const handleMoodPick = (level: MoodLevel) => {
    setMoodLevel(level);
    // Auto-advance sau pick mood (UX guided)
    setTimeout(() => goNext(), AUTO_ADVANCE_MS);
  };

  const onSave = async () => {
    if (!user) return;
    if (isFutureDate) {
      Alert.alert('Không thể log ngày tương lai', 'Cảm xúc chỉ log cho ngày hôm nay/quá khứ.');
      return;
    }
    if (moodLevel === null) {
      Alert.alert('Chưa chọn mood', 'Quay lại Step 1 để chọn cảm xúc.');
      return;
    }

    try {
      // Parallel photo upload
      const uploadTasks = photos.map(async (slot, i) => {
        if (!slot) return null;
        if (slot.path) return slot.path;
        if (slot.pendingBase64) {
          return uploadMoodPhoto({
            userId: user.id,
            date: activeDate,
            index: i,
            asset: { uri: slot.uri, base64: slot.pendingBase64, mimeType: slot.pendingMime },
          });
        }
        return null;
      });
      const uploadResults = await Promise.all(uploadTasks);
      const photoPaths = uploadResults.filter((p): p is string => p !== null);

      const wasExisting = !!entryQuery.data;
      await saveMutation.mutateAsync({
        userId: user.id,
        input: {
          entry_date: activeDate,
          mood_level: moodLevel,
          emotions,
          hobbies,
          meals,
          self_care: selfCare,
          weather,
          other_tags: otherTags,
          note: note.trim() || null,
          photo_urls: photoPaths,
        },
      });

      setSuccessQuote(getRandomQuote());
      setSuccessIsUpdate(wasExisting);
      setSuccessVisible(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lưu thất bại';
      Alert.alert('Lỗi lưu entry', msg);
    }
  };

  // Loading state
  if (entryQuery.isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingBox}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Future date guard — override toàn bộ
  if (isFutureDate) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Pressable
            onPress={() => router.push('/home/calendar')}
            style={styles.headerCenter}
            hitSlop={8}
          >
            <Text style={styles.headerDate}>{dateLabel}</Text>
            <Ionicons name="chevron-down" size={16} color={colors.primary} />
          </Pressable>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.futureBox}>
          <Ionicons name="time-outline" size={56} color={colors.text.secondary} />
          <Text style={styles.futureTitle}>Tương lai chưa tới</Text>
          <Text style={styles.futureText}>
            Cảm xúc chỉ log được cho ngày hôm nay hoặc quá khứ. Quay lại sau nhé.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render step content
  const renderStep = () => {
    switch (step) {
      case 'mood':
        return <MoodStep value={moodLevel} onChange={handleMoodPick} />;
      case 'emotions':
        return <EmotionsStep value={emotions} onChange={setEmotions} />;
      case 'activities':
        return (
          <ActivitiesStep
            hobbies={hobbies}
            setHobbies={setHobbies}
            meals={meals}
            setMeals={setMeals}
            selfCare={selfCare}
            setSelfCare={setSelfCare}
            weather={weather}
            setWeather={setWeather}
            otherTags={otherTags}
            setOtherTags={setOtherTags}
          />
        );
      case 'note':
        return <NoteStep value={note} onChange={setNote} />;
      case 'photos':
        return <PhotosStep value={photos} onChange={setPhotos} />;
    }
  };

  const canSave = moodLevel !== null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.push('/home/calendar')}
          hitSlop={8}
          style={styles.headerLeft}
        >
          <Ionicons name="calendar-outline" size={22} color={colors.primary} />
        </Pressable>
        <Pressable
          onPress={() => router.push('/home/calendar')}
          style={styles.headerCenter}
          hitSlop={8}
        >
          <Text style={styles.headerDate}>{dateLabel}</Text>
          <Ionicons name="chevron-down" size={14} color={colors.primary} />
        </Pressable>
        <View style={styles.headerRight}>
          <Text style={styles.stepLabel}>{STEP_HEADER[step]}</Text>
        </View>
      </View>

      {/* Progress */}
      <StepProgress current={stepIndex} total={STEPS.length} />

      {/* Content */}
      <View style={styles.content}>{renderStep()}</View>

      {/* Footer */}
      <View style={styles.footer}>
        {!isFirst ? (
          <Pressable onPress={goPrev} style={styles.footerLink} hitSlop={8}>
            <Ionicons name="chevron-back" size={18} color={colors.text.secondary} />
            <Text style={styles.footerLinkText}>Back</Text>
          </Pressable>
        ) : (
          <View style={styles.footerSpacer} />
        )}

        {isLast ? (
          <Button
            label={entryQuery.data ? 'Update' : 'Done'}
            onPress={onSave}
            loading={saveMutation.isPending}
            disabled={!canSave}
            style={styles.primaryBtn}
          />
        ) : step === 'mood' ? (
          // Mood step auto-advances, hide Next button (vẫn có Skip)
          <Pressable onPress={goNext} style={styles.footerLink} hitSlop={8}>
            <Text style={styles.footerLinkText}>Skip</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.text.secondary} />
          </Pressable>
        ) : (
          <Button label="Next" onPress={goNext} style={styles.primaryBtn} />
        )}

        {!isFirst && !isLast ? (
          <Pressable
            onPress={canSave ? onSave : undefined}
            disabled={!canSave || saveMutation.isPending}
            hitSlop={8}
            style={styles.footerLink}
          >
            <Text style={[styles.footerLinkText, !canSave && styles.disabled]}>
              Save now
            </Text>
          </Pressable>
        ) : (
          <View style={styles.footerSpacer} />
        )}
      </View>

      {/* Success sheet */}
      <SaveSuccessSheet
        visible={successVisible}
        onDismiss={() => setSuccessVisible(false)}
        onViewGarden={() => {
          setSuccessVisible(false);
          router.push('/garden' as never);
        }}
        plantType={activePlant}
        moodLevel={moodLevel}
        isUpdate={successIsUpdate}
        quote={successQuote}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  headerLeft: {
    width: 40,
    alignItems: 'flex-start',
  },
  headerSpacer: {
    width: 40,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  headerDate: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.md,
    color: colors.primary,
  },
  headerRight: {
    width: 60,
    alignItems: 'flex-end',
  },
  stepLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  content: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.sm,
    minWidth: 70,
  },
  footerLinkText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  footerSpacer: {
    minWidth: 70,
  },
  primaryBtn: {
    minWidth: 140,
  },
  disabled: {
    opacity: 0.4,
  },
  futureBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  futureTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
  },
  futureText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
