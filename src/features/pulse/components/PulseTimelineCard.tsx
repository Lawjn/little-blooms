import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { format, parseISO } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { MOOD_OPTIONS } from '@/components/MoodPicker';
import { getMoodPhotoSignedUrls } from '@/features/mood/upload';
import { MOOD_VISUAL } from '@/features/garden/mapping';
import type { MoodPulse } from '../types';
import { colors, radii, shadows, spacing, typography } from '@/lib/theme';

interface PulseTimelineCardProps {
  pulse: MoodPulse;
  onDelete?: (pulseId: string) => void;
}

export function PulseTimelineCard({ pulse, onDelete }: PulseTimelineCardProps) {
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const moodOption = MOOD_OPTIONS.find((m) => m.level === pulse.mood_level);
  const moodVisual = MOOD_VISUAL[pulse.mood_level];

  useEffect(() => {
    if (pulse.photo_urls.length === 0) {
      setPhotoUrls([]);
      return;
    }
    getMoodPhotoSignedUrls(pulse.photo_urls)
      .then(setPhotoUrls)
      .catch((err) => console.warn('[pulse photo url]', err));
  }, [pulse.photo_urls]);

  const time = format(parseISO(pulse.logged_at), 'h:mm a');

  return (
    <View style={styles.card}>
      <View style={[styles.moodBadge, { backgroundColor: moodVisual.bgColor }]}>
        <Text style={styles.moodEmoji}>{moodOption?.emoji}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.time}>{time}</Text>
          <Text style={styles.moodLabel}>{moodOption?.label}</Text>
          {onDelete ? (
            <Pressable onPress={() => onDelete(pulse.id)} hitSlop={8}>
              <Ionicons name="trash-outline" size={16} color={colors.text.secondary} />
            </Pressable>
          ) : null}
        </View>

        {pulse.note ? <Text style={styles.note}>{pulse.note}</Text> : null}

        {photoUrls.length > 0 ? (
          <View style={styles.photoRow}>
            {photoUrls.map((url, idx) => (
              <Image
                key={idx}
                source={{ uri: url }}
                style={styles.photo}
                contentFit="cover"
                transition={150}
                cachePolicy="memory-disk"
              />
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.cream,
    borderRadius: radii.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  moodBadge: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodEmoji: {
    fontSize: 22,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  time: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  moodLabel: {
    flex: 1,
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  note: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    lineHeight: 20,
  },
  photoRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  photo: {
    width: 60,
    height: 60,
    borderRadius: radii.md,
  },
});
