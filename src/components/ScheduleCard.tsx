import { AlertTriangle, CheckCircle2, Clock, Coffee, Rocket, Star } from 'lucide-react';
import type { ScheduleItem } from '../utils/planner';

interface ScheduleCardProps {
  item: ScheduleItem;
  index: number;
  onToggle: (index: number) => void;
  darkMode: boolean;
}

export default function ScheduleCard({ item, index, onToggle, darkMode }: ScheduleCardProps) {
  const isCompleted = item.completed;

  return (
    <div
      className={`relative flex items-start gap-4 p-5 rounded-xl transition-all duration-300 ${
        darkMode
          ? 'bg-gray-800/70 border border-gray-700 hover:bg-gray-800'
          : 'bg-white shadow-md border border-gray-100 hover:shadow-lg'
      } ${isCompleted ? 'opacity-70' : ''}`}
    >
      <button
        onClick={() => onToggle(index)}
        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
          isCompleted
            ? 'bg-green-500 border-green-500'
            : darkMode
            ? 'border-gray-600 hover:border-blue-500'
            : 'border-gray-300 hover:border-blue-500'
        }`}
        aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {isCompleted && <CheckCircle2 className="w-4 h-4 text-white" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span
            className={`text-sm font-medium ${
              isCompleted
                ? 'line-through ' + (darkMode ? 'text-gray-500' : 'text-gray-400')
                : darkMode
                ? 'text-gray-400'
                : 'text-gray-500'
            }`}
          >
            Day {item.day}
          </span>
          <span
            className={`text-sm ${isCompleted ? 'line-through ' : ''}${
              darkMode ? 'text-gray-500' : 'text-gray-400'
            }`}
          >
            {item.date}
          </span>

          {item.isToday && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500 text-white">
              <Rocket className="w-3 h-3" />
              Start Here
            </span>
          )}

          {item.isBuffer && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500 text-white">
              <Coffee className="w-3 h-3" />
              Buffer Day
            </span>
          )}

          {item.warning && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white">
              <AlertTriangle className="w-3 h-3" />
              Tight Deadline
            </span>
          )}

          {isCompleted && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white">
              <Star className="w-3 h-3" />
              Done
            </span>
          )}
        </div>

        <p
          className={`font-medium mb-2 ${
            isCompleted
              ? 'line-through ' + (darkMode ? 'text-gray-500' : 'text-gray-400')
              : darkMode
              ? 'text-white'
              : 'text-gray-900'
          }`}
        >
          {item.goal}
        </p>

        <div className="flex items-center gap-1">
          <Clock className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
          <span
            className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
          >
            {item.hours} hour{item.hours !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
