import { useState } from 'react';
import { ActionSheetIOS, Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { CameraCapture, type CapturedAsset } from '@/components/CameraCapture';
import { colors, radii, spacing, typography } from '@/lib/theme';

export interface PhotoSlot {
  /** URI hiển thị — local file URI (just picked) OR signed URL (loaded from DB). */
  uri: string;
  /** Nếu là ảnh mới picked, có base64 + mime để upload. */
  pendingBase64?: string | null;
  pendingMime?: string | null;
  /** Nếu là ảnh đã trong DB, có storage path. */
  path?: string;
}

interface PhotoPickerProps {
  photos: (PhotoSlot | null)[]; // luôn length 3
  onChange: (photos: (PhotoSlot | null)[]) => void;
  maxPhotos?: number;
}

const MAX = 3;

export function PhotoPicker({ photos, onChange, maxPhotos = MAX }: PhotoPickerProps) {
  const slots: (PhotoSlot | null)[] = [...photos];
  while (slots.length < maxPhotos) slots.push(null);

  // Camera state — Locket-style fullscreen capture
  const [cameraIndex, setCameraIndex] = useState<number | null>(null);
  const cameraVisible = cameraIndex !== null;

  const onCameraCaptured = (asset: CapturedAsset) => {
    if (cameraIndex === null) return;
    const next = [...slots];
    next[cameraIndex] = {
      uri: asset.uri,
      pendingBase64: asset.base64,
      pendingMime: asset.mimeType,
    };
    onChange(next);
    setCameraIndex(null);
  };

  const requestLibraryPerm = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền truy cập ảnh', 'Vào Settings → Little Blooms → Photos để cấp quyền.');
      return false;
    }
    return true;
  };

  // Mở Locket-style fullscreen camera. Permission handled trong CameraCapture component.
  const handleCameraCapture = (index: number) => {
    setCameraIndex(index);
  };

  const handleLibraryPick = async (index: number) => {
    const ok = await requestLibraryPerm();
    if (!ok) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.5,
      base64: true,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    const next = [...slots];
    next[index] = {
      uri: asset.uri,
      pendingBase64: asset.base64,
      pendingMime: asset.mimeType ?? 'image/jpeg',
    };
    onChange(next);
  };

  const pickAtIndex = (index: number) => {
    if (Platform.OS === 'ios') {
      // Native iOS action sheet
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', '📷 Take Photo', '🖼 Choose from Library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) handleCameraCapture(index);
          else if (buttonIndex === 2) handleLibraryPick(index);
        },
      );
    } else {
      // Android: Alert with 3 buttons (no native action sheet)
      Alert.alert('Add photo', 'Chọn nguồn ảnh', [
        { text: 'Take Photo', onPress: () => handleCameraCapture(index) },
        { text: 'Choose from Library', onPress: () => handleLibraryPick(index) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const removeAtIndex = (index: number) => {
    const next = [...slots];
    next[index] = null;
    onChange(next);
  };

  return (
    <>
    <View style={styles.container}>
      <View style={styles.row}>
        {slots.slice(0, maxPhotos).map((slot, idx) => (
          <View key={idx} style={styles.slotWrap}>
            {slot ? (
              <View style={styles.slotFilled}>
                <Image
                  source={{ uri: slot.uri }}
                  style={styles.image}
                  contentFit="cover"
                  transition={150}
                  cachePolicy="memory-disk"
                />
                <Pressable
                  onPress={() => removeAtIndex(idx)}
                  style={styles.removeBtn}
                  hitSlop={8}
                >
                  <Ionicons name="close" size={14} color={colors.white} />
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={() => pickAtIndex(idx)}
                style={({ pressed }) => [styles.slotEmpty, pressed && styles.pressed]}
              >
                <Ionicons name="camera-outline" size={28} color={colors.primary} />
              </Pressable>
            )}
          </View>
        ))}
      </View>
      <Text style={styles.hint}>Select up to {maxPhotos} photos</Text>
    </View>

    {/* Locket-style fullscreen camera */}
    <CameraCapture
      visible={cameraVisible}
      onClose={() => setCameraIndex(null)}
      onCapture={onCameraCaptured}
    />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  slotWrap: {
    flex: 1,
    aspectRatio: 1,
  },
  slotFilled: {
    flex: 1,
    borderRadius: radii.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: radii.full,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotEmpty: {
    flex: 1,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.greenLight,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  hint: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
