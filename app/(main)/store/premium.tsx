import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Toast } from '@/components/Toast';
import { useUser } from '@/features/auth/store';
import { useSetPremium } from '@/features/inventory/hooks';
import { useProfile } from '@/features/profile/hooks';
import { colors, radii, shadows, spacing, typography } from '@/lib/theme';

const PREMIUM_FEATURES = [
  { icon: 'sparkles', text: 'AI weekly insights — pattern phân tích cảm xúc' },
  { icon: 'download', text: 'Export data CSV/PDF — backup local' },
  { icon: 'cloud', text: 'Cloud backup không giới hạn' },
  { icon: 'color-palette', text: 'Premium weather themes' },
  { icon: 'analytics', text: 'Advanced stats — mood correlations, trends' },
  { icon: 'flash', text: 'Priority customer support' },
] as const;

export default function PremiumScreen() {
  const router = useRouter();
  const user = useUser();
  const profileQuery = useProfile(user?.id);
  const setPremium = useSetPremium();
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const isPremium = profileQuery.data?.is_premium ?? false;

  const handleSubscribe = () => {
    if (!user) return;
    Alert.alert(
      'Subscribe Bloom Premium?',
      '119k VND/tháng — Demo coursework: fake subscription, không trừ tiền thật.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Subscribe',
          onPress: async () => {
            try {
              await setPremium.mutateAsync({ userId: user.id, isPremium: true });
              setToastMsg('🎉 Bloom Premium activated!');
            } catch (err) {
              const msg = err instanceof Error ? err.message : 'Subscribe thất bại';
              Alert.alert('Lỗi', msg);
            }
          },
        },
      ],
    );
  };

  const handleCancel = () => {
    if (!user) return;
    Alert.alert('Hủy Premium?', 'Bạn sẽ mất quyền access các tính năng premium.', [
      { text: 'Giữ Premium', style: 'cancel' },
      {
        text: 'Hủy',
        style: 'destructive',
        onPress: async () => {
          await setPremium.mutateAsync({ userId: user.id, isPremium: false });
          setToastMsg('Đã hủy Premium');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Bloom Premium</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <MaterialCommunityIcons name="crown" size={64} color="#FFB300" />
          <Text style={styles.heroTitle}>Bloom Premium ✨</Text>
          <Text style={styles.heroSub}>Mở khóa toàn bộ tính năng nâng cao</Text>
        </View>

        <View style={styles.features}>
          {PREMIUM_FEATURES.map((f, idx) => (
            <View key={idx} style={styles.featureRow}>
              <Ionicons name={f.icon} size={20} color={colors.primary} />
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>Monthly</Text>
          <Text style={styles.price}>119k VND</Text>
          <Text style={styles.priceSub}>~$4.99 / month</Text>
        </View>

        {isPremium ? (
          <>
            <View style={styles.activeBadge}>
              <MaterialCommunityIcons name="check-circle" size={20} color={colors.success} />
              <Text style={styles.activeText}>You're Premium</Text>
            </View>
            <Button
              label="Hủy subscription"
              onPress={handleCancel}
              variant="secondary"
              fullWidth
              loading={setPremium.isPending}
            />
          </>
        ) : (
          <Button
            label="Subscribe — 119k/tháng"
            onPress={handleSubscribe}
            fullWidth
            loading={setPremium.isPending}
          />
        )}

        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={16} color={colors.text.secondary} />
          <Text style={styles.disclaimerText}>
            Demo coursework: fake subscription. Production sẽ tích hợp RevenueCat hoặc native IAP
            subscription. Toggle on/off để test các premium-gated features.
          </Text>
        </View>
      </ScrollView>

      <Toast
        visible={!!toastMsg}
        message={toastMsg ?? ''}
        variant="success"
        onHide={() => setToastMsg(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#7E57C2' },
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
    color: colors.white,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  heroTitle: {
    fontFamily: typography.fontFamily.extrabold,
    fontSize: typography.sizes.xxl,
    color: colors.white,
  },
  heroSub: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  features: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  priceCard: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
    ...shadows.md,
  },
  priceLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  price: {
    fontFamily: typography.fontFamily.extrabold,
    fontSize: typography.sizes.xxl,
    color: colors.primary,
  },
  priceSub: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  activeText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.md,
    color: colors.white,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: spacing.md,
    borderRadius: radii.lg,
  },
  disclaimerText: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 16,
  },
});
