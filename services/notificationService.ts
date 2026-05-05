import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// ─── Availability guard ───────────────────────────────────────────────────────
// expo-notifications remote push was removed from Expo Go in SDK 53.
// We only activate the full notification stack when running in a real
// development build or production build (not Expo Go).
const appOwnership = Constants.appOwnership; // 'expo' = Expo Go, null = dev/prod build
const isExpoGo = appOwnership === 'expo';

// Lazily import expo-notifications so the module-level setNotificationHandler
// call never runs inside Expo Go (it throws in SDK 53+).
let Notifications: typeof import('expo-notifications') | null = null;
if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications');
    // Configure foreground notification behaviour only in real builds
    Notifications!.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch {
    Notifications = null;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Request permission and return the Expo push token.
 * Returns null in Expo Go, on simulators, or when permission is denied.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (isExpoGo || !Notifications || !Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4B3A99',
    });
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    return tokenData.data;
  } catch {
    return null;
  }
}

/**
 * Check if push notification permission is currently granted
 * without prompting the user.
 */
export async function getPushPermissionStatus(): Promise<boolean> {
  if (isExpoGo || !Notifications || !Device.isDevice) return false;
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

/**
 * Add a listener for incoming foreground notifications.
 * Returns a no-op subscription in Expo Go.
 */
export function addNotificationReceivedListener(
  handler: (notification: any) => void,
): { remove: () => void } {
  if (isExpoGo || !Notifications) return { remove: () => {} };
  return Notifications.addNotificationReceivedListener(handler);
}

/**
 * Add a listener for when the user taps a notification.
 * Returns a no-op subscription in Expo Go.
 */
export function addNotificationResponseListener(
  handler: (response: any) => void,
): { remove: () => void } {
  if (isExpoGo || !Notifications) return { remove: () => {} };
  return Notifications.addNotificationResponseReceivedListener(handler);
}

/** Whether push notifications are supported in the current environment. */
export const pushNotificationsSupported = !isExpoGo && Device.isDevice;
