// Plan level identifiers matching the original web app
export type PlanId =
  | 'novice1'
  | 'novice2'
  | 'intermediate1'
  | 'intermediate2'
  | 'advanced1'
  | 'advanced2';

// Workout types
export type WorkoutType =
  | 'rest'
  | 'run'
  | 'pace'
  | 'cross'
  | 'race';

// A single workout in the plan
export interface Workout {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  type: WorkoutType;
  distance?: number;
  unit: 'mi' | 'km';
  isCompleted: boolean;
  isSkipped: boolean;
  actualDistance?: number;
  actualDuration?: number; // minutes
  notes?: string;
  perceivedEffort?: 1 | 2 | 3 | 4 | 5;
}

// A week of training
export interface TrainingWeek {
  weekNumber: number;
  startDate: string;
  endDate: string;
  workouts: Workout[];
  totalPlannedMileage: number;
}

// The complete training plan
export interface TrainingPlan {
  id: string;
  planId: PlanId;
  planName: string;
  raceDate: string;
  startDate: string;
  weeks: TrainingWeek[];
  createdAt: number;
}

// User configuration
export interface UserConfig {
  isOnboarded: boolean;
  units: 'miles' | 'km';
  theme: 'light' | 'dark' | 'system';
}

// Plan metadata for selection screen
export interface PlanMetadata {
  id: PlanId;
  name: string;
  description: string;
  runsPerWeek: number;
  peakMileage: number;
  bestFor: string;
}

// App state
export interface AppState {
  plan: TrainingPlan | null;
  userConfig: UserConfig;
}

// Stats for progress view
export interface PlanStats {
  totalWorkouts: number;
  completedWorkouts: number;
  skippedWorkouts: number;
  totalPlannedMiles: number;
  totalCompletedMiles: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  daysUntilRace: number;
  currentWeek: number;
}
