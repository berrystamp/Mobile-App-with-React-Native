import BottomNavigation from '@/components/common/BottomNavigation';
import Header from '@/components/common/Header';
import { AuthProvider } from '@/context/AuthContext';
import { useAuthStore, isCustomerRole } from '@/store/authStore';
import { Stack, usePathname, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { View } from 'react-native';

export default function TabsLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const role = useAuthStore((state) => state.role);
  const isCustomer = isCustomerRole(role);

  const hideHeader = useMemo(
    () =>
      !isCustomer ||
      ['/chat', '/checkout', '/Search', '/Filter', '/filter-product-category', '/filter-design-category', '/select-printer', '/products', '/my-shop', '/custom-design', '/SelectDesignForScreen', '/SelectDesignThemeScreen', '/SelectItemsScreen', '/favorites', '/messages', '/profile', '/notification', '/payments', '/edit-profile', '/track-order', '/faq', '/referral', '/referral-how-it-works', '/manage-order', '/update-interest'].includes(pathname) ||
      pathname.startsWith('/sp-') ||
      pathname.startsWith('/order/'),
    [isCustomer, pathname],
  );

  const hideBottomNavigation = useMemo(
    () => ['/chat', '/checkout', '/Filter', '/filter-product-category', '/filter-design-category', '/select-printer', '/products', '/my-shop', '/custom-design', '/SelectDesignForScreen', '/SelectDesignThemeScreen', '/SelectItemsScreen', '/notification', '/payments', '/edit-profile', '/track-order', '/faq', '/referral', '/referral-how-it-works', '/manage-order', '/update-interest'].includes(pathname) || pathname.startsWith('/order/') || pathname.startsWith('/sp-'),
    [pathname],
  );

  const activeRoute = useMemo(() => {
    if (pathname === '/messages') return 'Messages';
    if (pathname === '/manage-order' || pathname.startsWith('/order/')) return 'Manage Order';
    if (pathname === '/favorites') return 'Favorites';
    if (pathname === '/cart') return 'Cart';
    if (pathname === '/profile') return 'Profile';
    if (pathname === '/Search') return 'Home';
    return 'Home';
  }, [pathname]);

  return (
    <AuthProvider>
      <View style={{ flex: 1}}>
        {!hideHeader ? (
          <Header
            type="main"
            onSearchPress={() => router.push('/Search')}
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
          <Stack.Screen name="manage-order" />
          <Stack.Screen name="order/[id]" />
          <Stack.Screen name="printers" />
          <Stack.Screen name="products" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="notification" />
          <Stack.Screen name="edit-profile" />
          <Stack.Screen name="payment-details" />
          <Stack.Screen name="payments" />
          <Stack.Screen name="track-order" />
          <Stack.Screen name="update-interest" />
          <Stack.Screen name="faq" />
          <Stack.Screen name="referral" />
          <Stack.Screen name="referral-how-it-works" />
          <Stack.Screen name="Search" />
          <Stack.Screen name="select-printer" />
          <Stack.Screen name="my-shop" />
          <Stack.Screen name="shop-reviews" />
          <Stack.Screen name="shop-follows" />
          <Stack.Screen name="custom-design" />
          <Stack.Screen name="SelectDesignForScreen" />
          <Stack.Screen name="SelectDesignThemeScreen" />
          <Stack.Screen name="SelectItemsScreen" />
          <Stack.Screen name="sp-1" />
          <Stack.Screen name="sp-2" />
          <Stack.Screen name="sp-3" />
          <Stack.Screen name="sp-4" />
          <Stack.Screen name="sp-5" />
          <Stack.Screen name="sp-6" />
          <Stack.Screen name="sp-7" />
          <Stack.Screen name="sp-8" />
          <Stack.Screen name="sp-9" />
          <Stack.Screen name="sp-10" />
          <Stack.Screen name="sp-11" />
        </Stack>
        {!hideBottomNavigation ? <BottomNavigation onNavigate={() => activeRoute} /> : null}
      </View>
    </AuthProvider>
  );
}
