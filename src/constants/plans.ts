import { PlanMetadata, PlanId } from '../types';

// Plan metadata for the selection screen
export const PLANS: PlanMetadata[] = [
  {
    id: 'novice1',
    name: 'Novice 1',
    description: 'The most popular plan for first-time marathoners.',
    runsPerWeek: 4,
    peakMileage: 40,
    bestFor: 'First-timers, completion focus',
  },
  {
    id: 'novice2',
    name: 'Novice 2',
    description: 'For beginners who want to include pace work.',
    runsPerWeek: 4,
    peakMileage: 40,
    bestFor: 'First-timers wanting pace work',
  },
  {
    id: 'intermediate1',
    name: 'Intermediate 1',
    description: 'Stepping up mileage with cross training.',
    runsPerWeek: 5,
    peakMileage: 45,
    bestFor: 'Some experience, ready for more',
  },
  {
    id: 'intermediate2',
    name: 'Intermediate 2',
    description: 'Higher volume for time improvements.',
    runsPerWeek: 5,
    peakMileage: 50,
    bestFor: 'Experienced runners with a time goal',
  },
  {
    id: 'advanced1',
    name: 'Advanced 1',
    description: 'Includes speedwork, hills, and tempo runs.',
    runsPerWeek: 6,
    peakMileage: 55,
    bestFor: 'Serious runners seeking improvement',
  },
  {
    id: 'advanced2',
    name: 'Advanced 2',
    description: 'Marathon pace focus with high volume.',
    runsPerWeek: 6,
    peakMileage: 60,
    bestFor: 'Competitive runners, PR focus',
  },
];

// Get plan metadata by ID
export function getPlanById(id: PlanId): PlanMetadata | undefined {
  return PLANS.find(p => p.id === id);
}
