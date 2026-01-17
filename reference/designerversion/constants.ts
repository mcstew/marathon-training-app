import { PlanLevel, PlanMetadata, WorkoutType } from './types';

export const PLANS_METADATA: PlanMetadata[] = [
  {
    id: PlanLevel.Novice1,
    name: 'Novice 1',
    description: 'The most popular plan for first-timers.',
    runsPerWeek: 4,
    peakMileage: 40,
    bestFor: 'First-timers, completion focus',
  },
  {
    id: PlanLevel.Novice2,
    name: 'Novice 2',
    description: 'For beginners who have run a bit before.',
    runsPerWeek: 4,
    peakMileage: 40,
    bestFor: 'First-timers wanting pace work',
  },
  {
    id: PlanLevel.Intermediate1,
    name: 'Intermediate 1',
    description: 'Stepping up mileage and intensity.',
    runsPerWeek: 5,
    peakMileage: 45,
    bestFor: 'Some experience, ready for more',
  },
  {
    id: PlanLevel.Intermediate2,
    name: 'Intermediate 2',
    description: 'Higher volume for time improvements.',
    runsPerWeek: 5,
    peakMileage: 50,
    bestFor: 'Experienced, time goal',
  },
  {
    id: PlanLevel.Advanced1,
    name: 'Advanced 1',
    description: 'Includes speedwork and high mileage.',
    runsPerWeek: 6,
    peakMileage: 55,
    bestFor: 'Serious runners',
  },
];

export const WORKOUT_COLORS: Record<WorkoutType, string> = {
  [WorkoutType.Rest]: 'bg-gray-200 text-gray-500',
  [WorkoutType.EasyRun]: 'bg-green-100 text-green-700 border-green-200',
  [WorkoutType.LongRun]: 'bg-blue-100 text-blue-700 border-blue-200',
  [WorkoutType.Tempo]: 'bg-amber-100 text-amber-700 border-amber-200',
  [WorkoutType.Speed]: 'bg-red-100 text-red-700 border-red-200',
  [WorkoutType.CrossTrain]: 'bg-purple-100 text-purple-700 border-purple-200',
  [WorkoutType.Race]: 'bg-yellow-100 text-yellow-800 border-yellow-300 ring-2 ring-yellow-400',
};

export const WORKOUT_BG_COLORS: Record<WorkoutType, string> = {
  [WorkoutType.Rest]: '#e5e7eb',
  [WorkoutType.EasyRun]: '#22c55e',
  [WorkoutType.LongRun]: '#3b82f6',
  [WorkoutType.Tempo]: '#f59e0b',
  [WorkoutType.Speed]: '#ef4444',
  [WorkoutType.CrossTrain]: '#8b5cf6',
  [WorkoutType.Race]: '#eab308',
};
