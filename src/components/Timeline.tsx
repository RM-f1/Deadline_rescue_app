import { useState } from 'react';
import type { ScheduleItem } from '../utils/planner';
import ScheduleCard from './ScheduleCard';

interface TimelineProps {
  schedule: ScheduleItem[];
  onToggle: (index: number) => void;
  darkMode: boolean;
}

export default function Timeline({ schedule, onToggle, darkMode }: TimelineProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [showAllMobile, setShowAllMobile] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  const todayIndex = schedule.findIndex(item => item.date === todayStr);

  return (
    <div className="relative">
      <div
        className={`absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 ${
          darkMode ? 'bg-gray-700' : 'bg-gray-200'
        }`}
      />

      <div className="space-y-3 sm:space-y-4 pl-4 sm:pl-8">
        {schedule.map((item, index) => {
          const isDefaultExpanded = index === todayIndex || showAllMobile || index === expandedIndex;

          return (
            <div key={index} className="relative">
              <div
                className={`absolute -left-4 sm:-left-8 top-5 w-4 h-4 rounded-full border-4 transition-all duration-300 ${
                  item.completed
                    ? 'bg-green-500 border-green-400 scale-110'
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
                isMobile={isMobile && !showAllMobile}
                isDefaultExpanded={isDefaultExpanded}
                onExpand={() => setExpandedIndex(expandedIndex === index ? null : index)}
              />
            </div>
          );
        })}
      </div>

      <div className="sm:hidden mt-4 flex justify-center">
        <button
          onClick={() => {
            setShowAllMobile(!showAllMobile);
            setExpandedIndex(null);
          }}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 min-h-[44px] ${
            darkMode
              ? 'bg-gray-800 text-white hover:bg-gray-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {showAllMobile ? 'Show Less' : 'Show All Days'}
        </button>
      </div>
    </div>
  );
}
