import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { eachDayOfInterval, endOfWeek, format, startOfWeek } from 'date-fns';
import { Button } from '@/components/Button';
import { useUser } from '@/features/auth/store';
import { useStatsRange } from '@/features/stats/hooks';
import { Flower } from '@/features/garden/components/Flower';
import { PLANT_LABEL, type PlantType } from '@/features/garden/mapping';
import { colors, radii, shadows, spacing, typography } from '@/lib/theme';
import type { MoodLevel } from '@/lib/theme';

interface SaveSuccessSheetProps {
  visible: boolean;
  onDismiss: () => void;
  onViewGarden: () => void;
  plantType: PlantType;
  moodLevel: MoodLevel | null;
  isUpdate: boolean; // true nếu update entry cũ thay vì create mới
  quote: string;
}

export function SaveSuccessSheet({
  visible,
  onDismiss,
  onViewGarden,
  plantType,
  moodLevel,
  isUpdate,
  quote,
}: SaveSuccessSheetProps) {
  const user = useUser();
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  const entriesQuery = useStatsRange({
    userId: user?.id,
    startDate: weekStart,
    endDate: weekEnd,
  });

  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const loggedDates = new Set(entriesQuery.data?.map((e) => e.entry_date) ?? []);
  const streakCount = loggedDates.size;

  // Animation cây mọc
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scale.setValue(0);
      opacity.setValue(0);
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scale, opacity]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {/* Close */}
          <Pressable onPress={onDismiss} style={styles.closeBtn} hitSlop={12}>
            <Ionicons name="close" size={22} color={colors.text.secondary} />
          </Pressable>

          {/* Plant animated */}
          <Animated.View style={[styles.flowerWrap, { transform: [{ scale }] }]}>
            {moodLevel ? (
              <Flower moodLevel={moodLevel} plantType={plantType} size={120} />
            ) : null}
          </Animated.View>

          {/* Title */}
          <Animated.View style={{ opacity }}>
            <Text style={styles.title}>
              {isUpdate ? 'Đã cập nhật! ✨' : 'Cây mới đã mọc! 🌱'}
            </Text>
            <Text style={styles.subtitle}>
              {PLANT_LABEL[plantType]} · {format(today, 'EEEE, MMM d')}
            </Text>
          </Animated.View>

          {/* Streak this week */}
          <View style={styles.streakBox}>
            <Text style={styles.streakLabel}>Tuần này</Text>
            <View style={styles.streakDots}>
              {days.map((d, idx) => {
                const dateStr = format(d, 'yyyy-MM-dd');
                const isLogged = loggedDates.has(dateStr);
                return (
                  <View
                    key={idx}
                    style={[styles.streakDot, isLogged ? styles.streakDotOn : null]}
                  />
                );
              })}
            </View>
            <Text style={styles.streakCount}>{streakCount}/7 ngày</Text>
          </View>

          {/* Quote */}
          <View style={styles.quoteBox}>
            <Text style={styles.quoteText}>{quote}</Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              label="View Garden"
              onPress={onViewGarden}
              fullWidth
            />
            <Pressable onPress={onDismiss} hitSlop={12} style={styles.dismissLink}>
              <Text style={styles.dismissText}>Để sau</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  sheet: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.lg,
  },
  closeBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 1,
  },
  flowerWrap: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: typography.fontFamily.extrabold,
    fontSize: typography.sizes.xl,
    color: colors.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  streakBox: {
    width: '100%',
    backgroundColor: colors.cream,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  streakLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  streakDots: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  streakDot: {
    width: 16,
    height: 16,
    borderRadius: radii.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  streakDotOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  streakCount: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.md,
    color: colors.primary,
  },
  quoteBox: {
    width: '100%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  quoteText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  actions: {
    width: '100%',
    gap: spacing.sm,
    alignItems: 'center',
  },
  dismissLink: {
    paddingVertical: spacing.sm,
  },
  dismissText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
});
