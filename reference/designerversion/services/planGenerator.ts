import { PlanLevel, TrainingPlan, WeeklyPlan, Workout, WorkoutType } from '../types';

// A simplified pattern generator for demonstration purposes.
// In a real app, this would be a more complex matrix or JSON lookup.
const NOVICE_1_PATTERN = [
  // Week 1-18 Long run distances (approximate Hal Higdon Novice 1)
  6, 7, 8, 9, 10, 7, 12, 13, 10, 15, 16, 12, 18, 14, 20, 12, 8, 26.2
];

const WEEKDAY_PATTERN_NOVICE = [
  { dayOffset: 0, type: WorkoutType.Rest, dist: 0 },         // Mon
  { dayOffset: 1, type: WorkoutType.EasyRun, dist: 3 },      // Tue
  { dayOffset: 2, type: WorkoutType.EasyRun, dist: 3 },      // Wed
  { dayOffset: 3, type: WorkoutType.EasyRun, dist: 3 },      // Thu
  { dayOffset: 4, type: WorkoutType.Rest, dist: 0 },         // Fri
  { dayOffset: 5, type: WorkoutType.LongRun, dist: 0 },      // Sat (Distance comes from weekly array)
  { dayOffset: 6, type: WorkoutType.CrossTrain, dist: 0 },   // Sun
];

const WEEKDAY_PATTERN_INTERMEDIATE = [
    { dayOffset: 0, type: WorkoutType.CrossTrain, dist: 0 },   // Mon
    { dayOffset: 1, type: WorkoutType.EasyRun, dist: 4 },      // Tue
    { dayOffset: 2, type: WorkoutType.EasyRun, dist: 5 },      // Wed
    { dayOffset: 3, type: WorkoutType.Tempo, dist: 4 },        // Thu
    { dayOffset: 4, type: WorkoutType.Rest, dist: 0 },         // Fri
    { dayOffset: 5, type: WorkoutType.LongRun, dist: 0 },      // Sat
    { dayOffset: 6, type: WorkoutType.EasyRun, dist: 3 },      // Sun
];

export const generatePlan = (raceDate: Date, level: PlanLevel): TrainingPlan => {
  const weeks: WeeklyPlan[] = [];
  const oneDay = 24 * 60 * 60 * 1000;
  
  // Calculate start date (18 weeks before race)
  // We align the race to be on the Sunday of the 18th week usually, or we assume raceDate is the big day.
  // Let's set the race date as the last day of week 18.
  
  const raceTime = raceDate.getTime();
  
  // 17 full weeks before the race week = 18 total weeks
  const totalWeeks = 18;
  
  // Find the Monday of the race week. 
  // If raceDate is Sunday (Day 0), Monday is raceDate - 6 days.
  // If raceDate is Saturday (Day 6), Monday is raceDate - 5 days.
  // JS GetDay: Sun=0, Mon=1...Sat=6.
  const raceDayOfWeek = raceDate.getDay(); 
  // We want to normalize so the schedule ends on race date.
  // For simplicity in this generator, we assume a traditional Mon-Sun training week
  // and ensure the Race is on the last day (Day 7 / Sunday) of Week 18, or adjust accordingly.
  
  // Let's iterate BACKWARDS from race date
  let currentRefDate = new Date(raceTime);
  
  // If we assume the race is the last event.
  
  for (let w = totalWeeks; w >= 1; w--) {
    const weekWorkouts: Workout[] = [];
    const longRunDistance = NOVICE_1_PATTERN[w - 1]; // Get long run distance for this week
    
    // Choose pattern based on level (simplified)
    const pattern = level.includes('Novice') ? WEEKDAY_PATTERN_NOVICE : WEEKDAY_PATTERN_INTERMEDIATE;
    
    // Determine the "Saturday" of this week relative to the race.
    // Actually, it's easier to generate standard weeks and then map dates.
    // Let's calculate the "Monday" of Week 1.
    // 18 weeks * 7 days = 126 days.
    // Start Date = Race Date - 126 days (approx).
  }

  // RE-STRATEGY: Start Date Calculation
  // We want the plan to end exactly on Race Date.
  // Let's assume the Race Date is Day 7 of Week 18.
  const daysToSubtract = (totalWeeks * 7) - 1; 
  const startDate = new Date(raceTime - (daysToSubtract * oneDay));

  let totalPlanMileage = 0;

  for (let w = 1; w <= totalWeeks; w++) {
    const weeklyWorkouts: Workout[] = [];
    let weeklyMileage = 0;
    
    const pattern = level.includes('Novice') ? WEEKDAY_PATTERN_NOVICE : WEEKDAY_PATTERN_INTERMEDIATE;
    const longRunDist = NOVICE_1_PATTERN[w - 1];

    // For each day in the pattern (0=Mon, 6=Sun)
    for (let d = 0; d < 7; d++) {
        const patternDay = pattern[d];
        const workoutDate = new Date(startDate.getTime() + ((w - 1) * 7 + d) * oneDay);
        
        // Format ISO Date YYYY-MM-DD
        const dateStr = workoutDate.toISOString().split('T')[0];
        
        let type = patternDay.type;
        let dist = patternDay.dist;
        let desc = "Rest and recover.";

        // Special handling for Long Run
        if (type === WorkoutType.LongRun) {
            dist = longRunDist;
            desc = `Long slow distance run. Build endurance.`;
        } else if (type === WorkoutType.EasyRun) {
             // Scale easy runs slightly for intermediate
             if (!level.includes('Novice')) dist += 1;
             desc = "Run at a comfortable, conversational pace.";
        } else if (type === WorkoutType.Tempo) {
             desc = "Run comfortably hard.";
        } else if (type === WorkoutType.CrossTrain) {
             desc = "Bike, swim, or yoga. Keep it low impact.";
        }

        // Is this THE race day? (Last day of last week)
        if (w === totalWeeks && d === 6) {
            type = WorkoutType.Race;
            dist = 26.2;
            desc = "Race Day! You've got this.";
        }

        // Taper weeks adjustment (Weeks 16, 17)
        if (w >= 16 && w < 18 && type !== WorkoutType.Rest && type !== WorkoutType.LongRun) {
           dist = Math.max(2, dist - 1); // Reduce volume
           desc += " (Taper)";
        }

        weeklyWorkouts.push({
            id: `w${w}-d${d}`,
            date: dateStr,
            type,
            distanceInMiles: dist,
            description: desc,
            isCompleted: false,
            skipped: false
        });
        
        if (type !== WorkoutType.Rest && type !== WorkoutType.CrossTrain) {
             weeklyMileage += dist;
        }
    }

    weeks.push({
        weekNumber: w,
        workouts: weeklyWorkouts,
        totalMileage: weeklyMileage
    });
    
    totalPlanMileage += weeklyMileage;
  }

  return {
      id: crypto.randomUUID(),
      level,
      raceDate: raceDate.toISOString().split('T')[0],
      startDate: startDate.toISOString().split('T')[0],
      weeks,
      createdAt: Date.now()
  };
};