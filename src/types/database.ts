// Database types for Supabase

export interface DbProfile {
  id: string;
  email: string;
  display_name: string | null;
  units: 'miles' | 'km';
  theme: 'light' | 'dark' | 'system';
  is_onboarded: boolean;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface DbTrainingPlan {
  id: string;
  user_id: string;
  plan_id: string;
  plan_name: string;
  race_date: string;
  start_date: string;
  status: 'active' | 'completed' | 'abandoned';
  created_at: string;
  updated_at: string;
  synced_at: string | null;
}

export interface DbWorkout {
  id: string;
  training_plan_id: string;
  user_id: string;
  week_number: number;
  date: string;
  title: string;
  description: string | null;
  type: 'rest' | 'run' | 'pace' | 'cross' | 'race';
  planned_distance: number | null;
  unit: 'mi' | 'km';
  is_completed: boolean;
  is_skipped: boolean;
  actual_distance: number | null;
  actual_duration: number | null;
  notes: string | null;
  perceived_effort: number | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  client_id: string | null;
  version: number;
}

// Insert types (without auto-generated fields)
export type DbTrainingPlanInsert = Omit<DbTrainingPlan, 'id' | 'created_at' | 'updated_at' | 'synced_at'>;
export type DbWorkoutInsert = Omit<DbWorkout, 'id' | 'created_at' | 'updated_at'>;

// Update types
export type DbTrainingPlanUpdate = Partial<Omit<DbTrainingPlan, 'id' | 'user_id' | 'created_at'>>;
export type DbWorkoutUpdate = Partial<Omit<DbWorkout, 'id' | 'training_plan_id' | 'user_id' | 'created_at'>>;
