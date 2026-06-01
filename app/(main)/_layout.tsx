import { Tabs, Redirect } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useIsAuthenticated, useIsInitializing } from '@/features/auth/store';
import { colors, shadows } from '@/lib/theme';

export default function MainLayout() {
  const isAuthenticated = useIsAuthenticated();
  const isInitializing = useIsInitializing();
  const insets = useSafeAreaInsets();

  if (isInitializing) return null;
  if (!isAuthenticated) return <Redirect href="/login" />;

  // Chừa chỗ cho thanh điều hướng Android / home indicator iOS (tối thiểu 8px)
  const bottomInset = Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: '#6B8E68',
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopWidth: 0,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          height: 64 + bottomInset,
          paddingTop: 8,
          paddingBottom: bottomInset,
          ...shadows.lg,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
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
          title: '',
          tabBarIcon: () => (
            <View style={styles.fab}>
              <MaterialCommunityIcons name="sprout" size={28} color={colors.white} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="store/index"
        options={{
          title: 'Store',
          tabBarIcon: ({ color, size }) => <Ionicons name="storefront" size={size} color={color} />,
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
      <Tabs.Screen name="coach" options={{ href: null }} />
      <Tabs.Screen name="garden/[date]" options={{ href: null }} />
      <Tabs.Screen name="home/calendar" options={{ href: null }} />
      <Tabs.Screen name="gallery" options={{ href: null }} />
      <Tabs.Screen name="store/plants" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30, // nâng nổi lên trên tab bar
    borderWidth: 4,
    borderColor: colors.white,
    ...shadows.lg,
  },
});
