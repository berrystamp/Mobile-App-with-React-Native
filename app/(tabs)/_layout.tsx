import BottomNavigation from '@/components/common/BottomNavigation';
import Header from '@/components/common/Header';
import { AuthProvider } from '@/context/AuthContext';
import { Stack, usePathname, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { View, useColorScheme } from 'react-native';

export default function TabsLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const isDark = useColorScheme() === 'dark';

  const hideHeader = useMemo(
    () => ['/chat', '/checkout', '/Search', '/Filter', '/filter-product-category', '/filter-design-category', '/select-printer', '/products'].includes(pathname),
    [pathname],
  );

  const hideBottomNavigation = useMemo(
    () => ['/chat', '/checkout', '/Filter', '/filter-product-category', '/filter-design-category', '/select-printer', '/products'].includes(pathname),
    [pathname],
  );

  const activeRoute = useMemo(() => {
    if (pathname === '/messages') return 'Messages';
    if (pathname === '/favorites') return 'Favorites';
    if (pathname === '/cart') return 'Cart';
    if (pathname === '/profile') return 'Profile';
    if (pathname === '/Search') return 'Home';
    return 'Home';
  }, [pathname]);

  return (
    <AuthProvider>
      <View style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#FFFFFF' }}>
        {!hideHeader ? (
          <Header
            type="main"
            onSearchPress={() => router.push('/Search')}
            onNotificationPress={() => console.log('Notifications')}
          />
        ) : null}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="cart" />
          <Stack.Screen name="chat" />
          <Stack.Screen name="checkout" />
          <Stack.Screen name="favorites" />
          <Stack.Screen name="Filter" />
          <Stack.Screen name="filter-product-category" />
          <Stack.Screen name="filter-design-category" />
          <Stack.Screen name="messages" />
          <Stack.Screen name="printers" />
          <Stack.Screen name="products" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="Search" />
          <Stack.Screen name="select-printer" />
        </Stack>
        {!hideBottomNavigation ? <BottomNavigation onNavigate={() => activeRoute} /> : null}
      </View>
    </AuthProvider>
  );
}
