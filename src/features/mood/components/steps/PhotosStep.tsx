import { ScrollView, StyleSheet, Text } from 'react-native';
import { PhotoPicker, type PhotoSlot } from '@/components/PhotoPicker';
import { colors, spacing, typography } from '@/lib/theme';

interface PhotosStepProps {
  value: (PhotoSlot | null)[];
  onChange: (next: (PhotoSlot | null)[]) => void;
}

export function PhotosStep({ value, onChange }: PhotosStepProps) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Lưu lại khoảnh khắc?</Text>
      <Text style={styles.subtitle}>Tối đa 3 ảnh — selfie, đồ ăn, view từ cửa sổ...</Text>

      <PhotoPicker photos={value} onChange={onChange} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  title: {
    fontFamily: typography.fontFamily.extrabold,
    fontSize: typography.sizes.xxl,
    color: colors.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
