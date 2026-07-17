import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TrainingPlan, UserConfig, PlanId, Workout } from '../types';
import { generatePlan, calculatePlanStats } from '../services/planGenerator';
import { localDateStr, todayLocalStr } from '../utils/dates';
import {
  performInitialSync,
  processSyncQueue,
  queueWorkoutSync,
  getQueue,
  clearQueue,
  SyncResult,
} from '../services/supabase/sync';
import { uploadPlan, updatePlan } from '../services/supabase/database';

interface AppState {
  // State
  plan: TrainingPlan | null;
  userConfig: UserConfig;
  isLoading: boolean;

  // Sync state
  isSyncing: boolean;
  lastSyncAt: number | null;
  syncError: string | null;
  pendingSyncCount: number;

  // Actions
  generateUserPlan: (raceDate: Date, planId: PlanId) => void;
  toggleWorkoutCompletion: (workoutId: string) => void;
  skipWorkout: (workoutId: string, reason?: string) => void;
  updateWorkoutDetails: (
    workoutId: string,
    details: Partial<Pick<Workout, 'actualDistance' | 'actualDuration' | 'notes' | 'perceivedEffort'>>
  ) => void;
  setUnits: (units: 'miles' | 'km') => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  resetApp: () => void;
  setLoading: (loading: boolean) => void;

  // Sync actions
  performSync: (userId: string) => Promise<SyncResult>;
  uploadPlanToCloud: (userId: string) => Promise<void>;
  setPlan: (plan: TrainingPlan) => void;
  setSyncState: (state: Partial<Pick<AppState, 'isSyncing' | 'lastSyncAt' | 'syncError' | 'pendingSyncCount'>>) => void;
}

const DEFAULT_CONFIG: UserConfig = {
  isOnboarded: false,
  units: 'miles',
  theme: 'system',
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      plan: null,
      userConfig: DEFAULT_CONFIG,
      isLoading: true,

      // Sync state
      isSyncing: false,
      lastSyncAt: null,
      syncError: null,
      pendingSyncCount: 0,

      // Generate a new training plan
      generateUserPlan: (raceDate: Date, planId: PlanId) => {
        const newPlan = generatePlan(raceDate, planId);
        // Clear sync queue when generating new plan (old queue items are stale)
        clearQueue().catch(console.error);
        set({
          plan: newPlan,
          userConfig: { ...get().userConfig, isOnboarded: true },
          pendingSyncCount: 0,
        });
      },

      // Toggle workout completion
      toggleWorkoutCompletion: (workoutId: string) => {
        const { plan, pendingSyncCount } = get();
        if (!plan) return;

        let updatedWorkout: Workout | null = null;

        const updatedWeeks = plan.weeks.map(week => ({
          ...week,
          workouts: week.workouts.map(workout => {
            if (workout.id === workoutId) {
              const isCompleted = !workout.isCompleted;
              updatedWorkout = {
                ...workout,
                isCompleted,
                isSkipped: isCompleted ? false : workout.isSkipped,
                completedAt: isCompleted ? Date.now() : undefined,
                updatedAt: Date.now(),
                version: (workout.version || 0) + 1,
              };
              return updatedWorkout;
            }
            return workout;
          }),
        }));

        set({
          plan: { ...plan, weeks: updatedWeeks },
          pendingSyncCount: pendingSyncCount + 1,
        });

        // Queue for sync
        if (updatedWorkout) {
          queueWorkoutSync(updatedWorkout).catch(console.error);
        }
      },

      // Skip a workout
      skipWorkout: (workoutId: string, reason?: string) => {
        const { plan, pendingSyncCount } = get();
        if (!plan) return;

        let updatedWorkout: Workout | null = null;

        const updatedWeeks = plan.weeks.map(week => ({
          ...week,
          workouts: week.workouts.map(workout => {
            if (workout.id === workoutId) {
              updatedWorkout = {
                ...workout,
                isSkipped: true,
                isCompleted: false,
                notes: reason || workout.notes,
                updatedAt: Date.now(),
                version: (workout.version || 0) + 1,
              };
              return updatedWorkout;
            }
            return workout;
          }),
        }));

        set({
          plan: { ...plan, weeks: updatedWeeks },
          pendingSyncCount: pendingSyncCount + 1,
        });

        // Queue for sync
        if (updatedWorkout) {
          queueWorkoutSync(updatedWorkout).catch(console.error);
        }
      },

      // Update workout details (after completion)
      updateWorkoutDetails: (workoutId, details) => {
        const { plan, pendingSyncCount } = get();
        if (!plan) return;

        let updatedWorkout: Workout | null = null;

        const updatedWeeks = plan.weeks.map(week => ({
          ...week,
          workouts: week.workouts.map(workout => {
            if (workout.id === workoutId) {
              updatedWorkout = {
                ...workout,
                ...details,
                updatedAt: Date.now(),
                version: (workout.version || 0) + 1,
              };
              return updatedWorkout;
            }
            return workout;
          }),
        }));

        set({
          plan: { ...plan, weeks: updatedWeeks },
          pendingSyncCount: pendingSyncCount + 1,
        });

        // Queue for sync
        if (updatedWorkout) {
          queueWorkoutSync(updatedWorkout).catch(console.error);
        }
      },

      // Set units preference
      setUnits: (units) => {
        set({ userConfig: { ...get().userConfig, units } });
      },

      // Set theme preference
      setTheme: (theme) => {
        set({ userConfig: { ...get().userConfig, theme } });
      },

      // Reset app (clear all data)
      resetApp: () => {
        // Clear sync queue when resetting (old queue items are stale)
        clearQueue().catch(console.error);
        set({
          plan: null,
          userConfig: DEFAULT_CONFIG,
          pendingSyncCount: 0,
        });
      },

      // Set loading state
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      // Set plan directly (used after sync)
      setPlan: (plan) => {
        set({
          plan,
          userConfig: { ...get().userConfig, isOnboarded: true },
        });
      },

      // Update sync state
      setSyncState: (state) => {
        set(state);
      },

      // Perform sync with cloud
      performSync: async (userId: string) => {
        const { plan, isSyncing } = get();
        if (isSyncing) return { action: 'synced' as const };

        set({ isSyncing: true, syncError: null });

        try {
          // First, perform initial sync to reconcile local and remote
          const result = await performInitialSync(userId, plan);

          if (result.action === 'use_remote' && result.plan) {
            // Using remote plan - clear local queue (it's stale)
            await clearQueue();
            set({
              plan: result.plan,
              userConfig: { ...get().userConfig, isOnboarded: true },
              lastSyncAt: Date.now(),
              pendingSyncCount: 0,
            });
          } else if (result.action === 'upload_local' && result.plan) {
            // Just uploaded local plan - now process any pending workout updates
            // The workouts exist in DB with client_id, so syncWorkoutUpdate can find them
            set({
              plan: result.plan,
              userConfig: { ...get().userConfig, isOnboarded: true },
            });
            if (result.plan.remoteId) {
              await processSyncQueue(userId, result.plan.remoteId);
            }
            await clearQueue();
            set({
              lastSyncAt: Date.now(),
              pendingSyncCount: 0,
            });
          } else if (result.action === 'synced' && result.plan) {
            set({
              plan: result.plan,
              userConfig: { ...get().userConfig, isOnboarded: true },
              lastSyncAt: Date.now(),
            });

            // Get the updated plan state (may have remoteId now after initial sync)
            const updatedPlan = get().plan;

            // Process any pending queue items
            if (updatedPlan?.remoteId) {
              await processSyncQueue(userId, updatedPlan.remoteId);
            }

            // Check queue length after processing
            const queue = await getQueue();
            set({ pendingSyncCount: queue.length });
          } else if (result.action === 'conflict' && result.localPlan) {
            // Local and remote are different plans. Never silently discard
            // training history: the plan with more completed workouts wins
            // (tie goes to local, the device in hand), and the loser is kept
            // in the cloud as 'abandoned' so nothing is ever unrecoverable.
            const countCompleted = (p: TrainingPlan) =>
              p.weeks.flatMap(w => w.workouts).filter(w => w.isCompleted).length;
            const localScore = countCompleted(result.localPlan);
            const remoteScore = result.remotePlan ? countCompleted(result.remotePlan) : 0;

            if (localScore >= remoteScore) {
              console.log(
                `[Sync] Conflict: keeping local plan (${localScore} vs ${remoteScore} completed)`
              );
              // Retire the remote plan, then upload local as the active plan
              if (result.remotePlan?.remoteId) {
                try {
                  await updatePlan(result.remotePlan.remoteId, { status: 'abandoned' });
                } catch (e) {
                  console.error('[Sync] Failed to deactivate old plan:', e);
                }
              }
              const uploadedPlan = await uploadPlan(result.localPlan, userId);
              set({
                plan: uploadedPlan,
                userConfig: { ...get().userConfig, isOnboarded: true },
              });
              if (uploadedPlan.remoteId) {
                await processSyncQueue(userId, uploadedPlan.remoteId);
              }
            } else {
              console.log(
                `[Sync] Conflict: adopting remote plan (${remoteScore} vs ${localScore} completed)`
              );
              // Back up the losing local plan to the cloud before replacing it
              try {
                await uploadPlan({ ...result.localPlan, status: 'abandoned' }, userId);
              } catch (e) {
                console.error('[Sync] Failed to back up local plan:', e);
              }
              set({
                plan: result.remotePlan,
                userConfig: { ...get().userConfig, isOnboarded: true },
              });
            }

            await clearQueue();
            set({
              lastSyncAt: Date.now(),
              pendingSyncCount: 0,
            });
          }

          set({ isSyncing: false });
          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Sync failed';
          set({ isSyncing: false, syncError: errorMessage });
          return { action: 'no_data' as const, error: errorMessage };
        }
      },

      // Upload current plan to cloud
      uploadPlanToCloud: async (userId: string) => {
        const { plan } = get();
        if (!plan) return;

        set({ isSyncing: true, syncError: null });

        try {
          const uploadedPlan = await uploadPlan(plan, userId);
          set({
            plan: uploadedPlan,
            userConfig: { ...get().userConfig, isOnboarded: true },
            isSyncing: false,
            lastSyncAt: Date.now(),
            pendingSyncCount: 0,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Upload failed';
          set({ isSyncing: false, syncError: errorMessage });
          throw error;
        }
      },
    }),
    {
      name: 'marathon-training-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      // Persist only durable state. Transient flags (isSyncing, syncError)
      // used to be serialized too — an app killed mid-sync rehydrated with
      // isSyncing:true and performSync early-returned forever.
      partialize: (state) => ({
        plan: state.plan,
        userConfig: state.userConfig,
        lastSyncAt: state.lastSyncAt,
        pendingSyncCount: state.pendingSyncCount,
      }),
      // Pre-version-1 storage has the same shape for the fields we keep
      migrate: (persisted) => persisted as Partial<AppState>,
      onRehydrateStorage: () => (state) => {
        // After rehydration, set loading to false
        state?.setLoading(false);
      },
    }
  )
);

// Selector hooks for convenience
export const usePlan = () => useAppStore(state => state.plan);
export const useUserConfig = () => useAppStore(state => state.userConfig);
export const useIsOnboarded = () => useAppStore(state => state.userConfig.isOnboarded);
export const useIsLoading = () => useAppStore(state => state.isLoading);

// Get plan stats
export const usePlanStats = () => {
  const plan = useAppStore(state => state.plan);
  if (!plan) return null;
  return calculatePlanStats(plan);
};

// Get today's workout
export const useTodayWorkout = () => {
  const plan = useAppStore(state => state.plan);
  if (!plan) return null;

  const today = todayLocalStr();

  for (const week of plan.weeks) {
    const workout = week.workouts.find(w => w.date === today);
    if (workout) {
      return { workout, week };
    }
  }

  return null;
};

// Get current training week (plan week)
export const useCurrentWeek = () => {
  const plan = useAppStore(state => state.plan);
  if (!plan) return null;

  const today = todayLocalStr();

  for (const week of plan.weeks) {
    if (week.startDate <= today && today <= week.endDate) {
      return week;
    }
  }

  // If we're past the last week, return the last week
  if (plan.weeks.length > 0 && today > plan.weeks[plan.weeks.length - 1].endDate) {
    return plan.weeks[plan.weeks.length - 1];
  }

  // If we're before the first week, return the first week
  return plan.weeks[0] || null;
};

// Get workouts for current CALENDAR week (Sun-Sat)
export const useCalendarWeekWorkouts = () => {
  const plan = useAppStore(state => state.plan);
  if (!plan) return [];

  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday

  // Get start of calendar week (Sunday)
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - dayOfWeek);
  weekStart.setHours(0, 0, 0, 0);

  // Get end of calendar week (Saturday)
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const weekStartStr = localDateStr(weekStart);
  const weekEndStr = localDateStr(weekEnd);

  // Collect all workouts in this calendar week
  const workouts: import('../types').Workout[] = [];
  for (const week of plan.weeks) {
    for (const workout of week.workouts) {
      if (workout.date >= weekStartStr && workout.date <= weekEndStr) {
        workouts.push(workout);
      }
    }
  }

  // Sort by date
  workouts.sort((a, b) => a.date.localeCompare(b.date));
  return workouts;
};

// Sync state selectors
export const useIsSyncing = () => useAppStore(state => state.isSyncing);
export const useLastSyncAt = () => useAppStore(state => state.lastSyncAt);
export const useSyncError = () => useAppStore(state => state.syncError);
export const usePendingSyncCount = () => useAppStore(state => state.pendingSyncCount);
