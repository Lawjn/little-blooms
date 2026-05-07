import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'expo-router';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useSignIn } from '@/features/auth/hooks';
import { colors, radii, shadows, spacing, typography } from '@/lib/theme';

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginScreen() {
  const signIn = useSignIn();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await signIn.mutateAsync(data);
      // Auth listener tự update session → (auth)/_layout redirect sang /home
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đăng nhập thất bại';
      if (message.toLowerCase().includes('email not confirmed')) {
        Alert.alert(
          'Email chưa xác nhận',
          'Vui lòng kiểm tra hộp thư email và bấm link xác nhận trước khi đăng nhập. Đôi khi email vào Spam.',
        );
      } else if (message.toLowerCase().includes('invalid login credentials')) {
        Alert.alert('Sai thông tin', 'Email hoặc mật khẩu không đúng. Thử lại nhé.');
      } else {
        Alert.alert('Đăng nhập thất bại', message);
      }
    }
  };

  const onGooglePress = () => {
    // TODO sub-task 1.10: Google OAuth
    console.log('[google oauth placeholder]');
  };

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
          <Text style={styles.title}>Welcome back!</Text>

          <View style={styles.form}>
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

            <Link href="/forgot-password" style={styles.forgotLink}>
              Forgot password?
            </Link>
          </View>

          <Button
            label="Log In"
            onPress={handleSubmit(onSubmit)}
            loading={signIn.isPending}
            fullWidth
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or login with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <Pressable style={styles.socialBtn} onPress={onGooglePress}>
              <Ionicons name="logo-google" size={24} color="#DB4437" />
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don&apos;t have an account? </Text>
            <Link href="/signup" replace style={styles.footerLink}>
              Sign Up
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    marginTop: spacing.xxl,
    marginBottom: spacing.lg,
  },
  form: { gap: spacing.md },
  forgotLink: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  socialBtn: {
    width: 56,
    height: 56,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
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
});
