import { AuthProvider } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getAppTheme } from '@/lib/theme/appTheme';
import {
    addNotificationReceivedListener,
    addNotificationResponseListener,
    registerForPushNotifications,
    registerPushTokenWithBackend,
} from '@/services/notificationService';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import "./global.css";

export const unstable_settings = {
  anchor: 'index',
};

export function MainApp() {
  const router = useRouter();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const pushEnabled = useNotificationStore((state) => state.pushEnabled);
  const setPushEnabled = useNotificationStore((state) => state.setPushEnabled);
  const setExpoPushToken = useNotificationStore((state) => state.setExpoPushToken);
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
    responseListener.current = addNotificationResponseListener((response: any) => {
      const data = response?.notification?.request?.content?.data || {};
      const route = String(data?.route || data?.screen || '').trim();

      if (route === 'chat' && data?.conversationId) {
        router.push({
          pathname: '/chat',
          params: {
            conversationId: String(data.conversationId),
            ...(data?.participantId ? { participantId: String(data.participantId) } : {}),
          },
        } as any);
        return;
      }

      if ((route === 'order' || route === 'order-details') && data?.orderId) {
        router.push({
          pathname: '/order/[id]',
          params: { id: String(data.orderId) },
        } as any);
        return;
      }

      router.push('/notification' as any);
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    const syncPushRegistration = async () => {
      if (!isLoggedIn || !pushEnabled) return;

      const token = await registerForPushNotifications();
      if (!token || cancelled) return;

      try {
        await registerPushTokenWithBackend(token);
        if (!cancelled) {
          setExpoPushToken(token);
          setPushEnabled(true);
        }
      } catch {
        // The app remains usable when the backend token endpoint is unavailable.
        // The settings screen will surface the actionable error when the user
        // explicitly enables push notifications.
      }
    };

    syncPushRegistration();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, pushEnabled, setExpoPushToken, setPushEnabled]);

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
          />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return <MainApp />;
}
