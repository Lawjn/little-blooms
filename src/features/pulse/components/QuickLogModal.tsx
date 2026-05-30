import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Button } from '@/components/Button';
import { MoodPicker } from '@/components/MoodPicker';
import { PhotoPicker, type PhotoSlot } from '@/components/PhotoPicker';
import { uploadPulsePhoto } from '@/features/pulse/api';
import { useCreatePulse } from '@/features/pulse/hooks';
import { useUser } from '@/features/auth/store';
import { colors, radii, shadows, spacing, typography } from '@/lib/theme';
import type { MoodLevel } from '@/lib/theme';

interface QuickLogModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function QuickLogModal({ visible, onClose, onSuccess }: QuickLogModalProps) {
  const user = useUser();
  const createPulse = useCreatePulse();

  const [moodLevel, setMoodLevel] = useState<MoodLevel | null>(null);
  const [note, setNote] = useState('');
  const [photos, setPhotos] = useState<(PhotoSlot | null)[]>([null, null, null]);

  const reset = () => {
    setMoodLevel(null);
    setNote('');
    setPhotos([null, null, null]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = async () => {
    if (!user) return;
    if (moodLevel === null) {
      Alert.alert('Chưa chọn cảm xúc', 'Bạn chưa chọn cảm xúc cho khoảnh khắc này.');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

      // Upload photos parallel với temp id (sẽ dùng UUID hiện tại làm temp)
      const tempId = `${Date.now()}`;
      const uploadTasks = photos.map(async (slot, i) => {
        if (!slot) return null;
        if (slot.path) return slot.path;
        if (slot.pendingBase64) {
          return uploadPulsePhoto({
            userId: user.id,
            pulseTempId: tempId,
            index: i,
            asset: {
              uri: slot.uri,
              base64: slot.pendingBase64,
              mimeType: slot.pendingMime,
            },
          });
        }
        return null;
      });
      const uploadResults = await Promise.all(uploadTasks);
      const photoPaths = uploadResults.filter((p): p is string => p !== null);

      await createPulse.mutateAsync({
        userId: user.id,
        input: {
          mood_level: moodLevel,
          note: note.trim() || null,
          photo_urls: photoPaths,
        },
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      reset();
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lưu khoảnh khắc thất bại';
      Alert.alert('Lỗi', msg);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={handleClose}>
          <Pressable style={styles.sheet}>
            <View style={styles.handle} />

            <View style={styles.header}>
              <Text style={styles.title}>Ghi nhanh cảm xúc</Text>
              <Pressable onPress={handleClose} hitSlop={12}>
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </Pressable>
            </View>
            <Text style={styles.subtitle}>Bắt khoảnh khắc cảm xúc ngay bây giờ</Text>

            <ScrollView
              contentContainerStyle={styles.scroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Mood */}
              <Text style={styles.sectionLabel}>Bạn đang cảm thấy thế nào?</Text>
              <MoodPicker value={moodLevel} onChange={setMoodLevel} />

              {/* Note */}
              <Text style={styles.sectionLabel}>Ghi chú (tùy chọn)</Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Bạn đang ở đâu / làm gì / vì sao có cảm xúc này..."
                placeholderTextColor={colors.text.secondary}
                multiline
                style={styles.noteInput}
                textAlignVertical="top"
                maxLength={300}
              />

              {/* Photos */}
              <Text style={styles.sectionLabel}>Ảnh (tùy chọn)</Text>
              <PhotoPicker photos={photos} onChange={setPhotos} />
            </ScrollView>

            <Button
              label="Lưu khoảnh khắc"
              onPress={handleSave}
              loading={createPulse.isPending}
              fullWidth
              style={styles.saveBtn}
            />
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    maxHeight: '90%',
    ...shadows.lg,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: typography.fontFamily.extrabold,
    fontSize: typography.sizes.lg,
    color: colors.primary,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  scroll: {
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  sectionLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  noteInput: {
    backgroundColor: colors.cream,
    borderRadius: radii.lg,
    padding: spacing.md,
    minHeight: 80,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  saveBtn: {
    marginTop: spacing.md,
  },
});
