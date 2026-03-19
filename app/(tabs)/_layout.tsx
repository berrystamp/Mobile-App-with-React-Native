<<<<<<< HEAD
import React from 'react';
import { useColorScheme, View } from 'react-native';
import { Stack } from 'expo-router';
import BottomNavigation from '@/components/common/BottomNavigation';

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const theme = {
    background: isDark ? '#121212' : '#FFFFFF',
    tabBar: isDark ? '#1E1E1E' : '#FFFFFF',
    activeTint: '#4B3A99',
    inactiveTint: isDark ? '#7A7A7A' : '#B0B0B0',
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.background } }}>
        <Stack.Screen name="index" />
        {/* Route Groups */}
        <Stack.Screen name="/cart" />
        <Stack.Screen name="/chat" />
        <Stack.Screen name="/checkout" />
        <Stack.Screen name="/favorites" />
        <Stack.Screen name="/Filter" />
        <Stack.Screen name="/messages" />
        <Stack.Screen name="/item-specification" />
        <Stack.Screen name="/printers" />
        <Stack.Screen name="/product" />
        <Stack.Screen name="/product-details" />
        <Stack.Screen name="/products" />
        <Stack.Screen name="/print-now" />
        <Stack.Screen name="/print-specification" />
        <Stack.Screen name="/profile" />
        <Stack.Screen name="/Search" />
        <Stack.Screen name="/select-print-type" />
        <Stack.Screen name="/select-printer" />
        <Stack.Screen name="/delivery-date" />
      </Stack>
      
      {/* activeRoute is removed because it now figures it out automatically! */}
      <BottomNavigation 
        onNavigate={(route: string) => console.log('Navigated to:', route)}
      />
    </View>
=======
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
>>>>>>> f411c144b4f1aff85c4c9a8812776d0b173f68b5
  );
}
