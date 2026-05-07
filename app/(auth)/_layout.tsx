import { Stack } from 'expo-router';
import { Redirect } from 'expo-router';
import { useIsAuthenticated, useIsInitializing } from '@/features/auth/store';

export default function AuthLayout() {
  const isAuthenticated = useIsAuthenticated();
  const isInitializing = useIsInitializing();

  if (isInitializing) return null;
  if (isAuthenticated) return <Redirect href="/home" />;

  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />;
}
