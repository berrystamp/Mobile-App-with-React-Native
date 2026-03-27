import { AuthProvider } from '@/context/AuthContext';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from "react";
import 'react-native-reanimated';
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getAppTheme } from '@/lib/theme/appTheme';
import "./global.css"

export const unstable_settings = {
  anchor: 'index',
};

export function MainApp() {
  const colorScheme = useColorScheme();
  const theme = getAppTheme(colorScheme);

  const navigationTheme = colorScheme === 'dark'
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: theme.background,
          card: theme.surface,
          text: theme.text,
          border: theme.border,
          primary: theme.primary,
          notification: theme.primary,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: theme.background,
          card: theme.surface,
          text: theme.text,
          border: theme.border,
          primary: theme.primary,
          notification: theme.primary,
        },
      };
  
  return (
    <ThemeProvider value={navigationTheme}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          {/* Main Initial Screen */}
          <Stack.Screen name="index" />
          
          {/* Route Groups */}
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          
          
        </Stack>
        <StatusBar
          style={colorScheme === 'dark' ? 'light' : 'dark'}
          backgroundColor={theme.background}
        />
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
