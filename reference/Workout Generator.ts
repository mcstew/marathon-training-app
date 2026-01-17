import { format, subDays, addDays } from "date-fns";
import { WorkoutItem } from "@shared/schema";

export function generateWorkouts(raceDate: Date, planKey: string): WorkoutItem[] {
  const workouts: WorkoutItem[] = [];
  
  // Always use 18 weeks (126 days) for Hal Higdon plans
  const PLAN_DURATION_WEEKS = 18;

  // Step 1: Get the training plan schedule based on the plan key
  const schedule = getTrainingPlanSchedule(planKey);
  if (!schedule || schedule.length === 0) {
    return workouts;
  }
  
  // The schedule is an array of weeks, with each week having 7 days (0 = Sunday, 6 = Saturday)
  // For most marathon plans, the race is on Sunday (day 0 of week 18)
  
  // The marathon entry will come from the schedule, we don't need to add it manually
  // We'll use the last day of the last week (Marathon) from the schedule
  // This will be correctly placed on the race day due to our date calculation
  
  // Step 3: Work backwards from the race date to populate the training plan
  // Start at week 17 (0-indexed, so the last week before the marathon)
  // and go backward to week 0
  for (let weekIndex = PLAN_DURATION_WEEKS - 1; weekIndex >= 0; weekIndex--) {
    const weekSchedule = schedule[weekIndex];
    
    // For each day in the week (0 = Sunday, 6 = Saturday)
    for (let dayIndex = 6; dayIndex >= 0; dayIndex--) {
      // Calculate how many days before the race
      // Week 17, day 6 (Saturday) is 1 day before the race
      // Week 17, day 0 (Sunday) is 7 days before the race
      // Week 16, day 6 (Saturday) is 8 days before the race, etc.
      const daysBeforeRace = (PLAN_DURATION_WEEKS - 1 - weekIndex) * 7 + (7 - dayIndex);
      
      // If it's the marathon day (day 0 of week 18), place it on the actual race date 
      if (daysBeforeRace === 0) {
        const dateStr = format(raceDate, 'yyyy-MM-dd'); 
        const workout = createWorkoutFromText("Marathon", dateStr);
        if (workout) {
          workouts.push(workout);
        }
        continue;
      }
      
      // IMPORTANT FIX: Add +1 to all dates to shift everything forward one day
      // This ensures workouts appear on the correct dates in the calendar
      const workoutDate = subDays(raceDate, daysBeforeRace - 1); // +1 day offset
      const dateStr = format(workoutDate, 'yyyy-MM-dd');
      
      // Get the workout description from the schedule
      const dayText = weekSchedule[dayIndex];
      
      // Create workout based on the text 
      const workout = createWorkoutFromText(dayText, dateStr);
      if (workout) {
        workouts.push(workout);
      }
    }
  }
  
  // Sort workouts by date (earliest first)
  workouts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  return workouts;
}

function createWorkoutFromText(dayText: string, dateStr: string): WorkoutItem | null {
  if (!dayText) return null;
  
  if (dayText.includes("Rest")) {
    return {
      date: dateStr,
      title: "Rest",
      description: "Rest day",
      type: "rest"
    };
  } else if (dayText.includes("Cross")) {
    return {
      date: dateStr,
      title: "Cross",
      description: "Cross training",
      type: "cross"
    };
  } else if (dayText.includes("pace")) {
    // Different distance formats: "5 m pace", "5 mi pace"
    const distanceMatch = dayText.match(/(\d+)\s*(?:m|mi)\s*pace/);
    if (distanceMatch) {
      const distance = parseInt(distanceMatch[1], 10);
      return {
        date: dateStr,
        title: dayText,
        description: "Tempo run at race pace",
        type: "pace",
        distance,
        unit: "mi"
      };
    }
  } else if (dayText.includes("Half Marathon")) {
    return {
      date: dateStr,
      title: "Half Marathon",
      description: "Half Marathon Race",
      type: "pace",
      distance: 13.1,
      unit: "mi"
    };
  } else if (dayText.includes("Marathon")) {
    return {
      date: dateStr,
      title: "Marathon",
      description: "Marathon Day",
      type: "pace",
      distance: 26.2,
      unit: "mi"
    };
  } else if (dayText.includes("run")) {
    // Different distance formats: "5 m run", "5 mi run"
    const distanceMatch = dayText.match(/(\d+)\s*(?:m|mi)\s*run/);
    if (distanceMatch) {
      const distance = parseInt(distanceMatch[1], 10);
      let description = "Easy run";
      if (distance >= 15) {
        description = "Long run";
      } else if (distance >= 10) {
        description = "Medium-long run";
      }
      return {
        date: dateStr,
        title: dayText,
        description,
        type: "run",
        distance,
        unit: "mi"
      };
    }
  } else {
    // For formats like "10" (just the number) in intermediate plans
    const distanceMatch = dayText.match(/^(\d+)$/);
    if (distanceMatch) {
      const distance = parseInt(distanceMatch[1], 10);
      let description = "Easy run";
      if (distance >= 15) {
        description = "Long run";
      } else if (distance >= 10) {
        description = "Medium-long run";
      }
      return {
        date: dateStr,
        title: `${distance} mi run`,
        description,
        type: "run",
        distance,
        unit: "mi"
      };
    }
  }
  
  // If it's a special format like hill repeats, tempo, etc.
  if (dayText.includes("x hill") || 
      dayText.includes("x 400") || 
      dayText.includes("x 800") || 
      dayText.includes("x 1600") || 
      dayText.includes("x 1K") ||
      dayText.includes("tempo")) {
    return {
      date: dateStr,
      title: "Speed workout",
      description: dayText,
      type: "pace"
    };
  }
  
  // For Advanced 2 plan formats like "10 mi w/4 @ MP"
  if (dayText.includes("w/") && dayText.includes("@ MP")) {
    // Extract the total distance (e.g., 10 from "10 mi w/4 @ MP")
    const distanceMatch = dayText.match(/^(\d+)\s*mi/);
    if (distanceMatch) {
      const distance = parseInt(distanceMatch[1], 10);
      return {
        date: dateStr,
        title: "Marathon pace run",
        description: dayText,
        type: "pace",
        distance,
        unit: "mi"
      };
    }
  }
  
  // If nothing else matched, but there's some text, create a generic workout
  if (dayText.trim()) {
    return {
      date: dateStr,
      title: "Workout",
      description: dayText,
      type: "run"
    };
  }
  
  return null;
}

function getTrainingPlanSchedule(planKey: string): string[][] {
  switch(planKey) {
    case 'novice1':
      return [
        ["Rest", "3 m run", "3 m run", "3 m run", "Rest", "6 m run", "Cross"],
        ["Rest", "3 m run", "3 m run", "3 m run", "Rest", "9 m run", "Cross"],
        ["Rest", "3 m run", "4 m run", "3 m run", "Rest", "11 m run", "Cross"],
        ["Rest", "3 m run", "4 m run", "3 m run", "Rest", "8 m run", "Cross"],
        ["Rest", "3 m run", "5 m run", "3 m run", "Rest", "12 m run", "Cross"],
        ["Rest", "3 m run", "5 m run", "3 m run", "Rest", "9 m run", "Cross"],
        ["Rest", "4 m run", "5 m run", "4 m run", "Rest", "14 m run", "Cross"],
        ["Rest", "4 m run", "5 m run", "4 m run", "Rest", "10 m run", "Cross"],
        ["Rest", "4 m run", "6 m run", "4 m run", "Rest", "16 m run", "Cross"],
        ["Rest", "4 m run", "6 m run", "4 m run", "Rest", "12 m run", "Cross"],
        ["Rest", "5 m run", "6 m run", "5 m run", "Rest", "18 m run", "Cross"],
        ["Rest", "5 m run", "6 m run", "5 m run", "Rest", "14 m run", "Cross"],
        ["Rest", "5 m run", "7 m run", "5 m run", "Rest", "20 m run", "Cross"],
        ["Rest", "5 m run", "7 m run", "5 m run", "Rest", "12 m run", "Cross"],
        ["Rest", "5 m run", "8 m run", "5 m run", "Rest", "20 m run", "Cross"],
        ["Rest", "5 m run", "8 m run", "5 m run", "Rest", "12 m run", "Cross"],
        ["Rest", "4 m run", "6 m run", "4 m run", "Rest", "8 m run", "Cross"],
        ["Rest", "3 m run", "4 m run", "2 m run", "Rest", "Rest", "Marathon"]
      ];
    case 'novice2':
      return [
        ["Rest", "3 m run", "5 m pace", "3 m run", "Rest", "8 m run", "Cross"],
        ["Rest", "3 m run", "5 m run", "3 m run", "Rest", "9 m run", "Cross"],
        ["Rest", "3 m run", "5 m pace", "3 m run", "Rest", "6 m run", "Cross"],
        ["Rest", "3 m run", "6 m pace", "3 m run", "Rest", "11 m run", "Cross"],
        ["Rest", "3 m run", "6 m run", "3 m run", "Rest", "12 m run", "Cross"],
        ["Rest", "3 m run", "6 m pace", "3 m run", "Rest", "9 m run", "Cross"],
        ["Rest", "4 m run", "7 m pace", "4 m run", "Rest", "14 m run", "Cross"],
        ["Rest", "4 m run", "7 m run", "4 m run", "Rest", "15 m run", "Cross"],
        ["Rest", "4 m run", "7 m pace", "4 m run", "Rest", "Rest", "Half Marathon"],
        ["Rest", "4 m run", "8 m pace", "4 m run", "Rest", "17 m run", "Cross"],
        ["Rest", "5 m run", "8 m run", "5 m run", "Rest", "18 m run", "Cross"],
        ["Rest", "5 m run", "8 m pace", "5 m run", "Rest", "13 m run", "Cross"],
        ["Rest", "5 m run", "5 m pace", "5 m run", "Rest", "19 m run", "Cross"],
        ["Rest", "5 m run", "8 m run", "5 m run", "Rest", "12 m run", "Cross"],
        ["Rest", "5 m run", "5 m pace", "5 m run", "Rest", "20 m run", "Cross"],
        ["Rest", "5 m run", "4 m pace", "5 m run", "Rest", "12 m run", "Cross"],
        ["Rest", "4 m run", "3 m run", "4 m run", "Rest", "8 m run", "Cross"],
        ["Rest", "3 m run", "2 m run", "Rest", "Rest", "2 m run", "Marathon"]
      ];
    case 'intermediate1':
      return [
        ["Cross", "3 m run", "5 m run", "3 m run", "Rest", "5 m pace", "8 m run"],
        ["Cross", "3 m run", "5 m run", "3 m run", "Rest", "5 m run", "9 m run"],
        ["Cross", "3 m run", "5 m run", "3 m run", "Rest", "5 m pace", "6 m run"],
        ["Cross", "3 m run", "6 m run", "3 m run", "Rest", "6 m pace", "11 m run"],
        ["Cross", "3 m run", "6 m run", "3 m run", "Rest", "6 m run", "12 m run"],
        ["Cross", "3 m run", "5 m run", "3 m run", "Rest", "6 m pace", "9 m run"],
        ["Cross", "4 m run", "7 m run", "4 m run", "Rest", "7 m pace", "14 m run"],
        ["Cross", "4 m run", "7 m run", "4 m run", "Rest", "7 m run", "15 m run"],
        ["Cross", "4 m run", "5 m run", "4 m run", "Rest", "Rest", "Half Marathon"],
        ["Cross", "4 m run", "8 m run", "4 m run", "Rest", "8 m pace", "17 m run"],
        ["Cross", "5 m run", "8 m run", "5 m run", "Rest", "8 m run", "18 m run"],
        ["Cross", "5 m run", "5 m run", "5 m run", "Rest", "8 m pace", "13 m run"],
        ["Cross", "5 m run", "8 m run", "5 m run", "Rest", "5 m pace", "20 m run"],
        ["Cross", "5 m run", "5 m run", "5 m run", "Rest", "8 m run", "12 m run"],
        ["Cross", "5 m run", "8 m run", "5 m run", "Rest", "5 m pace", "20 m run"],
        ["Cross", "5 m run", "6 m run", "5 m run", "Rest", "4 m pace", "12 m run"],
        ["Cross", "4 m run", "5 m run", "4 m run", "Rest", "3 m run", "8 m run"],
        ["Cross", "3 m run", "4 m run", "Rest", "Rest", "2 m run", "Marathon"]
      ];
    case 'intermediate2':
      return [
        ["Cross", "3 mi run", "5 mi run", "3 mi run", "Rest", "5 mi pace", "10"],
        ["Cross", "3 mi run", "5 mi run", "3 mi run", "Rest", "5 mi run", "11"],
        ["Cross", "3 mi run", "6 mi run", "3 mi run", "Rest", "6 mi pace", "8"],
        ["Cross", "3 mi run", "6 mi run", "3 mi run", "Rest", "6 mi pace", "13"],
        ["Cross", "3 mi run", "7 mi run", "3 mi run", "Rest", "7 mi run", "14"],
        ["Cross", "3 mi run", "7 mi run", "3 mi run", "Rest", "7 mi pace", "10"],
        ["Cross", "4 mi run", "8 mi run", "4 mi run", "Rest", "8 mi pace", "16"],
        ["Cross", "4 mi run", "8 mi run", "4 mi run", "Rest", "8 mi run", "17"],
        ["Cross", "4 mi run", "9 mi run", "4 mi run", "Rest", "Rest", "Half Marathon"],
        ["Cross", "4 mi run", "9 mi run", "4 mi run", "Rest", "9 mi pace", "19"],
        ["Cross", "5 mi run", "10 mi run", "5 mi run", "Rest", "10 mi run", "20"],
        ["Cross", "5 mi run", "6 mi run", "5 mi run", "Rest", "6 mi pace", "12"],
        ["Cross", "5 mi run", "10 mi run", "5 mi run", "Rest", "10 mi pace", "20"],
        ["Cross", "5 mi run", "6 mi run", "5 mi run", "Rest", "6 mi run", "12"],
        ["Cross", "5 mi run", "10 mi run", "5 mi run", "Rest", "10 mi pace", "20"],
        ["Cross", "5 mi run", "8 mi run", "5 mi run", "Rest", "4 mi pace", "12"],
        ["Cross", "4 mi run", "6 mi run", "4 mi run", "Rest", "4 mi run", "8"],
        ["Cross", "3 mi run", "4 mi run", "Rest", "Rest", "2 mi run", "Marathon"]
      ];
    case 'advanced1':
      return [
        ["3 mi run", "5 mi run", "3 mi run", "3 x hill", "Rest", "5 mi pace", "10"],
        ["3 mi run", "5 mi run", "3 mi run", "30 tempo", "Rest", "5 mi run", "11"],
        ["3 mi run", "6 mi run", "3 mi run", "4 x 800", "Rest", "6 mi pace", "8"],
        ["3 mi run", "6 mi run", "3 mi run", "4 x hill", "Rest", "6 mi pace", "13"],
        ["3 mi run", "7 mi run", "3 mi run", "35 tempo", "Rest", "7 mi run", "14"],
        ["3 mi run", "7 mi run", "3 mi run", "5 x 800", "Rest", "7 mi pace", "10"],
        ["3 mi run", "8 mi run", "4 mi run", "5 x hill", "Rest", "8 mi pace", "16"],
        ["3 mi run", "8 mi run", "4 mi run", "40 tempo", "Rest", "8 mi run", "17"],
        ["3 mi run", "9 mi run", "4 mi run", "6 x 800", "Rest", "Rest", "Half Marathon"],
        ["3 mi run", "9 mi run", "4 mi run", "6 x hill", "Rest", "9 mi pace", "19"],
        ["4 mi run", "10 mi run", "5 mi run", "45 tempo", "Rest", "10 mi run", "20"],
        ["4 mi run", "6 mi run", "5 mi run", "7 x 800", "Rest", "6 mi pace", "12"],
        ["4 mi run", "10 mi run", "5 mi run", "7 x hill", "Rest", "10 mi pace", "20"],
        ["5 mi run", "6 mi run", "5 mi run", "45 tempo", "Rest", "6 mi run", "12"],
        ["5 mi run", "10 mi run", "5 mi run", "8 x 800", "Rest", "10 mi pace", "20"],
        ["5 mi run", "8 mi run", "5 mi run", "6 x hill", "Rest", "4 mi pace", "12"],
        ["4 mi run", "6 mi run", "4 mi run", "30 tempo", "Rest", "4 mi run", "8"],
        ["3 mi run", "4 x 400", "2 mi run", "Rest", "Rest", "2 mi run", "Marathon"]
      ];
    case 'advanced2':
      return [
        ["3 mi run", "5 mi run", "3 mi run", "3 x hill", "Rest", "5 m @ MP", "10"],
        ["3 mi run", "5 mi run", "3 mi run", "30 tempo", "Rest", "Rest", "10 mi w/4 @ MP"],
        ["3 mi run", "6 mi run", "3 mi run", "4 x 800", "Rest", "6 m @ MP", "8"],
        ["3 mi run", "6 mi run", "3 mi run", "4 x hill", "Rest", "Rest", "13 mi w/6 @ MP"],
        ["3 mi run", "7 mi run", "3 mi run", "35 tempo", "Rest", "7 m @ MP", "14"],
        ["3 mi run", "7 mi run", "3 mi run", "5 x 800", "Rest", "Rest", "10 mi w/7 @ MP"],
        ["3 mi run", "8 mi run", "4 mi run", "5 x hill", "Rest", "8 m @ MP", "16"],
        ["3 mi run", "8 mi run", "4 mi run", "40 tempo", "Rest", "Rest", "17 mi w/8 @ MP"],
        ["3 mi run", "9 mi run", "4 mi run", "6 x 800", "Rest", "Rest", "Half Marathon"],
        ["3 mi run", "9 mi run", "4 mi run", "6 x hill", "Rest", "9 m @ MP", "19"],
        ["4 mi run", "10 mi run", "5 mi run", "45 tempo", "Rest", "Rest", "20 mi w/10 @ MP"],
        ["4 mi run", "6 mi run", "5 mi run", "7 x 800", "Rest", "6 m @ MP", "12"],
        ["4 mi run", "10 mi run", "5 mi run", "7 x hill", "Rest", "Rest", "20 mi w/12 @ MP"],
        ["5 mi run", "6 mi run", "5 mi run", "45 tempo", "Rest", "6 m @ MP", "12"],
        ["5 mi run", "10 mi run", "5 mi run", "8 x 800", "Rest", "Rest", "20 mi w/15 @ MP"],
        ["5 mi run", "8 mi run", "5 mi run", "6 x hill", "Rest", "4 m @ MP", "12"],
        ["4 mi run", "6 mi run", "4 mi run", "30 tempo", "Rest", "4 m @ MP", "8"],
        ["3 mi run", "4 x 400", "2 mi run", "Rest", "Rest", "2 mi run", "Marathon"]
      ];
    case 'first':
      return [
        ["Rest", "Rest", "Key 1", "Rest", "Key 2", "Rest", "Long"],
        ["Rest", "Rest", "Key 1", "Rest", "Key 2", "Rest", "Long"],
        ["Rest", "Rest", "Key 1", "Rest", "Key 2", "Rest", "Long"],
        ["Rest", "Rest", "Key 1", "Rest", "Key 2", "Rest", "Long"],
        ["Rest", "Rest", "Key 1", "Rest", "Key 2", "Rest", "Long"],
        ["Rest", "Rest", "Key 1", "Rest", "Key 2", "Rest", "Long"],
        ["Rest", "Rest", "Key 1", "Rest", "Key 2", "Rest", "Long"],
        ["Rest", "Rest", "Key 1", "Rest", "Key 2", "Rest", "Long"],
        ["Rest", "Rest", "Key 1", "Rest", "Key 2", "Rest", "Long"],
        ["Rest", "Rest", "Key 1", "Rest", "Key 2", "Rest", "Long"],
        ["Rest", "Rest", "Key 1", "Rest", "Key 2", "Rest", "Long"],
        ["Rest", "Rest", "Key 1", "Rest", "Key 2", "Rest", "Long"],
        ["Rest", "Rest", "Key 1", "Rest", "Key 2", "Rest", "Long"],
        ["Rest", "Rest", "Key 1", "Rest", "Key 2", "Rest", "Long"],
        ["Rest", "Rest", "Key 1", "Rest", "Key 2", "Rest", "Long"],
        ["Rest", "Rest", "Key 1", "Rest", "Key 2", "Rest", "Long"],
        ["Rest", "Rest", "Key 1", "Rest", "Key 2", "Rest", "Long"],
        ["Rest", "Rest", "Key 1", "Rest", "Rest", "Rest", "Marathon"]
      ];
    default:
      return [];
  }
}