import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';
import { AuthProvider } from '@/context/AuthContext';
import { Stack, usePathname, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { View } from 'react-native';

export default function TabsLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const hideChrome = useMemo(
    () => ['/chat', '/checkout', '/Search', '/Filter', '/select-printer'].includes(pathname),
    [pathname],
  );

  const activeRoute = useMemo(() => {
    if (pathname === '/messages') return 'Messages';
    if (pathname === '/favorites') return 'Favorites';
    if (pathname === '/cart') return 'Cart';
    if (pathname === '/profile') return 'Profile';
    return 'Home';
  }, [pathname]);

  return (
    <AuthProvider>
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        {!hideChrome ? (
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
          <Stack.Screen name="messages" />
          <Stack.Screen name="printers" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="Search" />
          <Stack.Screen name="select-printer" />
        </Stack>
        {!hideChrome ? <BottomNavigation activeRoute={activeRoute} /> : null}
      </View>
    </AuthProvider>
  );
}
