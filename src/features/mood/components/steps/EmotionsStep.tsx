import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { TagGrid } from '@/components/TagGrid';
import { EMOTIONS } from '@/features/mood/data';
import { colors, spacing, typography } from '@/lib/theme';

interface EmotionsStepProps {
  value: string[];
  onChange: (next: string[]) => void;
}

export function EmotionsStep({ value, onChange }: EmotionsStepProps) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cảm xúc gì nổi bật?</Text>
      <Text style={styles.subtitle}>Pick all that apply — không có giới hạn</Text>

      <View style={styles.gridWrap}>
        <TagGrid options={EMOTIONS} selected={value} onChange={onChange} />
      </View>

      {value.length > 0 ? (
        <Text style={styles.count}>{value.length} đã chọn</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    gap: spacing.md,
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
  gridWrap: {
    marginTop: spacing.md,
  },
  count: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.sm,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
