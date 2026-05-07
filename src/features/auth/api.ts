import { supabase } from '@/lib/supabase';

export async function signUpWithEmail(params: { email: string; password: string; name: string }) {
  return supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      data: { name: params.name },
      // Khi user click link confirm trong email → mở deep link về app.
      // Cần Supabase Dashboard → Auth → URL Configuration thêm `littleblooms://**` vào Redirect URLs.
      // Phase 10 sẽ test thật khi build dev client.
      emailRedirectTo: 'littleblooms://',
    },
  });
}

export async function signInWithEmail(params: { email: string; password: string }) {
  return supabase.auth.signInWithPassword({
    email: params.email,
    password: params.password,
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

/**
 * Gửi email chứa OTP recovery code 6 chữ số.
 * Dùng `verifyOtp` với type 'recovery' để verify code.
 */
export async function requestPasswordReset(email: string) {
  return supabase.auth.resetPasswordForEmail(email);
}

export async function verifyRecoveryOtp(params: { email: string; token: string }) {
  return supabase.auth.verifyOtp({
    email: params.email,
    token: params.token,
    type: 'recovery',
  });
}

export async function updatePassword(newPassword: string) {
  return supabase.auth.updateUser({ password: newPassword });
}
