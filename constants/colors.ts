/**
 * Color palette for the Marathon Training Plan app
 *
 * Design philosophy:
 * - Clean, athletic aesthetic
 * - High contrast for readability
 * - Distinct colors for workout types
 * - Accessible color choices
 */

export const Colors = {
  // Primary brand colors
  primary: {
    main: '#2563eb',      // Vibrant blue - primary actions
    light: '#60a5fa',     // Light blue - highlights
    dark: '#1d4ed8',      // Dark blue - pressed states
  },

  // Secondary accent
  accent: {
    main: '#f59e0b',      // Amber - achievements, highlights
    light: '#fbbf24',
    dark: '#d97706',
  },

  // Success/completion states
  success: {
    main: '#10b981',      // Emerald green
    light: '#34d399',
    dark: '#059669',
  },

  // Warning states
  warning: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
  },

  // Error/danger states
  error: {
    main: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
  },

  // Neutral grays
  neutral: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },

  // Workout type colors
  workout: {
    easy: '#22c55e',        // Green - easy/comfortable
    long: '#3b82f6',        // Blue - long runs
    tempo: '#f59e0b',       // Amber - tempo/threshold
    interval: '#ef4444',    // Red - hard intervals
    recovery: '#a3e635',    // Lime - recovery
    crossTraining: '#8b5cf6', // Purple - cross-training
    marathonPace: '#06b6d4', // Cyan - race pace
    progression: '#ec4899', // Pink - progression runs
    rest: '#6b7280',        // Gray - rest days
    race: '#eab308',        // Gold - race day!
  },

  // Phase colors (for calendar/progress views)
  phase: {
    base: '#22c55e',        // Green - building foundation
    build: '#3b82f6',       // Blue - building fitness
    peak: '#f59e0b',        // Amber - peak training
    taper: '#a855f7',       // Purple - recovery/taper
    raceWeek: '#eab308',    // Gold - race week
  },

  // Streak/achievement colors
  streak: {
    bronze: '#cd7f32',
    silver: '#c0c0c0',
    gold: '#ffd700',
    platinum: '#e5e4e2',
  },
};

// Light theme
export const LightTheme = {
  background: {
    primary: '#ffffff',
    secondary: Colors.neutral[50],
    tertiary: Colors.neutral[100],
  },
  text: {
    primary: Colors.neutral[900],
    secondary: Colors.neutral[600],
    tertiary: Colors.neutral[400],
    inverse: '#ffffff',
  },
  border: {
    light: Colors.neutral[200],
    medium: Colors.neutral[300],
    dark: Colors.neutral[400],
  },
  card: {
    background: '#ffffff',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  ...Colors,
};

// Dark theme
export const DarkTheme = {
  background: {
    primary: Colors.neutral[950],
    secondary: Colors.neutral[900],
    tertiary: Colors.neutral[800],
  },
  text: {
    primary: Colors.neutral[50],
    secondary: Colors.neutral[400],
    tertiary: Colors.neutral[500],
    inverse: Colors.neutral[900],
  },
  border: {
    light: Colors.neutral[800],
    medium: Colors.neutral[700],
    dark: Colors.neutral[600],
  },
  card: {
    background: Colors.neutral[900],
    shadow: 'rgba(0, 0, 0, 0.5)',
  },
  ...Colors,
};

export type AppTheme = typeof LightTheme;
