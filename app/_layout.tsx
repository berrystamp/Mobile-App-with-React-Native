import { AuthProvider } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getAppTheme } from '@/lib/theme/appTheme';
import {
    addNotificationReceivedListener,
    addNotificationResponseListener,
} from '@/services/notificationService';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import "./global.css";

export const unstable_settings = {
  anchor: 'index',
};

export function MainApp() {
  const colorScheme = useColorScheme();
  const theme = getAppTheme(colorScheme);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

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

  useEffect(() => {
    // Listen for notifications received while app is foregrounded
    notificationListener.current = addNotificationReceivedListener((_notification) => {
      // Notification is shown automatically via setNotificationHandler
    });

    // Listen for user tapping a notification
    responseListener.current = addNotificationResponseListener((_response) => {
      // Could navigate to /notification here if needed
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
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
