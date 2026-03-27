// utils/theme.ts

export const COLORS = {
  primary: '#0056D2', // A trustworthy blue (you can change this to match your app's brand)
  text: '#111827', // Dark gray/black for primary text
  textSecondary: '#6B7280', // Medium gray for secondary text
  textMuted: '#9CA3AF', // Lighter gray for placeholders
  border: '#E5E7EB', // Light gray for borders
  background: '#FFFFFF', // White background
  surface: '#F9FAFB',
  surfaceAlt: '#F3F4F6',
  overlay: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black for modals
  error: '#EF4444', // Red for errors (optional, good to have)
  reject: '#DC2626',
  success: '#10B981', // Green for success states (optional)
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
  round: 9999,
};

export const TYPOGRAPHY = {
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
};

export const SHADOW = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
};

export default {
  COLORS,
  SPACING,
  RADIUS,
  SHADOW,
  TYPOGRAPHY,
};
