/**
 * Core type definitions for the Marathon Training Plan app
 */

// ============================================
// Plan Types
// ============================================

export interface TrainingPlan {
  id: string;
  name: string;
  raceDate: string;        // ISO date string
  startDate: string;       // ISO date string
  templateId: TemplateId;
  customizations: PlanCustomizations;
  createdAt: string;
  updatedAt: string;
}

export type TemplateId =
  | 'first-marathon'
  | 'confident-finisher'
  | 'pr-pursuit'
  | 'time-efficient'
  | 'custom';

export interface PlanCustomizations {
  restDays: DayOfWeek[];
  longRunDay: DayOfWeek;
  units: Units;
  crossTrainingPreference: CrossTrainingType;
  adjustedWorkouts: WorkoutOverride[];
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 6 = Saturday
export type Units = 'miles' | 'kilometers';
export type CrossTrainingType = 'cycling' | 'swimming' | 'elliptical' | 'strength' | 'none';

export interface WorkoutOverride {
  originalWorkoutId: string;
  newDate?: string;
  newType?: WorkoutType;
  newDescription?: string;
  newDistance?: number;
  skipped?: boolean;
}

// ============================================
// Workout Types
// ============================================

export interface Workout {
  id: string;
  planId: string;
  date: string;            // ISO date string
  weekNumber: number;
  dayOfWeek: DayOfWeek;
  type: WorkoutType;
  title: string;
  description: string;
  distance?: number;       // in user's preferred units
  duration?: number;       // in minutes
  paceGuidance?: string;
  notes?: string;
  phase: TrainingPhase;
}

export type WorkoutType =
  | 'easy'
  | 'long'
  | 'tempo'
  | 'interval'
  | 'recovery'
  | 'cross-training'
  | 'marathon-pace'
  | 'progression'
  | 'rest'
  | 'race';

export type TrainingPhase =
  | 'base'
  | 'build'
  | 'peak'
  | 'taper'
  | 'race-week';

// ============================================
// Completion Tracking
// ============================================

export interface WorkoutCompletion {
  id: string;
  workoutId: string;
  planId: string;
  completedAt: string;     // ISO date string
  actualDistance?: number;
  actualDuration?: number; // in minutes
  perceivedEffort?: EffortLevel;
  notes?: string;
  skipped: boolean;
  skipReason?: SkipReason;
}

export type EffortLevel = 1 | 2 | 3 | 4 | 5;
export type SkipReason =
  | 'injury'
  | 'illness'
  | 'weather'
  | 'life-event'
  | 'fatigue'
  | 'travel'
  | 'other';

// ============================================
// User Preferences
// ============================================

export interface UserPreferences {
  units: Units;
  theme: Theme;
  notifications: NotificationPreferences;
  hasCompletedOnboarding: boolean;
  defaultRestDays: DayOfWeek[];
  defaultLongRunDay: DayOfWeek;
}

export type Theme = 'light' | 'dark' | 'system';

export interface NotificationPreferences {
  enabled: boolean;
  dailyReminder: boolean;
  dailyReminderTime: string;       // "HH:mm" format
  dayBeforeReminder: boolean;
  longRunSpecialReminder: boolean;
  weekSummary: boolean;
  weekSummaryDay: DayOfWeek;
  streakCelebrations: boolean;
  soundEnabled: boolean;
}

// ============================================
// Progress & Stats
// ============================================

export interface PlanProgress {
  planId: string;
  totalWorkouts: number;
  completedWorkouts: number;
  skippedWorkouts: number;
  currentStreak: number;
  longestStreak: number;
  totalDistanceCompleted: number;
  totalDurationCompleted: number;  // in minutes
  weeksUntilRace: number;
  currentWeek: number;
  completionRate: number;          // 0-100
}

export interface WeekSummary {
  weekNumber: number;
  startDate: string;
  endDate: string;
  phase: TrainingPhase;
  plannedWorkouts: number;
  completedWorkouts: number;
  plannedDistance: number;
  actualDistance: number;
  workouts: Workout[];
}

// ============================================
// Template Definitions
// ============================================

export interface PlanTemplate {
  id: TemplateId;
  name: string;
  shortDescription: string;
  longDescription: string;
  targetAudience: string;
  durationWeeks: number;
  runsPerWeek: number;
  peakMileage: number;
  features: string[];
  weeklyStructure: WeeklyStructure;
}

export interface WeeklyStructure {
  [key: number]: WorkoutType; // day of week -> workout type
}

// ============================================
// Calendar Export
// ============================================

export interface CalendarEvent {
  title: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  notes?: string;
  alarms?: number[];  // minutes before event
}

// ============================================
// App State
// ============================================

export interface AppState {
  currentPlanId: string | null;
  plans: TrainingPlan[];
  isLoading: boolean;
  error: string | null;
}

// ============================================
// Onboarding
// ============================================

export interface OnboardingData {
  raceDate: string | null;
  raceName?: string;
  experienceLevel: ExperienceLevel | null;
  selectedTemplate: TemplateId | null;
  customizations: Partial<PlanCustomizations>;
}

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

// ============================================
// Utility Types
// ============================================

export type DateString = string; // ISO 8601 date string

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
