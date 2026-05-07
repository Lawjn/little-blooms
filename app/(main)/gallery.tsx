import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { format, parseISO } from 'date-fns';
import { useUser } from '@/features/auth/store';
import { useAllPhotos } from '@/features/gallery/hooks';
import { MOOD_VISUAL } from '@/features/garden/mapping';
import { colors, radii, spacing, typography } from '@/lib/theme';

const COLS = 3;
const GAP = 4;

export default function GalleryScreen() {
  const router = useRouter();
  const user = useUser();
  const photosQuery = useAllPhotos(user?.id);
  const { width } = useWindowDimensions();
  const tileSize = (width - spacing.lg * 2 - GAP * (COLS - 1)) / COLS;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Photos</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {photosQuery.isLoading ? (
          <Text style={styles.stateText}>Loading photos...</Text>
        ) : photosQuery.data && photosQuery.data.length > 0 ? (
          <>
            <Text style={styles.subtitle}>
              {photosQuery.data.length} ảnh · tap để xem entry
            </Text>
            <View style={styles.grid}>
              {photosQuery.data.map((photo) => (
                <Pressable
                  key={photo.path}
                  onPress={() =>
                    router.push({
                      pathname: '/garden/[date]',
                      params: { date: photo.entryDate },
                    })
                  }
                  style={[styles.tile, { width: tileSize, height: tileSize }]}
                >
                  <Image
                    source={{ uri: photo.url }}
                    style={styles.image}
                    contentFit="cover"
                    transition={150}
                    cachePolicy="memory-disk"
                  />
                  <View
                    style={[
                      styles.moodDot,
                      { backgroundColor: MOOD_VISUAL[photo.moodLevel].bgColor },
                    ]}
                  />
                  <View style={styles.dateOverlay}>
                    <Text style={styles.dateText}>
                      {format(parseISO(photo.entryDate), 'MMM d')}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.empty}>
            <Ionicons name="images-outline" size={56} color={colors.text.secondary} />
            <Text style={styles.emptyTitle}>Chưa có ảnh nào</Text>
            <Text style={styles.emptySub}>
              Log mood ở Home tab và đính kèm ảnh — chúng sẽ xuất hiện ở đây.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  tile: {
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.greenLight,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  moodDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.white,
  },
  dateOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  dateText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 10,
    color: colors.white,
    textAlign: 'center',
  },
  stateText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  empty: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xxl,
  },
  emptyTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
  },
  emptySub: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
});
