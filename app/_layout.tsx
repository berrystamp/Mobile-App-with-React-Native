import { useEffect } from "react";
import { AuthProvider } from '@/context/AuthContext';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen'; // 1. Import SplashScreen
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getAppTheme } from '@/lib/theme/appTheme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import "./global.css"

// 2. Prevent the splash screen from auto-hiding immediately
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: 'index',
};

export function MainApp() {
  const colorScheme = useColorScheme();
  const theme = getAppTheme(colorScheme);
  
  const navigationTheme = {
    ...(colorScheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(colorScheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.background,
      card: theme.surface,
      text: theme.text,
      border: theme.border,
      primary: theme.primary,
      notification: theme.primary,
    },
  };

  // 3. Hide the splash screen once this component mounts
  useEffect(() => {
    const hideSplash = async () => {
      // Small delay to ensure UI is painted, or just call it immediately
      await SplashScreen.hideAsync();
    };
    hideSplash();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider value={navigationTheme}>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
          <StatusBar
            style={colorScheme === 'dark' ? 'light' : 'dark'}
            backgroundColor={theme.background}
          />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return <MainApp />;
}