import BottomNavigation from '@/components/common/BottomNavigation';
import Header from '@/components/common/Header';
import { AuthProvider } from '@/context/AuthContext';
import { CustomDesignProvider } from '@/context/CustomDesignContext';
import { isCustomerRole, useAuthStore } from '@/store/authStore';
import { Stack, usePathname, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { View } from 'react-native';

const HIDE_HEADER_ROUTES = [
  '/chat', '/checkout', '/Search', '/Filter',
  '/filter-product-category', '/filter-design-category',
  '/select-printer', '/select-designer',
  '/products', '/my-shop', '/custom-design',
  '/create-custom-design',
  '/SelectDesignForScreen', '/SelectDesignThemeScreen', '/SelectItemsScreen',
  '/OnDemandDesignersScreen', '/DesignerMessageScreen',
  '/OrderDetailsScreen', '/PaymentMethodScreen', '/PaymentMethodSelectScreen', '/CardPaymentScreen',
  '/favorites', '/messages', '/profile', '/notification',
  '/payments', '/edit-profile', '/track-order', '/faq',
  '/referral', '/referral-how-it-works', '/manage-order',
  '/update-interest', '/switch-account', '/upload-design', '/create-collection',
  '/settings',
  '/suggestion',
];

const HIDE_NAV_ROUTES = [
  '/chat', '/checkout', '/Filter',
  '/filter-product-category', '/filter-design-category',
  '/select-printer', '/select-designer',
  '/my-shop', '/custom-design',
  '/create-custom-design',
  '/SelectDesignForScreen', '/SelectDesignThemeScreen', '/SelectItemsScreen',
  '/OnDemandDesignersScreen', '/DesignerMessageScreen',
  '/OrderDetailsScreen', '/PaymentMethodScreen', '/PaymentMethodSelectScreen', '/CardPaymentScreen',
  '/notification', '/payments', '/edit-profile', '/track-order',
  '/faq', '/referral', '/referral-how-it-works', '/manage-order',
  '/update-interest', '/switch-account', '/upload-design', '/create-collection',
  '/products', '/settings', '/suggestion',
];

export default function TabsLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const role = useAuthStore((state) => state.role);
  const isCustomer = isCustomerRole(role);

  const hideHeader = useMemo(
    () =>
      !isCustomer ||
      HIDE_HEADER_ROUTES.includes(pathname) ||
      pathname.startsWith('/sp-') ||
      pathname.startsWith('/order/'),
    [isCustomer, pathname],
  );

  const hideBottomNavigation = useMemo(
    () =>
      HIDE_NAV_ROUTES.includes(pathname) ||
      pathname.startsWith('/order/') ||
      pathname.startsWith('/sp-'),
    [pathname],
  );

  return (
    <AuthProvider>
      <CustomDesignProvider>
      <View style={{ flex: 1 }}>
        {!hideHeader && (
          <Header
            type="main"
            onSearchPress={() => router.push('/Search')}
          />
        )}
        <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
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
          <Stack.Screen name="product" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="notification" />
          <Stack.Screen name="edit-profile" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="suggestion" />
          <Stack.Screen name="payment-details" />
          <Stack.Screen name="payments" />
          <Stack.Screen name="track-order" />
          <Stack.Screen name="update-interest" />
          <Stack.Screen name="faq" />
          <Stack.Screen name="referral" />
          <Stack.Screen name="referral-how-it-works" />
          <Stack.Screen name="switch-account" />
          <Stack.Screen name="upload-design" />
          <Stack.Screen name="create-collection" />
          <Stack.Screen name="Search" />
          <Stack.Screen name="select-printer" />
          <Stack.Screen name="select-designer" />
          <Stack.Screen name="my-shop" />
          <Stack.Screen name="shop-reviews" />
          <Stack.Screen name="shop-follows" />
          <Stack.Screen name="custom-design" />
          <Stack.Screen name="create-custom-design" />
          <Stack.Screen name="SelectDesignForScreen" />
          <Stack.Screen name="SelectDesignThemeScreen" />
          <Stack.Screen name="SelectItemsScreen" />
          <Stack.Screen name="OnDemandDesignersScreen" />
          <Stack.Screen name="DesignerMessageScreen" />
          <Stack.Screen name="OrderDetailsScreen" />
          <Stack.Screen name="PaymentMethodScreen" />
          <Stack.Screen name="PaymentMethodSelectScreen" />
          <Stack.Screen name="CardPaymentScreen" />
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
        {!hideBottomNavigation && <BottomNavigation />}
      </View>
      </CustomDesignProvider>
    </AuthProvider>
  );
}
