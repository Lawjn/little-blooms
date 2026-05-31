import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Toast } from '@/components/Toast';
import { useUser } from '@/features/auth/store';
import {
  useInventory,
  useUnlockPlant,
  useUpdateActivePlant,
} from '@/features/inventory/hooks';
import { useStoreItems } from '@/features/store/hooks';
import { PLANT_EMOJI, PLANT_LABEL, type PlantType } from '@/features/garden/mapping';
import { colors, radii, shadows, spacing, typography } from '@/lib/theme';

export default function StorePlantsScreen() {
  const router = useRouter();
  const user = useUser();
  const inventoryQuery = useInventory(user?.id);
  const itemsQuery = useStoreItems('plant');
  const unlockMutation = useUnlockPlant();
  const setActiveMutation = useUpdateActivePlant();
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const owned = inventoryQuery.data?.owned_plants ?? ['tulip'];
  const active = inventoryQuery.data?.active_plant ?? 'tulip';

  // Mở khóa miễn phí (cost = 0)
  const handleUnlock = async (plant: PlantType) => {
    if (!user) return;
    try {
      await unlockMutation.mutateAsync({ userId: user.id, plant, cost: 0 });
      setToastMsg(`Đã mở khóa ${PLANT_LABEL[plant]} ${PLANT_EMOJI[plant]}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Mở khóa thất bại';
      Alert.alert('Lỗi', msg);
    }
  };

  const handleSetActive = async (plant: PlantType) => {
    if (!user || plant === active) return;
    try {
      await setActiveMutation.mutateAsync({ userId: user.id, plant });
      setToastMsg(`Vườn đổi sang ${PLANT_LABEL[plant]} ${PLANT_EMOJI[plant]}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Đổi cây thất bại';
      Alert.alert('Lỗi', msg);
    }
  };

  // Tulip free mặc định lên đầu, các cây còn lại từ store items (đều miễn phí)
  const allPlants: { plant: PlantType; name: string; desc: string }[] = [
    { plant: 'tulip', name: PLANT_LABEL.tulip, desc: 'Loài cây mặc định cho khu vườn' },
    ...(itemsQuery.data ?? []).map((item) => ({
      plant: (item.metadata.plant_type ?? 'tulip') as PlantType,
      name: item.name,
      desc: item.description ?? '',
    })),
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.primary} />
        </Pressable>
        <Text style={styles.title}>Các loài cây</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {allPlants.map((p) => {
          const isOwned = owned.includes(p.plant);
          const isActive = p.plant === active;
          return (
            <View key={p.plant} style={styles.plantCard}>
              <Text style={styles.plantEmoji}>{PLANT_EMOJI[p.plant]}</Text>
              <View style={styles.plantInfo}>
                <Text style={styles.plantName}>{p.name}</Text>
                <Text style={styles.plantDesc}>{p.desc}</Text>
                {isActive ? (
                  <View style={styles.activeBadge}>
                    <Ionicons name="checkmark-circle" size={12} color={colors.primary} />
                    <Text style={styles.activeText}>Đang dùng</Text>
                  </View>
                ) : isOwned ? (
                  <Text style={styles.ownedText}>Đã mở khóa</Text>
                ) : null}
              </View>
              {isActive ? null : isOwned ? (
                <Button
                  label="Dùng"
                  onPress={() => handleSetActive(p.plant)}
                  variant="secondary"
                  loading={setActiveMutation.isPending}
                  style={styles.actionBtn}
                />
              ) : (
                <Button
                  label="Mở khóa"
                  onPress={() => handleUnlock(p.plant)}
                  loading={unlockMutation.isPending}
                  style={styles.actionBtn}
                />
              )}
            </View>
          );
        })}
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
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  plantCard: {
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
  plantEmoji: { fontSize: 40 },
  plantInfo: { flex: 1, gap: 2 },
  plantName: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  plantDesc: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  activeText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xs,
    color: colors.primary,
  },
  ownedText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: 4,
  },
  actionBtn: { minWidth: 80, paddingHorizontal: spacing.sm },
});
