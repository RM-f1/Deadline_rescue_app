import { useEffect, useState } from 'react';
import { Calendar, CheckCircle, Clock, Flame, Hourglass, TrendingUp } from 'lucide-react';

interface StatsDashboardProps {
  totalDays: number;
  daysCompleted: number;
  daysRemaining: number;
  schedule: Array<{ completed?: boolean }>;
  totalHours: number;
  darkMode: boolean;
}

function AnimatedNumber({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * easeOut));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{displayValue}</span>;
}

function useCurrentStreak(schedule: Array<{ completed?: boolean }>): number {
  let streak = 0;
  for (let i = 0; i < schedule.length; i++) {
    if (schedule[i].completed) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function getMotivationalMessage(rate: number): string {
  if (rate === 0) return "Every journey starts with a single step. Let's go! 🚀";
  if (rate <= 33) return "Great start! Keep the momentum going 💪";
  if (rate <= 66) return "Halfway there! You're doing amazing 🔥";
  if (rate < 100) return "Almost there! Push through to the finish line 🏁";
  return "You crushed it! Deadline Rescue mission complete 🎉";
}

export default function StatsDashboard({
  totalDays,
  daysCompleted,
  daysRemaining,
  schedule,
  totalHours,
  darkMode
}: StatsDashboardProps) {
  const streak = useCurrentStreak(schedule);
  const hoursSaved = Math.round(totalHours * 0.3);
  const completionRate = totalDays > 0 ? Math.round((daysCompleted / totalDays) * 100) : 0;

  const stats = [
    { icon: Calendar, value: totalDays, label: 'Total Days', color: 'text-blue-500' },
    { icon: CheckCircle, value: daysCompleted, label: 'Days Completed', color: 'text-green-500' },
    { icon: Hourglass, value: daysRemaining, label: 'Days Remaining', color: 'text-amber-500' },
    { icon: Flame, value: streak, label: 'Current Streak', color: 'text-orange-500' },
    { icon: Clock, value: hoursSaved, label: 'Hours Saved', color: 'text-purple-500' },
    { icon: TrendingUp, value: completionRate, label: 'Completion Rate', suffix: '%', color: 'text-teal-500' }
  ];

  return (
    <div className="mb-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {stats.map(({ icon: Icon, value, label, color, suffix }) => (
          <div
            key={label}
            className={`rounded-xl p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 animate-fade-in ${
              darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <div className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <AnimatedNumber value={value} />
              {suffix}
            </div>
            <div className={`text-xs sm:text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {label}
            </div>
          </div>
        ))}
      </div>

      <div
        className={`mt-4 p-4 rounded-xl text-center text-sm sm:text-base font-medium animate-fade-in ${
          completionRate === 100
            ? darkMode
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-green-50 text-green-700 border border-green-200'
            : darkMode
            ? 'bg-gray-800 text-gray-300 border border-gray-700'
            : 'bg-blue-50 text-blue-700 border border-blue-100'
        }`}
        style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
      >
        {getMotivationalMessage(completionRate)}
      </div>
    </div>
  );
}
