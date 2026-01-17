import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TrainingPlan, UserConfig, PlanLevel, Workout } from '../types';
import { generatePlan } from '../services/planGenerator';

interface AppContextType {
  plan: TrainingPlan | null;
  userConfig: UserConfig;
  generateUserPlan: (raceDate: Date, level: PlanLevel) => void;
  toggleWorkoutCompletion: (weekIndex: number, workoutIndex: number) => void;
  skipWorkout: (weekIndex: number, workoutIndex: number) => void;
  resetApp: () => void;
}

const DEFAULT_CONFIG: UserConfig = {
  isOnboarded: false,
  name: '',
  units: 'miles',
  theme: 'light',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [userConfig, setUserConfig] = useState<UserConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const storedPlan = localStorage.getItem('marathon_plan');
      const storedConfig = localStorage.getItem('marathon_config');

      if (storedPlan) setPlan(JSON.parse(storedPlan));
      if (storedConfig) setUserConfig(JSON.parse(storedConfig));
    } catch (e) {
      console.error("Failed to load local data", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (!loading) {
      if (plan) localStorage.setItem('marathon_plan', JSON.stringify(plan));
      localStorage.setItem('marathon_config', JSON.stringify(userConfig));
    }
  }, [plan, userConfig, loading]);

  const generateUserPlan = (raceDate: Date, level: PlanLevel) => {
    const newPlan = generatePlan(raceDate, level);
    setPlan(newPlan);
    setUserConfig(prev => ({ ...prev, isOnboarded: true }));
  };

  const toggleWorkoutCompletion = (weekIndex: number, workoutIndex: number) => {
    if (!plan) return;
    const newPlan = { ...plan };
    const workout = newPlan.weeks[weekIndex].workouts[workoutIndex];
    
    // Toggle
    workout.isCompleted = !workout.isCompleted;
    if (workout.isCompleted) workout.skipped = false; // Cannot be skipped if completed
    
    setPlan(newPlan);
  };

  const skipWorkout = (weekIndex: number, workoutIndex: number) => {
    if (!plan) return;
    const newPlan = { ...plan };
    const workout = newPlan.weeks[weekIndex].workouts[workoutIndex];
    
    workout.skipped = true;
    workout.isCompleted = false;
    
    setPlan(newPlan);
  };

  const resetApp = () => {
    localStorage.clear();
    setPlan(null);
    setUserConfig(DEFAULT_CONFIG);
  };

  return (
    <AppContext.Provider value={{ plan, userConfig, generateUserPlan, toggleWorkoutCompletion, skipWorkout, resetApp }}>
      {!loading && children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};