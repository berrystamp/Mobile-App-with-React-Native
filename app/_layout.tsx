import { AuthProvider } from '@/context/AuthContext';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from "react";
import 'react-native-reanimated';
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useColorScheme } from '@/hooks/use-color-scheme';
import "./global.css";

export const unstable_settings = {
  anchor: 'index',
};

export function MainApp() {
  const colorScheme = useColorScheme();
  
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          {/* Main Initial Screen */}
          <Stack.Screen name="index" />
          
          {/* Route Groups */}
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          
          
        </Stack>
        <StatusBar style="auto" />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500); 
  }, []);

  return loading ? <LoadingSpinner message="Loading..." /> : <MainApp />;
}