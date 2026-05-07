import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useIsAuthenticated, useIsInitializing } from '@/features/auth/store';
import { colors } from '@/lib/theme';

export default function MainLayout() {
  const isAuthenticated = useIsAuthenticated();
  const isInitializing = useIsInitializing();

  if (isInitializing) return null;
  if (!isAuthenticated) return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="garden/index"
        options={{
          title: 'Garden',
          tabBarIcon: ({ color, size }) => <Ionicons name="leaf" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
      {/* Hide các route con khỏi tab bar — vẫn navigatable qua router.push */}
      <Tabs.Screen name="garden/[date]" options={{ href: null }} />
      <Tabs.Screen name="home/calendar" options={{ href: null }} />
      <Tabs.Screen name="gallery" options={{ href: null }} />
    </Tabs>
  );
}
