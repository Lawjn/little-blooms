import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '@/features/auth/store';
import { useInventory, useUpdateActivePlant } from '@/features/inventory/hooks';
import { PLANT_EMOJI, PLANT_LABEL, type PlantType } from '@/features/garden/mapping';
import { colors, radii, spacing, typography } from '@/lib/theme';

const PLANT_OPTIONS: PlantType[] = ['tulip', 'sunflower', 'rose', 'cherry', 'clover'];

export function PlantSwitcher() {
  const router = useRouter();
  const user = useUser();
  const inventoryQuery = useInventory(user?.id);
  const updatePlant = useUpdateActivePlant();
  const current = inventoryQuery.data?.active_plant ?? 'tulip';
  const owned = inventoryQuery.data?.owned_plants ?? ['tulip'];

  const onPick = async (plant: PlantType) => {
    if (!user || plant === current) return;

    // Nếu chưa unlock → prompt navigate to Store
    if (!owned.includes(plant)) {
      Alert.alert(
        `${PLANT_LABEL[plant]} chưa unlock`,
        'Mở khóa cây này bằng seeds ở Store Plants',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Đến Store', onPress: () => router.push('/store/plants' as never) },
        ],
      );
      return;
    }

    try {
      await updatePlant.mutateAsync({ userId: user.id, plant });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Đổi plant thất bại';
      Alert.alert('Lỗi', msg);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Garden plant</Text>
        <Text style={styles.subtitle}>Chọn loài cây cho vườn của bạn</Text>
      </View>
      <View style={styles.row}>
        {PLANT_OPTIONS.map((plant) => {
          const isCurrent = plant === current;
          const isOwned = owned.includes(plant);
          return (
            <Pressable
              key={plant}
              onPress={() => onPick(plant)}
              disabled={updatePlant.isPending}
              style={({ pressed }) => [
                styles.option,
                isCurrent && styles.optionSelected,
                pressed && !isCurrent && styles.optionPressed,
              ]}
            >
              <Text style={[styles.emoji, !isOwned && styles.emojiLocked]}>
                {PLANT_EMOJI[plant]}
              </Text>
              <Text style={[styles.label, isCurrent && styles.labelSelected]}>
                {PLANT_LABEL[plant]}
              </Text>
              {!isOwned ? (
                <View style={styles.lockBadge}>
                  <Ionicons name="lock-closed" size={10} color={colors.white} />
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cream,
    borderRadius: radii.xl,
    padding: spacing.md,
    gap: spacing.md,
  },
  header: { gap: spacing.xs },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.md,
    color: colors.primary,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  option: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.greenLight,
  },
  optionPressed: { opacity: 0.7 },
  emoji: { fontSize: 32 },
  emojiLocked: { opacity: 0.35 },
  label: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  labelSelected: {
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
  },
  lockBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: radii.full,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
