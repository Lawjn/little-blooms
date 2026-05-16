import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, shadows, spacing, typography } from '@/lib/theme';

export type ToastVariant = 'success' | 'info' | 'error';

interface ToastProps {
  visible: boolean;
  message: string;
  variant?: ToastVariant;
  onHide?: () => void;
  durationMs?: number;
}

/**
 * Slide-down toast từ top, auto-dismiss sau durationMs.
 * Dùng cho lightweight feedback (vd: pulse logged) thay vì full sheet/Alert.
 */
export function Toast({
  visible,
  message,
  variant = 'success',
  onHide,
  durationMs = 1800,
}: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }),
        ]).start(() => onHide?.());
      }, durationMs);
      return () => clearTimeout(timer);
    }
  }, [visible, durationMs, onHide, translateY, opacity]);

  if (!visible) return null;

  const styleVariant = variantStyles[variant];

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        { transform: [{ translateY }], opacity },
      ]}
    >
      <SafeAreaView edges={['top']}>
        <View style={[styles.toast, styleVariant.toast]}>
          <Ionicons name={styleVariant.icon} size={20} color={colors.white} />
          <Text style={styles.text}>{message}</Text>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

const variantStyles = {
  success: {
    toast: { backgroundColor: colors.primary },
    icon: 'checkmark-circle' as const,
  },
  info: {
    toast: { backgroundColor: '#7E57C2' },
    icon: 'information-circle' as const,
  },
  error: {
    toast: { backgroundColor: colors.error },
    icon: 'close-circle' as const,
  },
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    ...shadows.md,
  },
  text: {
    flex: 1,
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.sm,
    color: colors.white,
  },
});
