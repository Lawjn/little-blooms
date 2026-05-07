import { useMutation } from '@tanstack/react-query';
import {
  requestPasswordReset,
  signInWithEmail,
  signOut,
  signUpWithEmail,
  updatePassword,
  verifyRecoveryOtp,
} from './api';

export function useSignUp() {
  return useMutation({
    mutationFn: signUpWithEmail,
    onSuccess: ({ error }) => {
      if (error) throw error;
    },
  });
}

export function useSignIn() {
  return useMutation({
    mutationFn: signInWithEmail,
    onSuccess: ({ error }) => {
      if (error) throw error;
    },
  });
}

export function useSignOut() {
  return useMutation({
    mutationFn: signOut,
  });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: ({ error }) => {
      if (error) throw error;
    },
  });
}

export function useVerifyRecoveryOtp() {
  return useMutation({
    mutationFn: verifyRecoveryOtp,
    onSuccess: ({ error }) => {
      if (error) throw error;
    },
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: updatePassword,
    onSuccess: ({ error }) => {
      if (error) throw error;
    },
  });
}
