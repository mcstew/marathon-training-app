import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WORKOUT_BG_COLORS } from '../constants';
import { IconChevronLeft, IconChevronRight, IconX } from '@tabler/icons-react';
import { WorkoutType } from '../types';
import { Button } from '../components/Button';

export const CalendarView: React.FC = () => {
  const { plan, toggleWorkoutCompletion, skipWorkout } = useApp();
  const [selectedWorkout, setSelectedWorkout] = useState<{wIdx: number, woIdx: number} | null>(null);

  if (!plan) return null;

  const workoutDetail = selectedWorkout 
    ? plan.weeks[selectedWorkout.wIdx].workouts[selectedWorkout.woIdx] 
    : null;

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100">
        <h1 className="text-2xl font-bold">Training Plan</h1>
        <p className="text-sm text-gray-500">18 Weeks to {new Date(plan.raceDate).toLocaleDateString()}</p>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 px-4 pt-4">
        {plan.weeks.map((week, wIdx) => (
          <div key={week.weekNumber} className="mb-6">
            <div className="flex items-baseline justify-between mb-2 px-2">
                <h3 className="font-bold text-gray-800">Week {week.weekNumber}</h3>
                <span className="text-xs text-gray-400">{week.totalMileage} mi total</span>
            </div>
            
            <div className="grid grid-cols-7 gap-1">
               {week.workouts.map((workout, woIdx) => {
                   // Short day name
                   const d = new Date(workout.date);
                   const isToday = d.toDateString() === new Date().toDateString();
                   
                   return (
                       <div key={workout.id} className="flex flex-col items-center gap-1">
                           <span className={`text-[10px] ${isToday ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                               {d.toLocaleDateString('en-US', { weekday: 'narrow' })}
                           </span>
                           <button
                             onClick={() => setSelectedWorkout({ wIdx, woIdx })}
                             className={`w-full aspect-[4/5] rounded-lg flex flex-col items-center justify-center relative transition-transform active:scale-95 ${workout.isCompleted ? 'opacity-50 ring-2 ring-green-400' : ''}`}
                             style={{ backgroundColor: WORKOUT_BG_COLORS[workout.type] }}
                           >
                               {workout.isCompleted && (
                                   <div className="absolute inset-0 bg-white/30 flex items-center justify-center rounded-lg">
                                       <span className="text-green-800 font-bold text-lg">✓</span>
                                   </div>
                               )}
                               
                               {workout.type !== WorkoutType.Rest && workout.type !== WorkoutType.CrossTrain && (
                                   <span className="text-white font-bold text-sm drop-shadow-md">{workout.distanceInMiles}</span>
                               )}
                               {workout.type === WorkoutType.Race && (
                                   <span className="text-2xl">🏁</span>
                               )}
                               {workout.type === WorkoutType.CrossTrain && (
                                   <span className="text-white text-xs">XT</span>
                               )}
                           </button>
                       </div>
                   );
               })}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Sheet/Modal */}
      {selectedWorkout && workoutDetail && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-slide-up">
                  <button 
                    onClick={() => setSelectedWorkout(null)}
                    className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                  >
                      <IconX className="w-5 h-5 text-gray-600" />
                  </button>

                  <div className="mb-6">
                      <div className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-1">
                          {workoutDetail.type}
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                          {workoutDetail.type === WorkoutType.Rest ? "Rest Day" : `${workoutDetail.distanceInMiles} Miles`}
                      </h2>
                      <p className="text-gray-500">
                          {new Date(workoutDetail.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
                      <p className="text-gray-700 leading-relaxed">{workoutDetail.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <Button 
                        variant="secondary" 
                        onClick={() => {
                            skipWorkout(selectedWorkout.wIdx, selectedWorkout.woIdx);
                            setSelectedWorkout(null);
                        }}
                      >
                          Skip
                      </Button>
                      <Button 
                        variant={workoutDetail.isCompleted ? "outline" : "primary"}
                        onClick={() => {
                            toggleWorkoutCompletion(selectedWorkout.wIdx, selectedWorkout.woIdx);
                            setSelectedWorkout(null);
                        }}
                      >
                          {workoutDetail.isCompleted ? "Mark Incomplete" : "Complete"}
                      </Button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};