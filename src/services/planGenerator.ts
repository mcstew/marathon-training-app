import { format, subDays, addDays, differenceInDays } from 'date-fns';
import { TrainingPlan, TrainingWeek, Workout, PlanId, WorkoutType } from '../types';

const PLAN_DURATION_WEEKS = 18;

// Parse a date string (YYYY-MM-DD) safely without timezone shifts
// This creates a date at noon local time to avoid any day boundary issues
export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

// Generate a unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Get the training schedule for a plan
function getTrainingSchedule(planId: PlanId): string[][] {
  switch (planId) {
    case 'novice1':
      return [
        ['Rest', '3 m run', '3 m run', '3 m run', 'Rest', '6 m run', 'Cross'],
        ['Rest', '3 m run', '3 m run', '3 m run', 'Rest', '9 m run', 'Cross'],
        ['Rest', '3 m run', '4 m run', '3 m run', 'Rest', '11 m run', 'Cross'],
        ['Rest', '3 m run', '4 m run', '3 m run', 'Rest', '8 m run', 'Cross'],
        ['Rest', '3 m run', '5 m run', '3 m run', 'Rest', '12 m run', 'Cross'],
        ['Rest', '3 m run', '5 m run', '3 m run', 'Rest', '9 m run', 'Cross'],
        ['Rest', '4 m run', '5 m run', '4 m run', 'Rest', '14 m run', 'Cross'],
        ['Rest', '4 m run', '5 m run', '4 m run', 'Rest', '10 m run', 'Cross'],
        ['Rest', '4 m run', '6 m run', '4 m run', 'Rest', '16 m run', 'Cross'],
        ['Rest', '4 m run', '6 m run', '4 m run', 'Rest', '12 m run', 'Cross'],
        ['Rest', '5 m run', '6 m run', '5 m run', 'Rest', '18 m run', 'Cross'],
        ['Rest', '5 m run', '6 m run', '5 m run', 'Rest', '14 m run', 'Cross'],
        ['Rest', '5 m run', '7 m run', '5 m run', 'Rest', '20 m run', 'Cross'],
        ['Rest', '5 m run', '7 m run', '5 m run', 'Rest', '12 m run', 'Cross'],
        ['Rest', '5 m run', '8 m run', '5 m run', 'Rest', '20 m run', 'Cross'],
        ['Rest', '5 m run', '8 m run', '5 m run', 'Rest', '12 m run', 'Cross'],
        ['Rest', '4 m run', '6 m run', '4 m run', 'Rest', '8 m run', 'Cross'],
        ['Rest', '3 m run', '4 m run', '2 m run', 'Rest', 'Rest', 'Marathon'],
      ];
    case 'novice2':
      return [
        ['Rest', '3 m run', '5 m pace', '3 m run', 'Rest', '8 m run', 'Cross'],
        ['Rest', '3 m run', '5 m run', '3 m run', 'Rest', '9 m run', 'Cross'],
        ['Rest', '3 m run', '5 m pace', '3 m run', 'Rest', '6 m run', 'Cross'],
        ['Rest', '3 m run', '6 m pace', '3 m run', 'Rest', '11 m run', 'Cross'],
        ['Rest', '3 m run', '6 m run', '3 m run', 'Rest', '12 m run', 'Cross'],
        ['Rest', '3 m run', '6 m pace', '3 m run', 'Rest', '9 m run', 'Cross'],
        ['Rest', '4 m run', '7 m pace', '4 m run', 'Rest', '14 m run', 'Cross'],
        ['Rest', '4 m run', '7 m run', '4 m run', 'Rest', '15 m run', 'Cross'],
        ['Rest', '4 m run', '7 m pace', '4 m run', 'Rest', 'Rest', 'Half Marathon'],
        ['Rest', '4 m run', '8 m pace', '4 m run', 'Rest', '17 m run', 'Cross'],
        ['Rest', '5 m run', '8 m run', '5 m run', 'Rest', '18 m run', 'Cross'],
        ['Rest', '5 m run', '8 m pace', '5 m run', 'Rest', '13 m run', 'Cross'],
        ['Rest', '5 m run', '5 m pace', '5 m run', 'Rest', '19 m run', 'Cross'],
        ['Rest', '5 m run', '8 m run', '5 m run', 'Rest', '12 m run', 'Cross'],
        ['Rest', '5 m run', '5 m pace', '5 m run', 'Rest', '20 m run', 'Cross'],
        ['Rest', '5 m run', '4 m pace', '5 m run', 'Rest', '12 m run', 'Cross'],
        ['Rest', '4 m run', '3 m run', '4 m run', 'Rest', '8 m run', 'Cross'],
        ['Rest', '3 m run', '2 m run', 'Rest', 'Rest', '2 m run', 'Marathon'],
      ];
    case 'intermediate1':
      return [
        ['Cross', '3 m run', '5 m run', '3 m run', 'Rest', '5 m pace', '8 m run'],
        ['Cross', '3 m run', '5 m run', '3 m run', 'Rest', '5 m run', '9 m run'],
        ['Cross', '3 m run', '5 m run', '3 m run', 'Rest', '5 m pace', '6 m run'],
        ['Cross', '3 m run', '6 m run', '3 m run', 'Rest', '6 m pace', '11 m run'],
        ['Cross', '3 m run', '6 m run', '3 m run', 'Rest', '6 m run', '12 m run'],
        ['Cross', '3 m run', '5 m run', '3 m run', 'Rest', '6 m pace', '9 m run'],
        ['Cross', '4 m run', '7 m run', '4 m run', 'Rest', '7 m pace', '14 m run'],
        ['Cross', '4 m run', '7 m run', '4 m run', 'Rest', '7 m run', '15 m run'],
        ['Cross', '4 m run', '5 m run', '4 m run', 'Rest', 'Rest', 'Half Marathon'],
        ['Cross', '4 m run', '8 m run', '4 m run', 'Rest', '8 m pace', '17 m run'],
        ['Cross', '5 m run', '8 m run', '5 m run', 'Rest', '8 m run', '18 m run'],
        ['Cross', '5 m run', '5 m run', '5 m run', 'Rest', '8 m pace', '13 m run'],
        ['Cross', '5 m run', '8 m run', '5 m run', 'Rest', '5 m pace', '20 m run'],
        ['Cross', '5 m run', '5 m run', '5 m run', 'Rest', '8 m run', '12 m run'],
        ['Cross', '5 m run', '8 m run', '5 m run', 'Rest', '5 m pace', '20 m run'],
        ['Cross', '5 m run', '6 m run', '5 m run', 'Rest', '4 m pace', '12 m run'],
        ['Cross', '4 m run', '5 m run', '4 m run', 'Rest', '3 m run', '8 m run'],
        ['Cross', '3 m run', '4 m run', 'Rest', 'Rest', '2 m run', 'Marathon'],
      ];
    case 'intermediate2':
      return [
        ['Cross', '3 mi run', '5 mi run', '3 mi run', 'Rest', '5 mi pace', '10'],
        ['Cross', '3 mi run', '5 mi run', '3 mi run', 'Rest', '5 mi run', '11'],
        ['Cross', '3 mi run', '6 mi run', '3 mi run', 'Rest', '6 mi pace', '8'],
        ['Cross', '3 mi run', '6 mi run', '3 mi run', 'Rest', '6 mi pace', '13'],
        ['Cross', '3 mi run', '7 mi run', '3 mi run', 'Rest', '7 mi run', '14'],
        ['Cross', '3 mi run', '7 mi run', '3 mi run', 'Rest', '7 mi pace', '10'],
        ['Cross', '4 mi run', '8 mi run', '4 mi run', 'Rest', '8 mi pace', '16'],
        ['Cross', '4 mi run', '8 mi run', '4 mi run', 'Rest', '8 mi run', '17'],
        ['Cross', '4 mi run', '9 mi run', '4 mi run', 'Rest', 'Rest', 'Half Marathon'],
        ['Cross', '4 mi run', '9 mi run', '4 mi run', 'Rest', '9 mi pace', '19'],
        ['Cross', '5 mi run', '10 mi run', '5 mi run', 'Rest', '10 mi run', '20'],
        ['Cross', '5 mi run', '6 mi run', '5 mi run', 'Rest', '6 mi pace', '12'],
        ['Cross', '5 mi run', '10 mi run', '5 mi run', 'Rest', '10 mi pace', '20'],
        ['Cross', '5 mi run', '6 mi run', '5 mi run', 'Rest', '6 mi run', '12'],
        ['Cross', '5 mi run', '10 mi run', '5 mi run', 'Rest', '10 mi pace', '20'],
        ['Cross', '5 mi run', '8 mi run', '5 mi run', 'Rest', '4 mi pace', '12'],
        ['Cross', '4 mi run', '6 mi run', '4 mi run', 'Rest', '4 mi run', '8'],
        ['Cross', '3 mi run', '4 mi run', 'Rest', 'Rest', '2 mi run', 'Marathon'],
      ];
    case 'advanced1':
      return [
        ['3 mi run', '5 mi run', '3 mi run', '3 x hill', 'Rest', '5 mi pace', '10'],
        ['3 mi run', '5 mi run', '3 mi run', '30 tempo', 'Rest', '5 mi run', '11'],
        ['3 mi run', '6 mi run', '3 mi run', '4 x 800', 'Rest', '6 mi pace', '8'],
        ['3 mi run', '6 mi run', '3 mi run', '4 x hill', 'Rest', '6 mi pace', '13'],
        ['3 mi run', '7 mi run', '3 mi run', '35 tempo', 'Rest', '7 mi run', '14'],
        ['3 mi run', '7 mi run', '3 mi run', '5 x 800', 'Rest', '7 mi pace', '10'],
        ['3 mi run', '8 mi run', '4 mi run', '5 x hill', 'Rest', '8 mi pace', '16'],
        ['3 mi run', '8 mi run', '4 mi run', '40 tempo', 'Rest', '8 mi run', '17'],
        ['3 mi run', '9 mi run', '4 mi run', '6 x 800', 'Rest', 'Rest', 'Half Marathon'],
        ['3 mi run', '9 mi run', '4 mi run', '6 x hill', 'Rest', '9 mi pace', '19'],
        ['4 mi run', '10 mi run', '5 mi run', '45 tempo', 'Rest', '10 mi run', '20'],
        ['4 mi run', '6 mi run', '5 mi run', '7 x 800', 'Rest', '6 mi pace', '12'],
        ['4 mi run', '10 mi run', '5 mi run', '7 x hill', 'Rest', '10 mi pace', '20'],
        ['5 mi run', '6 mi run', '5 mi run', '45 tempo', 'Rest', '6 mi run', '12'],
        ['5 mi run', '10 mi run', '5 mi run', '8 x 800', 'Rest', '10 mi pace', '20'],
        ['5 mi run', '8 mi run', '5 mi run', '6 x hill', 'Rest', '4 mi pace', '12'],
        ['4 mi run', '6 mi run', '4 mi run', '30 tempo', 'Rest', '4 mi run', '8'],
        ['3 mi run', '4 x 400', '2 mi run', 'Rest', 'Rest', '2 mi run', 'Marathon'],
      ];
    case 'advanced2':
      return [
        ['3 mi run', '5 mi run', '3 mi run', '3 x hill', 'Rest', '5 m @ MP', '10'],
        ['3 mi run', '5 mi run', '3 mi run', '30 tempo', 'Rest', 'Rest', '10 mi w/4 @ MP'],
        ['3 mi run', '6 mi run', '3 mi run', '4 x 800', 'Rest', '6 m @ MP', '8'],
        ['3 mi run', '6 mi run', '3 mi run', '4 x hill', 'Rest', 'Rest', '13 mi w/6 @ MP'],
        ['3 mi run', '7 mi run', '3 mi run', '35 tempo', 'Rest', '7 m @ MP', '14'],
        ['3 mi run', '7 mi run', '3 mi run', '5 x 800', 'Rest', 'Rest', '10 mi w/7 @ MP'],
        ['3 mi run', '8 mi run', '4 mi run', '5 x hill', 'Rest', '8 m @ MP', '16'],
        ['3 mi run', '8 mi run', '4 mi run', '40 tempo', 'Rest', 'Rest', '17 mi w/8 @ MP'],
        ['3 mi run', '9 mi run', '4 mi run', '6 x 800', 'Rest', 'Rest', 'Half Marathon'],
        ['3 mi run', '9 mi run', '4 mi run', '6 x hill', 'Rest', '9 m @ MP', '19'],
        ['4 mi run', '10 mi run', '5 mi run', '45 tempo', 'Rest', 'Rest', '20 mi w/10 @ MP'],
        ['4 mi run', '6 mi run', '5 mi run', '7 x 800', 'Rest', '6 m @ MP', '12'],
        ['4 mi run', '10 mi run', '5 mi run', '7 x hill', 'Rest', 'Rest', '20 mi w/12 @ MP'],
        ['5 mi run', '6 mi run', '5 mi run', '45 tempo', 'Rest', '6 m @ MP', '12'],
        ['5 mi run', '10 mi run', '5 mi run', '8 x 800', 'Rest', 'Rest', '20 mi w/15 @ MP'],
        ['5 mi run', '8 mi run', '5 mi run', '6 x hill', 'Rest', '4 m @ MP', '12'],
        ['4 mi run', '6 mi run', '4 mi run', '30 tempo', 'Rest', '4 m @ MP', '8'],
        ['3 mi run', '4 x 400', '2 mi run', 'Rest', 'Rest', '2 mi run', 'Marathon'],
      ];
    default:
      return [];
  }
}

// Parse workout text and create a Workout object
function parseWorkout(text: string, dateStr: string): Workout | null {
  if (!text) return null;

  const id = generateId();
  const baseWorkout = {
    id,
    date: dateStr,
    unit: 'mi' as const,
    isCompleted: false,
    isSkipped: false,
  };

  // Rest day
  if (text.includes('Rest')) {
    return {
      ...baseWorkout,
      title: 'Rest',
      description: 'Rest and recover. Your body builds strength during rest.',
      type: 'rest',
    };
  }

  // Cross training
  if (text.includes('Cross')) {
    return {
      ...baseWorkout,
      title: 'Cross Train',
      description: 'Low-impact cardio: cycling, swimming, elliptical, or yoga.',
      type: 'cross',
    };
  }

  // Marathon race
  if (text === 'Marathon') {
    return {
      ...baseWorkout,
      title: 'Marathon',
      description: 'Race Day! Trust your training and enjoy the journey.',
      type: 'race',
      distance: 26.2,
    };
  }

  // Half Marathon
  if (text.includes('Half Marathon')) {
    return {
      ...baseWorkout,
      title: 'Half Marathon',
      description: 'Half marathon race or time trial. Run at goal pace.',
      type: 'race',
      distance: 13.1,
    };
  }

  // Pace runs (e.g., "5 m pace", "5 mi pace", "5 m @ MP")
  if (text.includes('pace') || text.includes('@ MP')) {
    const distanceMatch = text.match(/(\d+)\s*(?:m|mi)/);
    if (distanceMatch) {
      const distance = parseInt(distanceMatch[1], 10);
      return {
        ...baseWorkout,
        title: `${distance} mi pace`,
        description: 'Run at your goal marathon pace. Focus on rhythm and form.',
        type: 'pace',
        distance,
      };
    }
  }

  // Long runs with marathon pace sections (e.g., "10 mi w/4 @ MP")
  if (text.includes('w/') && text.includes('@ MP')) {
    const distanceMatch = text.match(/^(\d+)\s*mi/);
    const mpMatch = text.match(/w\/(\d+)\s*@\s*MP/);
    if (distanceMatch) {
      const distance = parseInt(distanceMatch[1], 10);
      const mpMiles = mpMatch ? parseInt(mpMatch[1], 10) : 0;
      return {
        ...baseWorkout,
        title: `${distance} mi long run`,
        description: `Long run with ${mpMiles} miles at marathon pace.`,
        type: 'run',
        distance,
      };
    }
  }

  // Speed work: hills, intervals, tempo
  if (
    text.includes('x hill') ||
    text.includes('x 400') ||
    text.includes('x 800') ||
    text.includes('x 1600') ||
    text.includes('x 1K') ||
    text.includes('tempo')
  ) {
    return {
      ...baseWorkout,
      title: 'Speed workout',
      description: text,
      type: 'pace',
    };
  }

  // Standard runs (e.g., "5 m run", "5 mi run")
  const runMatch = text.match(/(\d+)\s*(?:m|mi)\s*run/);
  if (runMatch) {
    const distance = parseInt(runMatch[1], 10);
    let description = 'Easy run at conversational pace.';
    if (distance >= 15) {
      description = 'Long run. Start easy and maintain steady effort.';
    } else if (distance >= 10) {
      description = 'Medium-long run. Build your endurance.';
    }
    return {
      ...baseWorkout,
      title: `${distance} mi run`,
      description,
      type: 'run',
      distance,
    };
  }

  // Just a number (common in intermediate/advanced plans for long runs)
  const justNumber = text.match(/^(\d+)$/);
  if (justNumber) {
    const distance = parseInt(justNumber[1], 10);
    let description = 'Easy run at conversational pace.';
    if (distance >= 15) {
      description = 'Long run. Start easy and maintain steady effort.';
    } else if (distance >= 10) {
      description = 'Medium-long run. Build your endurance.';
    }
    return {
      ...baseWorkout,
      title: `${distance} mi run`,
      description,
      type: 'run',
      distance,
    };
  }

  // Fallback for any other text
  if (text.trim()) {
    return {
      ...baseWorkout,
      title: 'Workout',
      description: text,
      type: 'run',
    };
  }

  return null;
}

// Get plan display name
function getPlanName(planId: PlanId): string {
  const names: Record<PlanId, string> = {
    novice1: 'Novice 1',
    novice2: 'Novice 2',
    intermediate1: 'Intermediate 1',
    intermediate2: 'Intermediate 2',
    advanced1: 'Advanced 1',
    advanced2: 'Advanced 2',
  };
  return names[planId];
}

// Main generator function
export function generatePlan(raceDate: Date, planId: PlanId): TrainingPlan {
  const schedule = getTrainingSchedule(planId);
  if (!schedule || schedule.length === 0) {
    throw new Error(`No schedule found for plan: ${planId}`);
  }

  // Normalize race date to avoid timezone issues
  // Create a new date at noon local time to prevent day shifts
  const normalizedRaceDate = new Date(
    raceDate.getFullYear(),
    raceDate.getMonth(),
    raceDate.getDate(),
    12, 0, 0, 0
  );

  const weeks: TrainingWeek[] = [];

  // Calculate backwards from race date
  // Race is on the last day (Sunday) of week 18
  for (let weekIndex = PLAN_DURATION_WEEKS - 1; weekIndex >= 0; weekIndex--) {
    const weekSchedule = schedule[weekIndex];
    const weekWorkouts: Workout[] = [];

    // For each day in the week (0 = first day, 6 = last day/race day)
    for (let dayIndex = 0; dayIndex <= 6; dayIndex++) {
      // Calculate days before race
      // Week 18 (index 17), day 6 = race day (0 days before)
      // Week 18 (index 17), day 5 = 1 day before race
      // Week 18 (index 17), day 0 = 6 days before race
      // Week 17 (index 16), day 6 = 7 days before race
      const weeksBeforeRace = PLAN_DURATION_WEEKS - 1 - weekIndex;
      const daysBeforeRace = weeksBeforeRace * 7 + (6 - dayIndex);

      // Calculate workout date by subtracting days from race date
      const workoutDate = subDays(normalizedRaceDate, daysBeforeRace);

      const dateStr = format(workoutDate, 'yyyy-MM-dd');
      const dayText = weekSchedule[dayIndex];
      const workout = parseWorkout(dayText, dateStr);

      if (workout) {
        weekWorkouts.push(workout);
      }
    }

    // Sort workouts by date
    weekWorkouts.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate week start/end dates and total mileage
    const weekStartDate = weekWorkouts[0]?.date || '';
    const weekEndDate = weekWorkouts[weekWorkouts.length - 1]?.date || '';
    const totalPlannedMileage = weekWorkouts.reduce(
      (sum, w) => sum + (w.distance || 0),
      0
    );

    weeks.push({
      weekNumber: weekIndex + 1,
      startDate: weekStartDate,
      endDate: weekEndDate,
      workouts: weekWorkouts,
      totalPlannedMileage,
    });
  }

  // Sort weeks by week number
  weeks.sort((a, b) => a.weekNumber - b.weekNumber);

  const startDate = weeks[0]?.startDate || '';

  return {
    id: generateId(),
    planId,
    planName: getPlanName(planId),
    raceDate: format(normalizedRaceDate, 'yyyy-MM-dd'),
    startDate,
    weeks,
    createdAt: Date.now(),
  };
}

// Calculate stats for a plan
export function calculatePlanStats(plan: TrainingPlan): import('../types').PlanStats {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  let totalWorkouts = 0;
  let completedWorkouts = 0;
  let skippedWorkouts = 0;
  let totalPlannedMiles = 0;
  let totalCompletedMiles = 0;
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let currentWeek = 1;

  // Flatten all workouts and sort by date
  const allWorkouts = plan.weeks
    .flatMap(w => w.workouts)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  for (const workout of allWorkouts) {
    // Only count run/pace workouts (not rest/cross)
    if (workout.type !== 'rest' && workout.type !== 'cross') {
      totalWorkouts++;
      totalPlannedMiles += workout.distance || 0;

      if (workout.isCompleted) {
        completedWorkouts++;
        totalCompletedMiles += workout.actualDistance || workout.distance || 0;
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else if (workout.isSkipped) {
        skippedWorkouts++;
        tempStreak = 0;
      } else if (workout.date < todayStr) {
        // Past workout not completed = missed
        tempStreak = 0;
      }
    }

    // Determine current week
    if (workout.date <= todayStr) {
      const weekObj = plan.weeks.find(w =>
        w.workouts.some(wo => wo.id === workout.id)
      );
      if (weekObj) {
        currentWeek = weekObj.weekNumber;
      }
    }
  }

  // Current streak is the temp streak at the end
  currentStreak = tempStreak;

  // Days until race
  const daysUntilRace = Math.max(
    0,
    differenceInDays(parseDateString(plan.raceDate), today)
  );

  // Completion rate (only count past workouts)
  const pastWorkouts = allWorkouts.filter(
    w => w.date < todayStr && w.type !== 'rest' && w.type !== 'cross'
  );
  const completionRate =
    pastWorkouts.length > 0
      ? Math.round((completedWorkouts / pastWorkouts.length) * 100)
      : 0;

  return {
    totalWorkouts,
    completedWorkouts,
    skippedWorkouts,
    totalPlannedMiles,
    totalCompletedMiles,
    currentStreak,
    longestStreak,
    completionRate,
    daysUntilRace,
    currentWeek,
  };
}
