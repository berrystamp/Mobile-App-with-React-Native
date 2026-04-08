import { useColorScheme } from '@/hooks/use-color-scheme';

export const appTheme = {
  light: {
    background: '#F2F2F2',
    surface: '#FFFFFF',
    surfaceMuted: '#F5F5F5',
    iconBg: '#F5F5F5',
    text: '#1A1A1A',
    textMuted: '#666666',
    border: '#E6E6E6',
    icon: '#555555',
    primary: '#4B3A99',
    onPrimary: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.45)',
  },
  dark: {
    background: '#121212',
    surface: '#2E255E',
    surfaceMuted: '#251E4B',
    iconBg: '#2E255E',
    text: '#FFFFFF',
    textMuted: '#D8D2F2',
    border: '#5E4BB3',
    icon: '#E7E1FF',
    primary: '#8A7AE6',
    onPrimary: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.60)',
  },
} as const;

export type AppThemeName = keyof typeof appTheme;
export type AppTheme = (typeof appTheme)[AppThemeName];

export function getAppTheme(themeName?: AppThemeName | null): AppTheme {
  return themeName === 'dark' ? appTheme.dark : appTheme.light;
}

export function useAppTheme() {
  const themeName = useColorScheme();
  return getAppTheme(themeName);
}
