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
        <Stack.Screen name="/printers" />
        <Stack.Screen name="/product" />
        <Stack.Screen name="/profile" />
        <Stack.Screen name="/Search" />
        <Stack.Screen name="/select-printer" />
      </Stack>
      
      {/* activeRoute is removed because it now figures it out automatically! */}
      <BottomNavigation 
        onNavigate={(route: string) => console.log('Navigated to:', route)}
      />
    </View>
  );
}