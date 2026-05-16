import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '@/features/auth/store';
import { useInventory } from '@/features/inventory/hooks';
import { useProfile } from '@/features/profile/hooks';
import { colors, radii, shadows, spacing, typography } from '@/lib/theme';

export default function StoreHomeScreen() {
  const router = useRouter();
  const user = useUser();
  const inventoryQuery = useInventory(user?.id);
  const profileQuery = useProfile(user?.id);
  const seeds = inventoryQuery.data?.seeds_balance ?? 0;
  const isPremium = profileQuery.data?.is_premium ?? false;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header với seeds balance */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Store</Text>
        <View style={styles.balancePill}>
          <Text style={styles.balanceEmoji}>🌱</Text>
          <Text style={styles.balanceText}>{seeds.toLocaleString()}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Premium banner */}
        {isPremium ? (
          <View style={[styles.banner, styles.bannerPremium]}>
            <MaterialCommunityIcons name="crown" size={28} color={colors.white} />
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>You're Premium ✨</Text>
              <Text style={styles.bannerSub}>Enjoy AI insights + export + cloud backup</Text>
            </View>
          </View>
        ) : (
          <Pressable
            onPress={() => router.push('/store/premium' as never)}
            style={({ pressed }) => [styles.banner, styles.bannerCta, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons name="crown-outline" size={28} color={colors.white} />
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>Unlock Bloom Premium</Text>
              <Text style={styles.bannerSub}>AI insights, export, premium themes</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.white} />
          </Pressable>
        )}

        {/* Section: Plants */}
        <Pressable
          onPress={() => router.push('/store/plants' as never)}
          style={({ pressed }) => [styles.sectionCard, pressed && styles.pressed]}
        >
          <View style={[styles.iconBox, { backgroundColor: '#EC407A' }]}>
            <MaterialCommunityIcons name="flower-tulip" size={28} color={colors.white} />
          </View>
          <View style={styles.sectionText}>
            <Text style={styles.sectionTitle}>Plant species</Text>
            <Text style={styles.sectionSub}>5 loài cây — unlock với seeds</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
        </Pressable>

        {/* Section: Seeds */}
        <Pressable
          onPress={() => router.push('/store/seeds' as never)}
          style={({ pressed }) => [styles.sectionCard, pressed && styles.pressed]}
        >
          <View style={[styles.iconBox, { backgroundColor: '#7CB342' }]}>
            <Text style={styles.iconEmoji}>🌱</Text>
          </View>
          <View style={styles.sectionText}>
            <Text style={styles.sectionTitle}>Buy Seeds</Text>
            <Text style={styles.sectionSub}>3 packs với bonus</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
        </Pressable>

        {/* Section: Themes (coming soon) */}
        <View style={[styles.sectionCard, styles.sectionDisabled]}>
          <View style={[styles.iconBox, { backgroundColor: '#7E57C2' }]}>
            <MaterialCommunityIcons name="weather-partly-cloudy" size={28} color={colors.white} />
          </View>
          <View style={styles.sectionText}>
            <Text style={styles.sectionTitle}>Weather Themes</Text>
            <Text style={styles.sectionSub}>Coming soon — Phase 9 polish</Text>
          </View>
        </View>

        {/* Earn seeds info */}
        <View style={styles.earnBox}>
          <Text style={styles.earnTitle}>🌟 Cách earn seeds</Text>
          <Text style={styles.earnText}>• Log main entry: +5 seeds</Text>
          <Text style={styles.earnText}>• 7-day streak: +50 seeds bonus (sắp tới)</Text>
          <Text style={styles.earnText}>• Daily check-in: +1 seed (sắp tới)</Text>
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
  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.greenLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  balanceEmoji: { fontSize: 18 },
  balanceText: {
    fontFamily: typography.fontFamily.extrabold,
    fontSize: typography.sizes.md,
    color: colors.primary,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.xl,
    ...shadows.md,
  },
  bannerCta: {
    backgroundColor: '#7E57C2',
  },
  bannerPremium: {
    backgroundColor: '#FFB300',
  },
  bannerText: { flex: 1, gap: 2 },
  bannerTitle: {
    fontFamily: typography.fontFamily.extrabold,
    fontSize: typography.sizes.md,
    color: colors.white,
  },
  bannerSub: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    color: 'rgba(255,255,255,0.9)',
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
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: { fontSize: 26 },
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
  pressed: { opacity: 0.85 },
  earnBox: {
    backgroundColor: colors.cream,
    padding: spacing.md,
    borderRadius: radii.lg,
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  earnTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.md,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  earnText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
});
