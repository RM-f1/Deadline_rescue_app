import { CheckCircle, Clock, Target } from 'lucide-react';

interface ProgressBarProps {
  completed: number;
  total: number;
  daysRemaining: number;
  deadline: string;
  darkMode: boolean;
}

export default function ProgressBar({
  completed,
  total,
  daysRemaining,
  deadline,
  darkMode
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div
      className={`rounded-2xl p-6 ${
        darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white shadow-lg border border-gray-100'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              percentage === 100
                ? 'bg-green-500'
                : darkMode
                ? 'bg-blue-500/20'
                : 'bg-blue-100'
            }`}
          >
            {percentage === 100 ? (
              <CheckCircle className="w-6 h-6 text-white" />
            ) : (
              <Clock className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            )}
          </div>
          <div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Overall Progress
            </p>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {percentage}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Completed
            </p>
            <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {completed}/{total}
            </p>
          </div>
          <div className="text-center">
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Days Left
            </p>
            <p
              className={`text-lg font-semibold ${
                daysRemaining <= 2 ? 'text-red-500' : darkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              {daysRemaining}
            </p>
          </div>
          <div className="text-center hidden sm:block">
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Deadline
            </p>
            <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {new Date(deadline).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

      <div className={`h-3 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            percentage === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {percentage === 100 && (
        <div className="mt-4 flex items-center gap-2 text-green-500">
          <Target className="w-5 h-5" />
          <span className="font-medium">All tasks completed! Great work!</span>
        </div>
      )}
    </div>
  );
}
