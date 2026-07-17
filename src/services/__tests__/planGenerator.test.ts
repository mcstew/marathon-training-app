import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { differenceInCalendarDays } from 'date-fns';
import {
  generatePlan,
  calculatePlanStats,
  parseDateString,
} from '../planGenerator';
import { PlanId } from '../../types';

const ALL_PLANS: PlanId[] = [
  'novice1',
  'novice2',
  'intermediate1',
  'intermediate2',
  'advanced1',
  'advanced2',
];

describe('parseDateString', () => {
  it('parses YYYY-MM-DD to local noon (no day drift)', () => {
    const d = parseDateString('2026-11-22');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(10);
    expect(d.getDate()).toBe(22);
    expect(d.getHours()).toBe(12);
  });
});

describe('generatePlan', () => {
  // Race on Sunday 2026-11-22; 18 weeks x 7 days = 126 days ending on race day.
  const raceDate = new Date(2026, 10, 22);

  it.each(ALL_PLANS)('%s: 18 weeks of 7 workouts ending on race day', planId => {
    const plan = generatePlan(raceDate, planId);
    expect(plan.weeks).toHaveLength(18);
    for (const week of plan.weeks) {
      expect(week.workouts).toHaveLength(7);
    }
    const lastWeek = plan.weeks[17];
    const raceWorkout = lastWeek.workouts[lastWeek.workouts.length - 1];
    expect(raceWorkout.date).toBe('2026-11-22');
    expect(raceWorkout.type).toBe('race');
    expect(raceWorkout.title).toBe('Marathon');
  });

  it('starts 125 days before race day with contiguous dates', () => {
    const plan = generatePlan(raceDate, 'novice1');
    expect(plan.startDate).toBe('2026-07-20');
    expect(plan.raceDate).toBe('2026-11-22');

    const allDates = plan.weeks.flatMap(w => w.workouts.map(wo => wo.date));
    expect(allDates).toHaveLength(126);
    for (let i = 1; i < allDates.length; i++) {
      // Calendar-day steps (a raw ms diff would trip over DST transitions)
      const prev = parseDateString(allDates[i - 1]);
      const cur = parseDateString(allDates[i]);
      expect(differenceInCalendarDays(cur, prev)).toBe(1);
    }
  });

  it('week numbering is 1..18 in order', () => {
    const plan = generatePlan(raceDate, 'intermediate1');
    expect(plan.weeks.map(w => w.weekNumber)).toEqual(
      Array.from({ length: 18 }, (_, i) => i + 1)
    );
  });
});

describe('calculatePlanStats', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('fresh plan before start: zero progress, week 1, correct countdown', () => {
    vi.setSystemTime(new Date(2026, 6, 17, 12, 0, 0)); // Jul 17
    const plan = generatePlan(new Date(2026, 10, 22), 'novice1');
    const stats = calculatePlanStats(plan);

    expect(stats.completedWorkouts).toBe(0);
    expect(stats.completionRate).toBe(0);
    expect(stats.currentStreak).toBe(0);
    expect(stats.currentWeek).toBe(1);
    expect(stats.daysUntilRace).toBe(128);
  });

  it('short-timeline plan: pre-dated weeks are not counted as missed', () => {
    vi.setSystemTime(new Date(2026, 6, 17, 12, 0, 0)); // Jul 17
    // Race only ~8 weeks away — weeks 1-9 of the 18-week layout are pre-dated
    const plan = generatePlan(new Date(2026, 8, 13), 'novice1'); // Sep 13
    const stats = calculatePlanStats(plan);

    // Pre-dated workouts must not tank the completion rate or streaks
    expect(stats.completionRate).toBe(0);
    expect(stats.currentStreak).toBe(0);
    expect(stats.skippedWorkouts).toBe(0);

    // Totals only include workouts the user could actually do
    const runnable = plan.weeks
      .flatMap(w => w.workouts)
      .filter(w => w.type !== 'rest' && w.type !== 'cross');
    const doable = runnable.filter(w => w.date >= '2026-07-17');
    expect(stats.totalWorkouts).toBe(doable.length);
    expect(stats.totalWorkouts).toBeLessThan(runnable.length);
  });

  it('short-timeline plan: backfilled pre-dated workouts still count', () => {
    vi.setSystemTime(new Date(2026, 6, 17, 12, 0, 0));
    const plan = generatePlan(new Date(2026, 8, 13), 'novice1');
    const runnable = plan.weeks
      .flatMap(w => w.workouts)
      .filter(w => w.type !== 'rest' && w.type !== 'cross');
    const preDated = runnable.filter(w => w.date < '2026-07-17');
    preDated[0].isCompleted = true;

    const stats = calculatePlanStats(plan);
    expect(stats.completedWorkouts).toBe(1);
    expect(stats.completionRate).toBe(100); // 1 of 1 tracked past workouts
  });

  it('counts completions and streaks', () => {
    vi.setSystemTime(new Date(2026, 6, 17, 12, 0, 0));
    const plan = generatePlan(new Date(2026, 10, 22), 'novice1');

    // Complete the first two runnable workouts
    const runnable = plan.weeks
      .flatMap(w => w.workouts)
      .filter(w => w.type !== 'rest' && w.type !== 'cross');
    runnable[0].isCompleted = true;
    runnable[1].isCompleted = true;

    const stats = calculatePlanStats(plan);
    expect(stats.completedWorkouts).toBe(2);
    expect(stats.currentStreak).toBe(2);
    expect(stats.longestStreak).toBe(2);
  });
});
