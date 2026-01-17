import React from 'react';
import { IconCircleCheckFilled, IconCircle, IconCircleX } from '@tabler/icons-react';
import { Workout, WorkoutType } from '../types';
import { WORKOUT_COLORS } from '../constants';

interface WorkoutCardProps {
  workout: Workout;
  onClick?: () => void;
  showDate?: boolean;
  compact?: boolean;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, onClick, showDate = false, compact = false }) => {
  const colorClass = WORKOUT_COLORS[workout.type] || 'bg-gray-100 text-gray-800';
  
  // Format date: "Mon, Oct 12"
  const dateObj = new Date(workout.date);
  const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div 
      onClick={onClick}
      className={`relative group bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer ${workout.isCompleted ? 'opacity-70 bg-gray-50' : ''}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {showDate && (
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{dateStr}</p>
          )}
          
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${colorClass}`}>
              {workout.type}
            </span>
          </div>
          
          <div className="flex items-baseline gap-1">
            {workout.type !== WorkoutType.Rest && workout.type !== WorkoutType.CrossTrain && (
              <h3 className="text-2xl font-bold text-gray-900">
                {workout.distanceInMiles} <span className="text-sm font-normal text-gray-500">mi</span>
              </h3>
            )}
             {(workout.type === WorkoutType.Rest || workout.type === WorkoutType.CrossTrain) && (
              <h3 className="text-lg font-bold text-gray-700">
                {workout.type === WorkoutType.Rest ? "Rest Day" : "Cross Train"}
              </h3>
            )}
          </div>
          
          {!compact && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{workout.description}</p>
          )}
        </div>

        <div className="ml-4">
          {workout.isCompleted ? (
            <IconCircleCheckFilled className="w-8 h-8 text-green-500" />
          ) : workout.skipped ? (
             <IconCircleX className="w-8 h-8 text-red-300" />
          ) : (
            <IconCircle className="w-8 h-8 text-gray-200 group-hover:text-blue-400 transition-colors" />
          )}
        </div>
      </div>
    </div>
  );
};