import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { WorkoutCard } from '../components/WorkoutCard';
import { WorkoutType } from '../types';
import { IconCalendar, IconChevronRight, IconTrophy } from '@tabler/icons-react';

export const TodayView: React.FC = () => {
  const { plan, toggleWorkoutCompletion } = useApp();
  const [showConfetti, setShowConfetti] = useState(false);

  // Determine "today" based on plan start date and actual date
  const todayStr = new Date().toISOString().split('T')[0];
  const todayDate = new Date();
  
  const todayData = useMemo(() => {
    if (!plan) return null;
    
    // Find the workout that matches today's date string
    for (let wIdx = 0; wIdx < plan.weeks.length; wIdx++) {
      const week = plan.weeks[wIdx];
      const workoutIdx = week.workouts.findIndex(wk => wk.date === todayStr);
      if (workoutIdx !== -1) {
        return { 
          week: week, 
          workout: week.workouts[workoutIdx], 
          wIdx, 
          workoutIdx 
        };
      }
    }
    
    return null;
  }, [plan, todayStr]);

  const daysUntilRace = useMemo(() => {
     if (!plan) return 0;
     const race = new Date(plan.raceDate);
     const diff = race.getTime() - todayDate.getTime();
     return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [plan, todayDate]);

  const handleComplete = () => {
    if (todayData) {
        toggleWorkoutCompletion(todayData.wIdx, todayData.workoutIdx);
        // Trigger small animation if marking complete
        if (!todayData.workout.isCompleted) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 2000);
        }
    }
  };

  if (!plan) return null;

  return (
    <div className="p-6 pb-24 space-y-6 animate-fade-in">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-gray-500 font-medium uppercase tracking-wide text-sm">
            {todayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h2>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">
             {todayData ? "Today's Run" : "Rest Day"}
          </h1>
        </div>
        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
            Week {todayData ? todayData.week.weekNumber : '-'}
        </div>
      </header>

      {/* Hero Card */}
      <section>
        {todayData ? (
           <div className="transform transition-all active:scale-[0.98]">
             <WorkoutCard 
                workout={todayData.workout} 
                onClick={handleComplete} 
             />
             <p className="text-center text-xs text-gray-400 mt-2">Tap card to mark as complete</p>
           </div>
        ) : (
           <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 text-center border border-gray-200">
             <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <IconCalendar className="w-8 h-8 text-gray-400" />
             </div>
             <h3 className="text-xl font-bold text-gray-700">No workout scheduled</h3>
             <p className="text-gray-500 mt-2">Enjoy your rest day or check the calendar for upcoming runs.</p>
           </div>
        )}
      </section>

      {/* Stats Row */}
      <section className="grid grid-cols-2 gap-4">
         <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
            <div className="p-2 bg-orange-100 w-fit rounded-lg">
                <IconTrophy className="w-5 h-5 text-orange-600" />
            </div>
            <div>
                <span className="text-2xl font-bold text-gray-900 block">{daysUntilRace}</span>
                <span className="text-xs text-gray-500">Days to Race</span>
            </div>
         </div>
         <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
             {/* Simple week progress dots */}
             <div className="flex justify-between items-start">
                 <span className="text-xs text-gray-400 font-bold uppercase">This Week</span>
             </div>
             <div className="flex justify-between items-end gap-1">
                 {todayData && todayData.week.workouts.map((w, i) => (
                     <div key={i} className={`flex-1 h-8 rounded-md flex items-end justify-center pb-1 ${
                         w.isCompleted ? 'bg-green-400' : 
                         w.type === WorkoutType.Rest ? 'bg-gray-100' : 'bg-gray-200'
                     }`}>
                         {/* Visual bar height based on distance relative to max? Too complex for this view. Just color blocks. */}
                     </div>
                 ))}
             </div>
             <span className="text-xs text-gray-500 text-right">
                 {todayData ? Math.round((todayData.week.workouts.filter(w => w.isCompleted).length / 7) * 100) : 0}% Done
             </span>
         </div>
      </section>

      {/* Confetti Effect (Simple CSS overlay) */}
      {showConfetti && (
          <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
              <div className="text-6xl animate-bounce">🎉</div>
          </div>
      )}
    </div>
  );
};