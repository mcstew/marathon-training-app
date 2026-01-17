export enum PlanLevel {
  Novice1 = 'Novice 1',
  Novice2 = 'Novice 2',
  Intermediate1 = 'Intermediate 1',
  Intermediate2 = 'Intermediate 2',
  Advanced1 = 'Advanced 1',
  Advanced2 = 'Advanced 2',
}

export enum WorkoutType {
  Rest = 'Rest',
  EasyRun = 'Easy Run',
  LongRun = 'Long Run',
  Tempo = 'Tempo Run',
  Speed = 'Speed Work',
  CrossTrain = 'Cross Train',
  Race = 'Marathon',
}

export interface Workout {
  id: string;
  date: string; // ISO Date string YYYY-MM-DD
  type: WorkoutType;
  distanceInMiles: number;
  description: string;
  isCompleted: boolean;
  skipped: boolean;
  notes?: string;
}

export interface WeeklyPlan {
  weekNumber: number;
  workouts: Workout[];
  totalMileage: number;
}

export interface TrainingPlan {
  id: string;
  level: PlanLevel;
  raceDate: string;
  startDate: string;
  weeks: WeeklyPlan[];
  createdAt: number;
}

export interface UserConfig {
  isOnboarded: boolean;
  name: string;
  units: 'miles' | 'km';
  theme: 'light' | 'dark';
}

export interface PlanMetadata {
  id: PlanLevel;
  name: string;
  description: string;
  runsPerWeek: number;
  peakMileage: number;
  bestFor: string;
}