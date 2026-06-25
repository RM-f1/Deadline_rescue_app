import { CalendarDays } from 'lucide-react';
import type { ScheduleItem } from '../utils/planner';
import ScheduleCard from './ScheduleCard';

interface TimelineProps {
  schedule: ScheduleItem[];
  onToggle: (index: number) => void;
  darkMode: boolean;
}

export default function Timeline({ schedule, onToggle, darkMode }: TimelineProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <CalendarDays className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Your Action Plan
        </h2>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div
          className={`absolute left-8 top-0 bottom-0 w-0.5 ${
            darkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}
        />

        {/* Schedule items */}
        <div className="space-y-4 pl-8">
          {schedule.map((item, index) => (
            <div key={index} className="relative">
              {/* Timeline dot */}
              <div
                className={`absolute -left-8 top-5 w-4 h-4 rounded-full border-4 ${
                  item.completed
                    ? 'bg-green-500 border-green-400'
                    : darkMode
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-white border-gray-300'
                }`}
              />

              <ScheduleCard
                item={item}
                index={index}
                onToggle={onToggle}
                darkMode={darkMode}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
