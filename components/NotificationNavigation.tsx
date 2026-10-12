import { useAuth } from '@/context/AuthContext';
import { addNotificationResponseListener, getLastNotificationResponse, clearLastNotificationResponse } from '@/services/notificationService';
import { router, useRootNavigationState } from 'expo-router';
import { useEffect, useRef } from 'react';

export default function NotificationNavigation() {
  const { isAuthenticated } = useAuth();
  const navigation = useRootNavigationState();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (!navigation?.key || !isAuthenticated) return;
    const open = (response: any) => {
      const notification = response?.notification;
      const id = notification?.request?.identifier;
      if (!id || handled.current === id) return;
      handled.current = id;
      const content = notification.request.content;
      router.push({ pathname: '/notification', params: {
        notificationId: String(content.data?.notificationId || ''),
        notificationTitle: String(content.title || 'Notification'),
        notificationBody: String(content.body || ''),
        notificationType: String(content.data?.type || 'GENERAL'),
      } });
      clearLastNotificationResponse();
    };
    const listener = addNotificationResponseListener(open);
    open(getLastNotificationResponse());
    return () => listener.remove();
  }, [isAuthenticated, navigation?.key]);

  return null;
}
