import { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Button } from '@/components/Button';
import { colors, radii, shadows, spacing, typography } from '@/lib/theme';

export interface CapturedAsset {
  uri: string;
  base64: string | null;
  mimeType: string;
}

interface CameraCaptureProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (asset: CapturedAsset) => void;
}

/**
 * Full-screen camera capture với UI giống Locket:
 * - Live preview chiếm full screen
 * - Big circle capture button bottom-center
 * - Flip front/back camera
 * - Close button top-left
 * - Sau capture → preview với Use/Retake buttons
 */
export function CameraCapture({ visible, onClose, onCapture }: CameraCaptureProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [captured, setCaptured] = useState<CapturedAsset | null>(null);
  const [capturing, setCapturing] = useState(false);

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: true,
        exif: false,
      });
      if (photo) {
        setCaptured({
          uri: photo.uri,
          base64: photo.base64 ?? null,
          mimeType: 'image/jpeg',
        });
      }
    } catch (err) {
      console.warn('[camera] capture error', err);
    } finally {
      setCapturing(false);
    }
  };

  const handleUse = () => {
    if (!captured) return;
    onCapture(captured);
    setCaptured(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  };

  const handleRetake = () => {
    setCaptured(null);
  };

  const handleClose = () => {
    setCaptured(null);
    onClose();
  };

  // Permission denied / chưa request
  if (!permission) {
    return null; // loading permission state
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={styles.permissionBox}>
          <Ionicons name="camera-outline" size={64} color={colors.text.secondary} />
          <Text style={styles.permissionTitle}>Cần quyền truy cập camera</Text>
          <Text style={styles.permissionText}>
            Little Blooms cần quyền camera để bạn chụp ảnh ngay trong app.
          </Text>
          <Button label="Cấp quyền" onPress={requestPermission} fullWidth />
          <Pressable onPress={onClose} hitSlop={12} style={styles.cancelLink}>
            <Text style={styles.cancelText}>Hủy</Text>
          </Pressable>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.container}>
        {captured ? (
          // Preview mode
          <>
            <Image
              source={{ uri: captured.uri }}
              style={styles.preview}
              contentFit="cover"
            />
            {/* Top bar */}
            <View style={styles.topBar}>
              <Pressable onPress={handleClose} style={styles.iconBtn} hitSlop={12}>
                <Ionicons name="close" size={28} color={colors.white} />
              </Pressable>
            </View>
            {/* Bottom actions */}
            <View style={styles.previewActions}>
              <Pressable onPress={handleRetake} style={styles.secondaryBtn} hitSlop={8}>
                <Ionicons name="refresh" size={22} color={colors.white} />
                <Text style={styles.secondaryText}>Retake</Text>
              </Pressable>
              <Pressable onPress={handleUse} style={styles.useBtn} hitSlop={8}>
                <Ionicons name="checkmark" size={28} color={colors.white} />
              </Pressable>
              <View style={styles.spacer} />
            </View>
          </>
        ) : (
          // Live camera mode
          <CameraView ref={cameraRef} facing={facing} style={styles.camera}>
            {/* Top bar */}
            <View style={styles.topBar}>
              <Pressable onPress={handleClose} style={styles.iconBtn} hitSlop={12}>
                <Ionicons name="close" size={28} color={colors.white} />
              </Pressable>
              <Pressable
                onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
                style={styles.iconBtn}
                hitSlop={12}
              >
                <Ionicons name="camera-reverse" size={28} color={colors.white} />
              </Pressable>
            </View>

            {/* Bottom capture */}
            <View style={styles.bottomBar}>
              <View style={styles.spacer} />
              <Pressable
                onPress={handleCapture}
                disabled={capturing}
                style={({ pressed }) => [
                  styles.captureBtn,
                  pressed && styles.captureBtnPressed,
                ]}
              >
                <View style={styles.captureBtnInner} />
              </Pressable>
              <View style={styles.spacer} />
            </View>
          </CameraView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  camera: {
    flex: 1,
  },
  preview: {
    ...StyleSheet.absoluteFillObject,
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    zIndex: 1,
  },
  spacer: {
    flex: 1,
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.white,
    ...shadows.lg,
  },
  captureBtnInner: {
    width: 60,
    height: 60,
    borderRadius: radii.full,
    backgroundColor: colors.white,
  },
  captureBtnPressed: {
    transform: [{ scale: 0.92 }],
  },
  previewActions: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    zIndex: 1,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  secondaryText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.md,
    color: colors.white,
  },
  useBtn: {
    width: 72,
    height: 72,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  permissionBox: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
  },
  permissionTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
    textAlign: 'center',
  },
  permissionText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  cancelLink: {
    paddingVertical: spacing.sm,
  },
  cancelText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
});
