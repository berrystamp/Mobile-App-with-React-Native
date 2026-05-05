import { useThemeStore } from '@/store/themeStore';
import { useColorScheme as useSystemColorScheme } from 'react-native';

/**
 * Returns the effective color scheme ('light' | 'dark') by combining
 * the user's stored preference with the device system setting.
 *
 * - 'light' / 'dark' → always use that value
 * - 'system' (default) → follow the device setting
 *
 * Falls back to system scheme while the Zustand store is hydrating from
 * AsyncStorage (prevents the "Property 'useThemeStore' doesn't exist" error
 * that occurs when the module is evaluated before the store is ready).
 */
export function useColorScheme(): 'light' | 'dark' {
  const systemScheme = useSystemColorScheme() ?? 'light';

  // useThemeStore is safe to call here — Zustand initialises synchronously
  // with the default value ('system') and hydrates asynchronously.
  // The try/catch is a belt-and-suspenders guard for Hermes edge cases.
  let preference: string = 'system';
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    preference = useThemeStore((s) => s.preference);
  } catch {
    preference = 'system';
  }

  if (preference === 'light') return 'light';
  if (preference === 'dark') return 'dark';
  return systemScheme;
}
