import AsyncStorage from '@react-native-async-storage/async-storage';
import { TrainingPlan, Workout } from '../../types';
import {
  getActivePlan,
  uploadPlan,
  dbPlanToLocal,
  syncWorkoutUpdate,
  updatePlan,
} from './database';

const SYNC_QUEUE_KEY = '@marathon_sync_queue';
const LAST_SYNC_KEY = '@marathon_last_sync';

// ============================================
// Sync Queue Types
// ============================================

export interface SyncQueueItem {
  id: string;
  entityType: 'workout' | 'plan';
  entityId: string;
  operation: 'update' | 'create';
  payload: Record<string, unknown>;
  createdAt: number;
  retryCount: number;
}

export interface SyncResult {
  action: 'use_remote' | 'upload_local' | 'conflict' | 'no_data' | 'synced';
  plan?: TrainingPlan;
  localPlan?: TrainingPlan;
  remotePlan?: TrainingPlan;
  error?: string;
}

// ============================================
// Sync Queue Operations
// ============================================

export async function getQueue(): Promise<SyncQueueItem[]> {
  try {
    const data = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveQueue(queue: SyncQueueItem[]): Promise<void> {
  await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

export async function addToQueue(item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'retryCount'>): Promise<void> {
  const queue = await getQueue();

  // Check if there's already a pending item for this entity
  const existingIndex = queue.findIndex(
    (q) => q.entityType === item.entityType && q.entityId === item.entityId
  );

  const newItem: SyncQueueItem = {
    ...item,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    retryCount: 0,
  };

  if (existingIndex >= 0) {
    // Replace existing item with new one (more recent data)
    queue[existingIndex] = newItem;
  } else {
    queue.push(newItem);
  }

  await saveQueue(queue);
}

export async function removeFromQueue(itemId: string): Promise<void> {
  const queue = await getQueue();
  const filtered = queue.filter((q) => q.id !== itemId);
  await saveQueue(filtered);
}

export async function clearQueue(): Promise<void> {
  await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
}

// ============================================
// Last Sync Tracking
// ============================================

export async function getLastSync(): Promise<number | null> {
  try {
    const data = await AsyncStorage.getItem(LAST_SYNC_KEY);
    return data ? parseInt(data, 10) : null;
  } catch {
    return null;
  }
}

export async function setLastSync(timestamp: number): Promise<void> {
  await AsyncStorage.setItem(LAST_SYNC_KEY, timestamp.toString());
}

// ============================================
// Main Sync Operations
// ============================================

/**
 * Perform initial sync when user logs in
 * Determines whether to use local or remote data
 */
export async function performInitialSync(
  userId: string,
  localPlan: TrainingPlan | null
): Promise<SyncResult> {
  try {
    // Get remote plan
    const remoteData = await getActivePlan(userId);

    // Case 1: No local plan, no remote plan
    if (!localPlan && !remoteData) {
      return { action: 'no_data' };
    }

    // Case 2: No local plan, has remote plan
    if (!localPlan && remoteData) {
      const plan = dbPlanToLocal(remoteData.plan, remoteData.workouts);
      await setLastSync(Date.now());
      return { action: 'use_remote', plan };
    }

    // Case 3: Has local plan, no remote plan
    if (localPlan && !remoteData) {
      // Upload local plan to cloud
      const uploadedPlan = await uploadPlan(localPlan, userId);
      await setLastSync(Date.now());
      return { action: 'upload_local', plan: uploadedPlan };
    }

    // Case 4: Both exist - need to determine which to use
    if (localPlan && remoteData) {
      const remotePlan = dbPlanToLocal(remoteData.plan, remoteData.workouts);

      // If it's the same plan (same planId and raceDate), merge completion status
      if (
        localPlan.planId === remotePlan.planId &&
        localPlan.raceDate === remotePlan.raceDate
      ) {
        // Use remote as base, apply local completions if more recent
        const mergedPlan = mergePlans(localPlan, remotePlan);
        await setLastSync(Date.now());
        return { action: 'synced', plan: mergedPlan };
      }

      // Different plans - user needs to choose
      return {
        action: 'conflict',
        localPlan,
        remotePlan,
      };
    }

    return { action: 'no_data' };
  } catch (error) {
    console.error('Initial sync error:', error);
    return {
      action: 'no_data',
      error: error instanceof Error ? error.message : 'Sync failed',
    };
  }
}

/**
 * Merge two plans, preferring the most recent completion data
 */
function mergePlans(local: TrainingPlan, remote: TrainingPlan): TrainingPlan {
  const mergedWeeks = remote.weeks.map((remoteWeek) => {
    const localWeek = local.weeks.find((w) => w.weekNumber === remoteWeek.weekNumber);
    if (!localWeek) return remoteWeek;

    const mergedWorkouts = remoteWeek.workouts.map((remoteWorkout) => {
      const localWorkout = localWeek.workouts.find(
        (w) => w.date === remoteWorkout.date && w.title === remoteWorkout.title
      );

      if (!localWorkout) return remoteWorkout;

      // Use whichever has more recent update
      const localTime = localWorkout.updatedAt || 0;
      const remoteTime = remoteWorkout.updatedAt || 0;

      if (localTime > remoteTime) {
        return {
          ...remoteWorkout,
          isCompleted: localWorkout.isCompleted,
          isSkipped: localWorkout.isSkipped,
          actualDistance: localWorkout.actualDistance,
          actualDuration: localWorkout.actualDuration,
          notes: localWorkout.notes,
          perceivedEffort: localWorkout.perceivedEffort,
          completedAt: localWorkout.completedAt,
          updatedAt: localWorkout.updatedAt,
        };
      }

      return remoteWorkout;
    });

    return {
      ...remoteWeek,
      workouts: mergedWorkouts,
    };
  });

  return {
    ...remote,
    weeks: mergedWeeks,
  };
}

/**
 * Process pending items in the sync queue
 */
export async function processSyncQueue(
  userId: string,
  planRemoteId: string | undefined
): Promise<{ processed: number; failed: number }> {
  const queue = await getQueue();
  let processed = 0;
  let failed = 0;

  for (const item of queue) {
    try {
      if (item.entityType === 'workout' && planRemoteId) {
        const workout = item.payload as unknown as Workout;
        console.log(`[Sync] Processing workout: ${workout.id}, remoteId: ${workout.remoteId}, isCompleted: ${workout.isCompleted}`);
        await syncWorkoutUpdate(workout, userId, planRemoteId);
        await removeFromQueue(item.id);
        processed++;
        console.log(`[Sync] Successfully synced workout: ${workout.id}`);
      } else if (item.entityType === 'plan') {
        // Handle plan updates if needed
        await removeFromQueue(item.id);
        processed++;
      } else if (!planRemoteId) {
        console.log(`[Sync] Skipping item ${item.id} - no planRemoteId`);
      }
    } catch (error) {
      console.error(`[Sync] Failed to sync item ${item.id}:`, error);
      // Increment retry count
      const updatedQueue = await getQueue();
      const itemIndex = updatedQueue.findIndex((q) => q.id === item.id);
      if (itemIndex >= 0) {
        updatedQueue[itemIndex].retryCount++;
        // Remove if too many retries
        if (updatedQueue[itemIndex].retryCount >= 3) {
          console.log(`[Sync] Removing item ${item.id} after 3 failed retries`);
          updatedQueue.splice(itemIndex, 1);
        }
        await saveQueue(updatedQueue);
      }
      failed++;
    }
  }

  if (processed > 0) {
    await setLastSync(Date.now());
  }

  return { processed, failed };
}

/**
 * Queue a workout update for sync
 */
export async function queueWorkoutSync(workout: Workout): Promise<void> {
  await addToQueue({
    entityType: 'workout',
    entityId: workout.id,
    operation: 'update',
    payload: workout as unknown as Record<string, unknown>,
  });
}

/**
 * Mark plan as synced
 */
export async function markPlanSynced(planId: string): Promise<void> {
  await updatePlan(planId, {
    synced_at: new Date().toISOString(),
  });
  await setLastSync(Date.now());
}
