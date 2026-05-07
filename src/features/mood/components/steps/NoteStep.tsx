import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { colors, radii, spacing, typography } from '@/lib/theme';

interface NoteStepProps {
  value: string;
  onChange: (next: string) => void;
}

export function NoteStep({ value, onChange }: NoteStepProps) {
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Có gì muốn ghi lại?</Text>
        <Text style={styles.subtitle}>
          1 dòng cảm nhận, 1 highlight, hoặc note dài tùy bạn — không bắt buộc
        </Text>

        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="Hôm nay là một ngày..."
          placeholderTextColor={colors.text.secondary}
          multiline
          style={styles.input}
          textAlignVertical="top"
        />

        {value.length > 0 ? (
          <Text style={styles.count}>{value.length} ký tự</Text>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
  input: {
    backgroundColor: colors.cream,
    borderRadius: radii.lg,
    padding: spacing.md,
    minHeight: 200,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  count: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    textAlign: 'right',
  },
});
