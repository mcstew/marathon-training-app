import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TrainingPlan, UserConfig, PlanId, Workout } from '../types';
import { generatePlan, calculatePlanStats } from '../services/planGenerator';

interface AppState {
  // State
  plan: TrainingPlan | null;
  userConfig: UserConfig;
  isLoading: boolean;

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

      // Generate a new training plan
      generateUserPlan: (raceDate: Date, planId: PlanId) => {
        const newPlan = generatePlan(raceDate, planId);
        set({
          plan: newPlan,
          userConfig: { ...get().userConfig, isOnboarded: true },
        });
      },

      // Toggle workout completion
      toggleWorkoutCompletion: (workoutId: string) => {
        const { plan } = get();
        if (!plan) return;

        const updatedWeeks = plan.weeks.map(week => ({
          ...week,
          workouts: week.workouts.map(workout => {
            if (workout.id === workoutId) {
              const isCompleted = !workout.isCompleted;
              return {
                ...workout,
                isCompleted,
                isSkipped: isCompleted ? false : workout.isSkipped,
              };
            }
            return workout;
          }),
        }));

        set({ plan: { ...plan, weeks: updatedWeeks } });
      },

      // Skip a workout
      skipWorkout: (workoutId: string, reason?: string) => {
        const { plan } = get();
        if (!plan) return;

        const updatedWeeks = plan.weeks.map(week => ({
          ...week,
          workouts: week.workouts.map(workout => {
            if (workout.id === workoutId) {
              return {
                ...workout,
                isSkipped: true,
                isCompleted: false,
                notes: reason || workout.notes,
              };
            }
            return workout;
          }),
        }));

        set({ plan: { ...plan, weeks: updatedWeeks } });
      },

      // Update workout details (after completion)
      updateWorkoutDetails: (workoutId, details) => {
        const { plan } = get();
        if (!plan) return;

        const updatedWeeks = plan.weeks.map(week => ({
          ...week,
          workouts: week.workouts.map(workout => {
            if (workout.id === workoutId) {
              return { ...workout, ...details };
            }
            return workout;
          }),
        }));

        set({ plan: { ...plan, weeks: updatedWeeks } });
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
        set({
          plan: null,
          userConfig: DEFAULT_CONFIG,
        });
      },

      // Set loading state
      setLoading: (loading) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'marathon-training-storage',
      storage: createJSONStorage(() => AsyncStorage),
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

  const today = new Date().toISOString().split('T')[0];

  for (const week of plan.weeks) {
    const workout = week.workouts.find(w => w.date === today);
    if (workout) {
      return { workout, week };
    }
  }

  return null;
};

// Get current week
export const useCurrentWeek = () => {
  const plan = useAppStore(state => state.plan);
  if (!plan) return null;

  const today = new Date().toISOString().split('T')[0];

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
