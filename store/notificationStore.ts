import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface NotificationState {
  pushEnabled: boolean;
  expoPushToken: string | null;
  setPushEnabled: (enabled: boolean) => void;
  setExpoPushToken: (token: string | null) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      pushEnabled: false,
      expoPushToken: null,
      setPushEnabled: (pushEnabled) => set({ pushEnabled }),
      setExpoPushToken: (expoPushToken) => set({ expoPushToken }),
    }),
    {
      name: 'notification-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
