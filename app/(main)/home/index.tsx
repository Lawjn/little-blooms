import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format, isAfter, parseISO, startOfDay } from 'date-fns';
import { Button } from '@/components/Button';
import { MoodPicker } from '@/components/MoodPicker';
import { PhotoPicker, type PhotoSlot } from '@/components/PhotoPicker';
import { SectionCard } from '@/components/SectionCard';
import { TagGrid } from '@/components/TagGrid';
import { useUser } from '@/features/auth/store';
import {
  EMOTIONS,
  HOBBIES,
  MEALS,
  OTHER_TAGS,
  SELF_CARE,
  WEATHER,
} from '@/features/mood/data';
import { useMoodEntry, useSaveMoodEntry } from '@/features/mood/hooks';
import { SaveSuccessSheet } from '@/features/mood/components/SaveSuccessSheet';
import { getRandomQuote } from '@/features/mood/quotes';
import { getMoodPhotoSignedUrls, uploadMoodPhoto } from '@/features/mood/upload';
import { useInventory } from '@/features/inventory/hooks';
import { DEFAULT_PLANT } from '@/features/garden/mapping';
import { colors, radii, spacing, typography } from '@/lib/theme';
import type { MoodLevel } from '@/lib/theme';

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

  // Success sheet state
  const [successVisible, setSuccessVisible] = useState(false);
  const [successQuote, setSuccessQuote] = useState('');
  const [successIsUpdate, setSuccessIsUpdate] = useState(false);

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

  // Reset form state khi date đổi (user navigate sang ngày khác)
  useEffect(() => {
    setHydrated(false);
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

  // Prefill entry data + load signed URLs cho photos đã có
  useEffect(() => {
    if (hydrated) return;
    if (entryQuery.isLoading) return;

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

    // Convert photo paths → signed URLs để hiển thị
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

  const onSave = async () => {
    if (!user) return;
    if (isFutureDate) {
      Alert.alert(
        'Không thể log ngày tương lai',
        'Cảm xúc chỉ có thể log cho ngày hôm nay hoặc ngày trong quá khứ.',
      );
      return;
    }
    if (moodLevel === null) {
      Alert.alert('Chưa chọn mood', 'Bạn chưa chọn cảm xúc của ngày hôm nay.');
      return;
    }

    try {
      // 1) Upload pending photos PARALLEL — Promise.all thay vì sequential for loop.
      // 3 photos: ~3x nhanh hơn (mỗi upload chạy đồng thời thay vì xếp hàng).
      const uploadTasks = photos.map(async (slot, i) => {
        if (!slot) return null;
        if (slot.path) return slot.path; // đã có trong DB, không upload lại
        if (slot.pendingBase64) {
          return uploadMoodPhoto({
            userId: user.id,
            date: activeDate,
            index: i,
            asset: {
              uri: slot.uri,
              base64: slot.pendingBase64,
              mimeType: slot.pendingMime,
            },
          });
        }
        return null;
      });
      const uploadResults = await Promise.all(uploadTasks);
      const photoPaths = uploadResults.filter((p): p is string => p !== null);

      // 2) Upsert mood_entry với photo_urls
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
      // Show success sheet thay vì Alert — engagement loop
      setSuccessQuote(getRandomQuote());
      setSuccessIsUpdate(wasExisting);
      setSuccessVisible(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lưu thất bại';
      Alert.alert('Lỗi lưu entry', msg);
    }
  };

  if (entryQuery.isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingBox}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
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

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <SectionCard title="How was your day?">
            <MoodPicker value={moodLevel} onChange={setMoodLevel} />
          </SectionCard>

          <SectionCard title="Emotions">
            <TagGrid options={EMOTIONS} selected={emotions} onChange={setEmotions} />
          </SectionCard>

          <SectionCard title="Hobbies">
            <TagGrid options={HOBBIES} selected={hobbies} onChange={setHobbies} />
          </SectionCard>

          <SectionCard title="Meals">
            <TagGrid options={MEALS} selected={meals} onChange={setMeals} />
          </SectionCard>

          <SectionCard title="Self-Care">
            <TagGrid options={SELF_CARE} selected={selfCare} onChange={setSelfCare} />
          </SectionCard>

          <SectionCard title="Weather">
            <TagGrid options={WEATHER} selected={weather} onChange={setWeather} />
          </SectionCard>

          <SectionCard title="Other">
            <TagGrid options={OTHER_TAGS} selected={otherTags} onChange={setOtherTags} />
          </SectionCard>

          <SectionCard title="Today's note">
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Write here..."
              placeholderTextColor={colors.text.secondary}
              multiline
              style={styles.noteInput}
              textAlignVertical="top"
            />
          </SectionCard>

          <SectionCard title="Today's photo">
            <PhotoPicker photos={photos} onChange={setPhotos} />
          </SectionCard>

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

          {isFutureDate ? (
            <View style={styles.futureNotice}>
              <Ionicons name="time-outline" size={20} color={colors.text.secondary} />
              <Text style={styles.futureNoticeText}>
                Không thể log cảm xúc cho ngày tương lai.
              </Text>
            </View>
          ) : (
            <Button
              label={entryQuery.data ? 'Update' : 'Done'}
              onPress={onSave}
              loading={saveMutation.isPending}
              fullWidth
              style={styles.doneBtn}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  flex: { flex: 1 },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  headerDate: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.lg,
    color: colors.primary,
  },
  headerSpacer: { width: 22 },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  noteInput: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: spacing.md,
    minHeight: 80,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  doneBtn: { marginTop: spacing.md },
  futureNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.cream,
    padding: spacing.md,
    borderRadius: radii.lg,
    marginTop: spacing.md,
  },
  futureNoticeText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
