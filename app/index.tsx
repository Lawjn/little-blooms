import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useIsAuthenticated, useIsInitializing } from '@/features/auth/store';
import { colors, radii, spacing, typography } from '@/lib/theme';

const SPLASH_DURATION_MS = 2000;

export default function StartScreen() {
  const isAuthenticated = useIsAuthenticated();
  const isInitializing = useIsInitializing();
  const [minDelayDone, setMinDelayDone] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: SPLASH_DURATION_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    const t = setTimeout(() => setMinDelayDone(true), SPLASH_DURATION_MS);
    return () => clearTimeout(t);
  }, [progress]);

  if (!isInitializing && minDelayDone) {
    return <Redirect href={isAuthenticated ? '/home' : '/login'} />;
  }

  const widthInterpolate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.logoBox}>
        <Text style={styles.logoEmoji}>🌱</Text>
      </View>
      <Text style={styles.appName}>Little Blooms</Text>

      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: widthInterpolate }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    padding: spacing.xl,
  },
  logoBox: {
    width: 128,
    height: 128,
    borderRadius: radii.xl,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoEmoji: {
    fontSize: 72,
  },
  appName: {
    fontFamily: typography.fontFamily.extrabold,
    fontSize: typography.sizes.xxl,
    color: colors.text.primary,
    marginBottom: spacing.xxl,
  },
  progressTrack: {
    width: 240,
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.greenLight,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
  },
});
