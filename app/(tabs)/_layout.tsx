import Header from '@/components/common/Header';
import { AuthProvider } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter, Stack } from 'expo-router';
import BottomNavigation from '@/components/common/BottomNavigation';
import React from 'react';
import { useColorScheme, View } from 'react-native';

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
const router = useRouter();
  const theme = {
    background: isDark ? '#121212' : '#FFFFFF',
    tabBar: isDark ? '#1E1E1E' : '#FFFFFF',
    activeTint: '#4B3A99',
    inactiveTint: isDark ? '#7A7A7A' : '#B0B0B0',
  };

  return (
    <AuthProvider>
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <Header
        type="main"
        onSearchPress={() => router.push('Search')}
        onNotificationPress={() => console.log('Notifications')}
      />
        <Stack screenOptions={{ headerShown: false }}>
  
          <Stack.Screen name="(tabs)/index" />
          
          {/* Route Groups */}
          <Stack.Screen name="/cart" />
          <Stack.Screen name="/chat" />
<Stack.Screen name="/checkout" />
          <Stack.Screen name="/favorites" />
<Stack.Screen name="/Filter" />
          <Stack.Screen name="/messages" />
<Stack.Screen name="/printers" />
          <Stack.Screen name="/product" />
<Stack.Screen name="/profile" />
          <Stack.Screen name="/Search" />
<Stack.Screen name="/select-printer" />
        </Stack>
	<BottomNavigation 
        activeRoute="Home"
        onNavigate={(route) => console.log('Navigate to:', route)}
      />
      </View>
    </AuthProvider>
  );
}