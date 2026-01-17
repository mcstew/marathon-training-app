import { WorkoutType } from '../types';

// Colors for workout types
export const WORKOUT_COLORS: Record<WorkoutType, { bg: string; text: string; border: string }> = {
  rest: { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' },
  run: { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
  pace: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
  cross: { bg: '#e0e7ff', text: '#3730a3', border: '#c7d2fe' },
  race: { bg: '#fef08a', text: '#854d0e', border: '#fde047' },
};

// App colors
export const Colors = {
  // Primary
  primary: '#2563eb',
  primaryLight: '#60a5fa',
  primaryDark: '#1d4ed8',

  // Success
  success: '#22c55e',
  successLight: '#86efac',
  successDark: '#16a34a',

  // Warning
  warning: '#f59e0b',
  warningLight: '#fcd34d',
  warningDark: '#d97706',

  // Error
  error: '#ef4444',
  errorLight: '#fca5a5',
  errorDark: '#dc2626',

  // Neutral
  white: '#ffffff',
  black: '#000000',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
};

// Light theme
export const LightTheme = {
  background: Colors.gray50,
  surface: Colors.white,
  text: Colors.gray900,
  textSecondary: Colors.gray500,
  textTertiary: Colors.gray400,
  border: Colors.gray200,
  borderLight: Colors.gray100,
  ...Colors,
};

// Dark theme
export const DarkTheme = {
  background: Colors.gray900,
  surface: Colors.gray800,
  text: Colors.gray50,
  textSecondary: Colors.gray400,
  textTertiary: Colors.gray500,
  border: Colors.gray700,
  borderLight: Colors.gray800,
  ...Colors,
};

export type Theme = typeof LightTheme;
