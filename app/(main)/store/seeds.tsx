import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Toast } from '@/components/Toast';
import { useUser } from '@/features/auth/store';
import { useFakePurchaseSeeds, useInventory } from '@/features/inventory/hooks';
import { useStoreItems } from '@/features/store/hooks';
import { colors, radii, shadows, spacing, typography } from '@/lib/theme';

export default function StoreSeedsScreen() {
  const router = useRouter();
  const user = useUser();
  const inventoryQuery = useInventory(user?.id);
  const itemsQuery = useStoreItems('seed_pack');
  const purchase = useFakePurchaseSeeds();
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const seeds = inventoryQuery.data?.seeds_balance ?? 0;

  const handleBuy = (item: { name: string; price_vnd: number; metadata: { seeds_count?: number; bonus?: number } }) => {
    if (!user) return;
    const seedsCount = item.metadata.seeds_count ?? 0;
    const bonus = item.metadata.bonus ?? 0;
    const totalSeeds = seedsCount + bonus;
    const priceLabel = (item.price_vnd / 1000).toFixed(0) + 'k VND';

    Alert.alert(
      `Mua ${item.name}?`,
      `Bạn sẽ nhận ${totalSeeds.toLocaleString()} 🌱 với giá ${priceLabel}.\n\n(Demo: fake purchase — không trừ tiền thật)`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Mua',
          onPress: async () => {
            try {
              await purchase.mutateAsync({
                userId: user.id,
                amount: totalSeeds,
                pricePaidVnd: item.price_vnd,
              });
              setToastMsg(`+${totalSeeds.toLocaleString()} seeds đã thêm 🌱`);
            } catch (err) {
              const msg = err instanceof Error ? err.message : 'Mua thất bại';
              Alert.alert('Lỗi', msg);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.primary} />
        </Pressable>
        <Text style={styles.title}>Buy Seeds</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.balanceBar}>
        <Text style={styles.balanceLabel}>Current balance</Text>
        <Text style={styles.balanceValue}>🌱 {seeds.toLocaleString()}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {itemsQuery.isLoading ? (
          <Text style={styles.loading}>Loading...</Text>
        ) : (
          itemsQuery.data?.map((item) => {
            const seedsCount = item.metadata.seeds_count ?? 0;
            const bonus = item.metadata.bonus ?? 0;
            return (
              <View key={item.id} style={styles.packCard}>
                <View style={styles.packIcon}>
                  <Text style={styles.packEmoji}>🌱</Text>
                </View>
                <View style={styles.packInfo}>
                  <Text style={styles.packName}>{item.name}</Text>
                  <Text style={styles.packDesc}>
                    {seedsCount.toLocaleString()} seeds
                    {bonus > 0 ? ` + ${bonus} bonus` : ''}
                  </Text>
                </View>
                <Button
                  label={`${(item.price_vnd / 1000).toFixed(0)}k`}
                  onPress={() => handleBuy(item)}
                  loading={purchase.isPending}
                  style={styles.buyBtn}
                />
              </View>
            );
          })
        )}

        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={16} color={colors.text.secondary} />
          <Text style={styles.disclaimerText}>
            Demo coursework: fake purchase, không trừ tiền thật. Production sẽ tích hợp Apple/Google IAP.
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
  safeArea: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.lg,
    color: colors.primary,
  },
  balanceBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.cream,
    marginHorizontal: spacing.lg,
    borderRadius: radii.lg,
    marginTop: spacing.sm,
  },
  balanceLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  balanceValue: {
    fontFamily: typography.fontFamily.extrabold,
    fontSize: typography.sizes.lg,
    color: colors.primary,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  loading: { textAlign: 'center', color: colors.text.secondary },
  packCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  packIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: colors.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  packEmoji: { fontSize: 24 },
  packInfo: { flex: 1, gap: 2 },
  packName: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  packDesc: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  buyBtn: { minWidth: 80, paddingHorizontal: spacing.md },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.cream,
    padding: spacing.md,
    borderRadius: radii.lg,
    marginTop: spacing.md,
  },
  disclaimerText: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    lineHeight: 16,
  },
});
