import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, router } from 'expo-router';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useSignUp } from '@/features/auth/hooks';
import { colors, radii, spacing, typography } from '@/lib/theme';

const schema = z.object({
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

type FormValues = z.infer<typeof schema>;

export default function SignUpScreen() {
  const signUp = useSignUp();
  const [emailSentTo, setEmailSentTo] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const result = await signUp.mutateAsync(data);
      if (result.data.session) {
        // Email confirm OFF → đã có session → auth listener tự redirect sang Home
        // (không cần làm gì thêm)
      } else if (result.data.user) {
        // Email confirm ON → user tạo nhưng chưa active. Hiện confirmation screen.
        setEmailSentTo(data.email);
      } else {
        Alert.alert(
          'Sign Up',
          'Có vấn đề lạ — không nhận được user lẫn session. Thử lại nhé.',
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đăng ký thất bại';
      Alert.alert('Sign Up failed', message);
    }
  };

  if (emailSentTo) {
    return <SignUpSuccess email={emailSentTo} />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Sign Up</Text>

          <View style={styles.form}>
            <Controller
              control={control}
              name="name"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextField
                  label="Your name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Nguyễn Văn A"
                  autoCapitalize="words"
                  error={errors.name?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="email"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextField
                  label="Email address"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="email@example.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  error={errors.email?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextField
                  label="Password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="••••••••"
                  isPassword
                  error={errors.password?.message}
                />
              )}
            />
          </View>

          <Button
            label="Sign Up"
            onPress={handleSubmit(onSubmit)}
            loading={signUp.isPending}
            fullWidth
            style={styles.submitBtn}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/login" replace style={styles.footerLink}>
              Sign In
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SignUpSuccess({ email }: { email: string }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.successContent}>
        <View style={styles.iconBox}>
          <Ionicons name="mail-outline" size={56} color={colors.primary} />
        </View>

        <Text style={styles.successTitle}>Check your email</Text>
        <Text style={styles.successBody}>
          Mình đã gửi email xác nhận tới{'\n'}
          <Text style={styles.emailHighlight}>{email}</Text>
          {'\n\n'}
          Mở email và bấm link <Text style={styles.bold}>Confirm your email</Text> để hoàn tất
          đăng ký, sau đó quay lại đăng nhập.
        </Text>

        <View style={styles.tipBox}>
          <Text style={styles.tipText}>
            💡 Không thấy email? Kiểm tra thư mục Spam, hoặc đợi 1-2 phút.
          </Text>
        </View>

        <Button
          label="Back to Login"
          onPress={() => router.replace('/login')}
          fullWidth
          style={styles.successBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  title: {
    fontFamily: typography.fontFamily.extrabold,
    fontSize: typography.sizes.xxl,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  form: { gap: spacing.md },
  submitBtn: { marginTop: spacing.md },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  footerText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  footerLink: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.sm,
    color: colors.primary,
  },

  successContent: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  iconBox: {
    width: 96,
    height: 96,
    borderRadius: radii.full,
    backgroundColor: colors.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontFamily: typography.fontFamily.extrabold,
    fontSize: typography.sizes.xxl,
    color: colors.primary,
    textAlign: 'center',
  },
  successBody: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 24,
  },
  emailHighlight: {
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
  },
  bold: {
    fontFamily: typography.fontFamily.bold,
  },
  tipBox: {
    backgroundColor: colors.cream,
    padding: spacing.md,
    borderRadius: radii.lg,
    width: '100%',
  },
  tipText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  successBtn: { marginTop: spacing.md },
});
