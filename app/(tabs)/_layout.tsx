import BottomNavigation from '@/components/common/BottomNavigation';
import Header from '@/components/common/Header';
import { AuthProvider } from '@/context/AuthContext';
import { useAppTheme } from '@/lib/theme/appTheme';
import { Stack, usePathname, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { View } from 'react-native';

export default function TabsLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useAppTheme();

  const hideHeader = useMemo(
    () => ['/chat', '/checkout', '/Search', '/Filter', '/filter-product-category', '/filter-design-category', '/select-printer', '/products', '/custom-designs', '/custom-design', '/SelectDesignForScreen', '/SelectDesignThemeScreen', '/SelectItemsScreen', '/favorites', '/messages', '/profile', '/notification', '/payments', '/edit-profile', '/track-order'].includes(pathname),
    [pathname],
  );

  const hideBottomNavigation = useMemo(
    () => ['/chat', '/checkout', '/Filter', '/filter-product-category', '/filter-design-category', '/select-printer', '/products', '/custom-designs', '/custom-design', '/SelectDesignForScreen', '/SelectDesignThemeScreen', '/SelectItemsScreen', '/notification', '/payments', '/edit-profile', '/track-order'].includes(pathname),
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
      <View style={{ flex: 1, backgroundColor: theme.background }}>
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
          <Stack.Screen name="notification" />
          <Stack.Screen name="edit-profile" />
          <Stack.Screen name="payment-details" />
          <Stack.Screen name="payments" />
          <Stack.Screen name="track-order" />
          <Stack.Screen name="Search" />
          <Stack.Screen name="select-printer" />
          <Stack.Screen name="custom-designs" />
          <Stack.Screen name="custom-design" />
          <Stack.Screen name="SelectDesignForScreen" />
          <Stack.Screen name="SelectDesignThemeScreen" />
          <Stack.Screen name="SelectItemsScreen" />
        </Stack>
        {!hideBottomNavigation ? <BottomNavigation onNavigate={() => activeRoute} /> : null}
      </View>
    </AuthProvider>
  );
}
