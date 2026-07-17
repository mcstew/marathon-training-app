import { getSupabaseClient } from './client';
import {
  DbProfile,
  DbTrainingPlan,
  DbWorkout,
  DbTrainingPlanInsert,
  DbWorkoutInsert,
  DbWorkoutUpdate,
} from '../../types/database';
import { TrainingPlan, Workout, TrainingWeek } from '../../types';

// ============================================
// Profile Operations
// ============================================

export async function getProfile(userId: string): Promise<DbProfile | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    throw error;
  }
  return data;
}

export async function updateProfile(
  userId: string,
  updates: Partial<DbProfile>
): Promise<DbProfile> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// Training Plan Operations
// ============================================

export async function getActivePlan(userId: string): Promise<{
  plan: DbTrainingPlan;
  workouts: DbWorkout[];
} | null> {
  const supabase = getSupabaseClient();
  // Get the newest active plan. maybeSingle + limit keeps sync working even
  // if legacy duplicate active rows exist (single() would error forever).
  const { data: planData, error: planError } = await supabase
    .from('training_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (planError) throw planError;
  if (!planData) return null; // No active plan

  // Get workouts for this plan
  const { data: workoutsData, error: workoutsError } = await supabase
    .from('workouts')
    .select('*')
    .eq('training_plan_id', planData.id)
    .order('date', { ascending: true });

  if (workoutsError) throw workoutsError;

  return {
    plan: planData,
    workouts: workoutsData || [],
  };
}

export async function createPlan(
  plan: DbTrainingPlanInsert
): Promise<DbTrainingPlan> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('training_plans')
    .insert(plan)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePlan(
  planId: string,
  updates: Partial<DbTrainingPlan>
): Promise<DbTrainingPlan> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('training_plans')
    .update(updates)
    .eq('id', planId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// Workout Operations
// ============================================

export async function createWorkouts(
  workouts: DbWorkoutInsert[]
): Promise<DbWorkout[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('workouts')
    .insert(workouts)
    .select();

  if (error) throw error;
  return data || [];
}

export async function updateWorkout(
  workoutId: string,
  updates: DbWorkoutUpdate
): Promise<DbWorkout> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('workouts')
    .update(updates)
    .eq('id', workoutId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getWorkoutByClientId(
  clientId: string,
  userId: string
): Promise<DbWorkout | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('client_id', clientId)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Mark any currently-active plans for this user as abandoned.
 * Called before uploading a new plan so the one-active-plan invariant holds.
 */
export async function deactivateActivePlans(userId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('training_plans')
    .update({ status: 'abandoned' })
    .eq('user_id', userId)
    .eq('status', 'active');

  if (error) throw error;
}

export async function upsertWorkout(
  workout: DbWorkoutInsert & { id?: string }
): Promise<DbWorkout> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('workouts')
    .upsert(workout, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// Transform Functions: Local <-> Database
// ============================================

/**
 * Transform a local TrainingPlan to database format for upload
 */
export function localPlanToDb(
  plan: TrainingPlan,
  userId: string
): {
  plan: DbTrainingPlanInsert;
  workouts: DbWorkoutInsert[];
} {
  const dbPlan: DbTrainingPlanInsert = {
    user_id: userId,
    plan_id: plan.planId,
    plan_name: plan.planName,
    race_date: plan.raceDate,
    start_date: plan.startDate,
    status: plan.status || 'active',
  };

  const dbWorkouts: DbWorkoutInsert[] = [];

  for (const week of plan.weeks) {
    for (const workout of week.workouts) {
      dbWorkouts.push({
        training_plan_id: '', // Will be set after plan is created
        user_id: userId,
        week_number: week.weekNumber,
        date: workout.date,
        title: workout.title,
        description: workout.description || null,
        type: workout.type,
        planned_distance: workout.distance || null,
        unit: workout.unit,
        is_completed: workout.isCompleted,
        is_skipped: workout.isSkipped,
        actual_distance: workout.actualDistance || null,
        actual_duration: workout.actualDuration || null,
        notes: workout.notes || null,
        perceived_effort: workout.perceivedEffort || null,
        completed_at: workout.completedAt ? new Date(workout.completedAt).toISOString() : null,
        client_id: workout.id, // Store local ID for sync
        version: workout.version || 1,
      });
    }
  }

  return { plan: dbPlan, workouts: dbWorkouts };
}

/**
 * Transform database data to local TrainingPlan format
 */
export function dbPlanToLocal(
  dbPlan: DbTrainingPlan,
  dbWorkouts: DbWorkout[]
): TrainingPlan {
  // Group workouts by week
  const workoutsByWeek = new Map<number, DbWorkout[]>();
  for (const workout of dbWorkouts) {
    const weekWorkouts = workoutsByWeek.get(workout.week_number) || [];
    weekWorkouts.push(workout);
    workoutsByWeek.set(workout.week_number, weekWorkouts);
  }

  // Build weeks array
  const weeks: TrainingWeek[] = [];
  const sortedWeekNumbers = Array.from(workoutsByWeek.keys()).sort((a, b) => a - b);

  for (const weekNumber of sortedWeekNumbers) {
    const weekWorkouts = workoutsByWeek.get(weekNumber) || [];
    const sortedWorkouts = weekWorkouts.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const workouts: Workout[] = sortedWorkouts.map((w) => ({
      id: w.client_id || w.id, // Prefer client_id for local operations
      date: w.date,
      title: w.title,
      description: w.description || '',
      type: w.type,
      distance: w.planned_distance || undefined,
      unit: w.unit,
      isCompleted: w.is_completed,
      isSkipped: w.is_skipped,
      actualDistance: w.actual_distance || undefined,
      actualDuration: w.actual_duration || undefined,
      notes: w.notes || undefined,
      perceivedEffort: w.perceived_effort as 1 | 2 | 3 | 4 | 5 | undefined,
      remoteId: w.id,
      version: w.version,
      updatedAt: new Date(w.updated_at).getTime(),
      completedAt: w.completed_at ? new Date(w.completed_at).getTime() : undefined,
    }));

    // Calculate week dates
    const firstWorkout = sortedWorkouts[0];
    const lastWorkout = sortedWorkouts[sortedWorkouts.length - 1];

    // Calculate total planned mileage for the week
    const totalPlannedMileage = workouts.reduce(
      (sum, w) => sum + (w.distance || 0),
      0
    );

    weeks.push({
      weekNumber,
      startDate: firstWorkout?.date || '',
      endDate: lastWorkout?.date || '',
      workouts,
      totalPlannedMileage,
    });
  }

  return {
    id: dbPlan.id,
    planId: dbPlan.plan_id as TrainingPlan['planId'],
    planName: dbPlan.plan_name,
    raceDate: dbPlan.race_date,
    startDate: dbPlan.start_date,
    weeks,
    createdAt: new Date(dbPlan.created_at).getTime(),
    remoteId: dbPlan.id,
    syncedAt: dbPlan.synced_at ? new Date(dbPlan.synced_at).getTime() : undefined,
    status: dbPlan.status,
  };
}

/**
 * Upload a local plan to the database
 * Returns the plan with remote IDs populated
 */
export async function uploadPlan(
  plan: TrainingPlan,
  userId: string
): Promise<TrainingPlan> {
  const { plan: dbPlan, workouts: dbWorkouts } = localPlanToDb(plan, userId);

  // Keep the one-active-plan invariant: retire any existing active plan
  // before inserting a new active one (duplicates used to wedge sync).
  if ((dbPlan.status || 'active') === 'active') {
    await deactivateActivePlans(userId);
  }

  // Create the plan first
  const createdPlan = await createPlan(dbPlan);

  // Set the plan ID on all workouts and create them
  const workoutsWithPlanId = dbWorkouts.map((w) => ({
    ...w,
    training_plan_id: createdPlan.id,
  }));
  const createdWorkouts = await createWorkouts(workoutsWithPlanId);

  // Transform back to local format with remote IDs
  return dbPlanToLocal(createdPlan, createdWorkouts);
}

/**
 * Sync a single workout update to the database
 */
export async function syncWorkoutUpdate(
  workout: Workout,
  userId: string,
  planRemoteId: string
): Promise<void> {
  console.log(`[DB] syncWorkoutUpdate: id=${workout.id}, remoteId=${workout.remoteId}, isCompleted=${workout.isCompleted}`);

  // If workout has a remoteId, update it
  if (workout.remoteId) {
    console.log(`[DB] Updating by remoteId: ${workout.remoteId}`);
    await updateWorkout(workout.remoteId, {
      is_completed: workout.isCompleted,
      is_skipped: workout.isSkipped,
      actual_distance: workout.actualDistance || null,
      actual_duration: workout.actualDuration || null,
      notes: workout.notes || null,
      perceived_effort: workout.perceivedEffort || null,
      completed_at: workout.completedAt
        ? new Date(workout.completedAt).toISOString()
        : null,
      version: (workout.version || 0) + 1,
    });
    console.log(`[DB] Successfully updated by remoteId`);
  } else {
    // Try to find by client_id and update, or create new
    console.log(`[DB] Looking up by client_id: ${workout.id}`);
    const existing = await getWorkoutByClientId(workout.id, userId);
    if (existing) {
      console.log(`[DB] Found existing workout: ${existing.id}, updating...`);
      await updateWorkout(existing.id, {
        is_completed: workout.isCompleted,
        is_skipped: workout.isSkipped,
        actual_distance: workout.actualDistance || null,
        actual_duration: workout.actualDuration || null,
        notes: workout.notes || null,
        perceived_effort: workout.perceivedEffort || null,
        completed_at: workout.completedAt
          ? new Date(workout.completedAt).toISOString()
          : null,
        version: (workout.version || 0) + 1,
      });
      console.log(`[DB] Successfully updated by client_id`);
    } else {
      console.log(`[DB] No existing workout found for client_id: ${workout.id}`);
      // If no existing workout found, it should have been created with the plan
      // This shouldn't normally happen
    }
  }
}
