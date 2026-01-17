import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useApp } from '../context/AppContext';
import { IconAward, IconFlame, IconTrendingUp } from '@tabler/icons-react';

export const ProgressView: React.FC = () => {
  const { plan } = useApp();

  if (!plan) return null;

  // Calculate stats
  let totalMilesCompleted = 0;
  let totalWorkoutsCompleted = 0;
  let totalWorkouts = 0;
  let currentStreak = 0;

  // Chart data
  const weeklyData = plan.weeks.map(week => {
    const milesDone = week.workouts.reduce((acc, w) => w.isCompleted ? acc + w.distanceInMiles : acc, 0);
    const milesPlanned = week.totalMileage;
    
    // Global stats accum
    totalMilesCompleted += milesDone;
    totalWorkouts += week.workouts.length;
    totalWorkoutsCompleted += week.workouts.filter(w => w.isCompleted).length;

    return {
        name: `W${week.weekNumber}`,
        completed: milesDone,
        planned: milesPlanned
    };
  });

  // Simple streak calc (consecutive days leading up to today, excluding future)
  const today = new Date().toISOString().split('T')[0];
  const allWorkouts = plan.weeks.flatMap(w => w.workouts).filter(w => w.date <= today).reverse();
  
  for (const w of allWorkouts) {
      if (w.isCompleted) {
          currentStreak++;
      } else if (!w.isCompleted && w.date !== today) {
          break;
      }
  }

  const completionRate = Math.round((totalWorkoutsCompleted / Math.max(1, (allWorkouts.length))) * 100);

  return (
    <div className="p-6 pb-24 space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900">Your Progress</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg shadow-blue-200">
            <div className="flex items-center gap-2 mb-1 opacity-90">
                <IconTrendingUp className="w-4 h-4" />
                <span className="text-xs font-bold uppercase">Total Dist</span>
            </div>
            <span className="text-3xl font-bold">{totalMilesCompleted.toFixed(1)}</span>
            <span className="text-sm opacity-80 ml-1">mi</span>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
             <div className="flex items-center gap-2 mb-1 text-orange-500">
                <IconFlame className="w-4 h-4 fill-current" />
                <span className="text-xs font-bold uppercase">Streak</span>
            </div>
            <span className="text-3xl font-bold text-gray-900">{currentStreak}</span>
            <span className="text-sm text-gray-400 ml-1">days</span>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">Weekly Mileage</h3>
            <span className="text-xs text-gray-400">Actual vs Planned</span>
        </div>
        <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="planned" fill="#f3f4f6" radius={[4, 4, 0, 0]} stackId="a" />
                    <Bar dataKey="completed" fill="#3b82f6" radius={[4, 4, 0, 0]} stackId="b">
                        {weeklyData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.completed >= entry.planned ? '#22c55e' : '#3b82f6'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

       <div className="bg-gray-900 text-gray-400 rounded-2xl p-6 flex items-center justify-between">
           <div>
               <p className="text-xs font-bold uppercase mb-1">Consistency</p>
               <h4 className="text-2xl font-bold text-white">{completionRate}%</h4>
               <p className="text-xs mt-1">Workout completion rate</p>
           </div>
           <div className="h-12 w-12 rounded-full border-4 border-gray-700 flex items-center justify-center">
               <IconAward className="w-6 h-6 text-yellow-400" />
           </div>
       </div>
    </div>
  );
};