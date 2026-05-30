import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { Flower } from '@/features/garden/components/Flower';
import { MOOD_OPTIONS } from '@/components/MoodPicker';
import { getMoodPhotoSignedUrls } from '@/features/mood/upload';
import { PulseTimelineCard } from '@/features/pulse/components/PulseTimelineCard';
import { useDeletePulse, useTodayPulses } from '@/features/pulse/hooks';
import type { MoodEntry } from '../types';
import type { PlantType } from '@/features/garden/mapping';
import { colors, radii, shadows, spacing, typography } from '@/lib/theme';

interface DecisionScreenProps {
  entry: MoodEntry;
  plantType: PlantType;
  isToday: boolean;
  userId: string;
  date: string;
  onUpdate: () => void;
  onQuickPulse: () => void;
}

export function DecisionScreen({
  entry,
  plantType,
  isToday,
  userId,
  date,
  onUpdate,
  onQuickPulse,
}: DecisionScreenProps) {
  const moodOption = MOOD_OPTIONS.find((m) => m.level === entry.mood_level);
  const pulsesQuery = useTodayPulses({ userId, date });
  const deletePulse = useDeletePulse();
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  useEffect(() => {
    if (entry.photo_urls.length === 0) {
      setPhotoUrls([]);
      return;
    }
    getMoodPhotoSignedUrls(entry.photo_urls)
      .then(setPhotoUrls)
      .catch((err) => console.warn('[decision photo url]', err));
  }, [entry.photo_urls]);

  const updatedAt = entry.updated_at
    ? format(parseISO(entry.updated_at), 'h:mm a')
    : null;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero summary */}
      <View style={styles.hero}>
        <Flower moodLevel={entry.mood_level} plantType={plantType} size={84} />
        <Text style={styles.moodLabel}>{moodOption?.label}</Text>
        {updatedAt ? (
          <Text style={styles.updatedAt}>Ghi lúc {updatedAt}</Text>
        ) : null}
        {entry.note ? (
          <Text style={styles.notePreview} numberOfLines={2}>
            "{entry.note}"
          </Text>
        ) : null}
        {photoUrls.length > 0 ? (
          <View style={styles.photoRow}>
            {photoUrls.map((url, idx) => (
              <Image key={idx} source={{ uri: url }} style={styles.photoThumb} />
            ))}
          </View>
        ) : null}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          onPress={onUpdate}
          style={({ pressed }) => [styles.actionCard, pressed && styles.actionPressed]}
        >
          <View style={[styles.actionIcon, styles.iconUpdate]}>
            <MaterialCommunityIcons name="pencil" size={22} color={colors.white} />
          </View>
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>Cập nhật nhật ký</Text>
            <Text style={styles.actionSub}>Sửa cảm xúc, thẻ, ghi chú, ảnh</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
        </Pressable>

        {isToday ? (
          <Pressable
            onPress={onQuickPulse}
            style={({ pressed }) => [styles.actionCard, pressed && styles.actionPressed]}
          >
            <View style={[styles.actionIcon, styles.iconPulse]}>
              <MaterialCommunityIcons name="lightning-bolt" size={22} color={colors.white} />
            </View>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Ghi nhanh</Text>
              <Text style={styles.actionSub}>Ghi lại khoảnh khắc cảm xúc ngay bây giờ</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
          </Pressable>
        ) : (
          <View style={styles.disabledNotice}>
            <Ionicons name="information-circle-outline" size={18} color={colors.text.secondary} />
            <Text style={styles.disabledNoticeText}>
              Ghi nhanh chỉ áp dụng cho hôm nay
            </Text>
          </View>
        )}
      </View>

      {/* Pulses timeline */}
      {pulsesQuery.data && pulsesQuery.data.length > 0 ? (
        <View style={styles.pulsesSection}>
          <Text style={styles.sectionTitle}>
            Khoảnh khắc ({pulsesQuery.data.length})
          </Text>
          <View style={styles.pulsesList}>
            {pulsesQuery.data.map((pulse) => (
              <PulseTimelineCard
                key={pulse.id}
                pulse={pulse}
                onDelete={isToday ? (id) => deletePulse.mutate(id) : undefined}
              />
            ))}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.cream,
    borderRadius: radii.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },
  moodLabel: {
    fontFamily: typography.fontFamily.extrabold,
    fontSize: typography.sizes.lg,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  updatedAt: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  notePreview: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  photoRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  photoThumb: {
    width: 60,
    height: 60,
    borderRadius: radii.md,
  },
  actions: {
    gap: spacing.sm,
  },
  actionCard: {
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
  actionPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconUpdate: {
    backgroundColor: colors.primary,
  },
  iconPulse: {
    backgroundColor: '#FB8C00',
  },
  actionText: {
    flex: 1,
    gap: 2,
  },
  actionTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  actionSub: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  disabledNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.cream,
    borderRadius: radii.lg,
  },
  disabledNoticeText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  pulsesSection: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.md,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  pulsesList: {
    gap: spacing.sm,
  },
});
