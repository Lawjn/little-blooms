import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radii, shadows, spacing, typography } from '@/lib/theme';

export default function StoreHomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cửa hàng</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Section: Plants — miễn phí */}
        <Pressable
          onPress={() => router.push('/store/plants' as never)}
          style={({ pressed }) => [styles.sectionCard, pressed && styles.pressed]}
        >
          <View style={[styles.iconBox, { backgroundColor: '#EC407A' }]}>
            <MaterialCommunityIcons name="flower-tulip" size={28} color={colors.white} />
          </View>
          <View style={styles.sectionText}>
            <Text style={styles.sectionTitle}>Các loài cây</Text>
            <Text style={styles.sectionSub}>Chọn loài cây cho khu vườn của bạn — miễn phí</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
        </Pressable>

        {/* Section: Themes (coming soon) */}
        <View style={[styles.sectionCard, styles.sectionDisabled]}>
          <View style={[styles.iconBox, { backgroundColor: '#7E57C2' }]}>
            <MaterialCommunityIcons name="weather-partly-cloudy" size={28} color={colors.white} />
          </View>
          <View style={styles.sectionText}>
            <Text style={styles.sectionTitle}>Giao diện thời tiết</Text>
            <Text style={styles.sectionSub}>Sắp ra mắt</Text>
          </View>
        </View>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.extrabold,
    fontSize: typography.sizes.xxl,
    color: colors.primary,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  sectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  sectionDisabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionText: { flex: 1, gap: 2 },
  sectionTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  sectionSub: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
});
