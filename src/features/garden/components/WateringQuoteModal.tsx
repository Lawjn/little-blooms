import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { SVG_WATERING_CAN } from '../gardenAssets';
import { Button } from '@/components/Button';
import { colors, radii, shadows, spacing, typography } from '@/lib/theme';

interface WateringQuoteModalProps {
  visible: boolean;
  quote: string;
  /** "Claim" — nhận lời nhắn & đóng. */
  onClose: () => void;
  /** "Tưới tiếp" — tưới thêm lần nữa, nhận câu mới. */
  onContinue: () => void;
}

/**
 * Modal hiện câu an ủi/động viên mỗi khi user tưới cây.
 * Card trắng bo tròn, bình tưới + giọt nước + câu nói + 2 nút (Claim / Tưới tiếp).
 */
export function WateringQuoteModal({
  visible,
  quote,
  onClose,
  onContinue,
}: WateringQuoteModalProps) {
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, friction: 7, tension: 60, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    } else {
      scale.setValue(0.85);
      opacity.setValue(0);
    }
  }, [visible, scale, opacity]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}>
          <Pressable>
            <View style={styles.iconWrap}>
              <SvgXml xml={SVG_WATERING_CAN} width={48} height={48} />
              <Text style={styles.drops}>💧</Text>
            </View>

            <Text style={styles.label}>Một lời gửi đến bạn</Text>
            <Text style={styles.quote}>{quote}</Text>

            <View style={styles.buttonRow}>
              <Button
                label="Claim ✨"
                onPress={onClose}
                variant="primary"
                style={styles.flexBtn}
              />
              <Button
                label="Tưới tiếp 💧"
                onPress={onContinue}
                variant="secondary"
                style={styles.flexBtn}
              />
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.lg,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: radii.full,
    backgroundColor: colors.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drops: {
    position: 'absolute',
    bottom: 12,
    right: 18,
    fontSize: 18,
  },
  label: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.sm,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  quote: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  flexBtn: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
});
