import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type AccountType = 'customer' | 'designer' | 'printer';

interface AuthState {
  isLoggedIn: boolean;
  role: AccountType | null;
  accountType: AccountType | null;
  hasSelectedInterests: boolean;
  isHydrated: boolean;
  login: (role: AccountType) => void;
  signUp: (role: AccountType) => void;
  logout: () => void;
  setAccountType: (accountType: AccountType) => void;
  setHasSelectedInterests: (value: boolean) => void;
  setHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      role: null,
      accountType: null,
      hasSelectedInterests: false,
      isHydrated: false,
      login: (role) =>
        set({
          isLoggedIn: true,
          role,
          accountType: role,
        }),
      signUp: (role) =>
        set({
          isLoggedIn: true,
          role,
          accountType: role,
        }),
      logout: () =>
        set({
          isLoggedIn: false,
          role: null,
          accountType: null,
          hasSelectedInterests: false,
        }),
      setAccountType: (accountType) =>
        set((state) => ({
          accountType,
          role: state.isLoggedIn ? accountType : state.role,
          hasSelectedInterests:
            accountType === 'customer' ? state.hasSelectedInterests : false,
        })),
      setHasSelectedInterests: (value) => set({ hasSelectedInterests: value }),
      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        role: state.role,
        accountType: state.accountType,
        hasSelectedInterests: state.hasSelectedInterests,
      }),
    },
  ),
);
