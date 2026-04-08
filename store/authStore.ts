import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { TProfileType } from '@/types';

export type AccountType = 'customer' | 'designer' | 'printer';

export const toProfileType = (role: AccountType | string | null | undefined): TProfileType => {
  switch (String(role || 'customer').toLowerCase()) {
    case 'designer':
      return 'DESIGNER';
    case 'printer':
      return 'PRINTER';
    default:
      return 'CUSTOMER';
  }
};

export const isCustomerRole = (role: AccountType | string | null | undefined) =>
  toProfileType(role) === 'CUSTOMER';

export const toAccountType = (role: TProfileType | AccountType | string | null | undefined): AccountType => {
  switch (String(role || 'customer').toLowerCase()) {
    case 'designer':
      return 'designer';
    case 'printer':
      return 'printer';
    default:
      return 'customer';
  }
};

interface AuthState {
  isLoggedIn: boolean;
  role: AccountType | string;
  accountType: AccountType | null;
  hasSelectedInterests: boolean;
  needsInterestOnboarding: boolean;
  isHydrated: boolean;
  login: (role: AccountType) => void;
  signUp: (role: AccountType) => void;
  logout: () => void;
  setAccountType: (accountType: AccountType) => void;
  setHasSelectedInterests: (value: boolean) => void;
  setNeedsInterestOnboarding: (value: boolean) => void;
  setHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      role: "customer",
      accountType: null,
      hasSelectedInterests: false,
      needsInterestOnboarding: false,
      isHydrated: false,
      login: (role) =>
        set({
          isLoggedIn: true,
          role,
          accountType: role,
        }),
      signUp: (role) =>
        set({
          isLoggedIn: false,
          role,
          accountType: role,
          hasSelectedInterests: role === 'customer' ? false : true,
          needsInterestOnboarding: role === 'customer',
        }),
      logout: () =>
        set({
          isLoggedIn: false,
          role: "customer",
          accountType: null,
          hasSelectedInterests: false,
          needsInterestOnboarding: false,
        }),
      setAccountType: (accountType) =>
        set((state) => ({
          accountType,
          role: accountType,
          hasSelectedInterests:
            accountType === 'customer' ? state.hasSelectedInterests : false,
          needsInterestOnboarding:
            accountType === 'customer' ? state.needsInterestOnboarding : false,
        })),
      setHasSelectedInterests: (value) => set({ hasSelectedInterests: value }),
      setNeedsInterestOnboarding: (value) => set({ needsInterestOnboarding: value }),
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
        needsInterestOnboarding: state.needsInterestOnboarding,
      }),
    },
  ),
);
