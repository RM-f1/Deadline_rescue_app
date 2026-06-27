import { AlertTriangle, Calendar, Clock, Loader2, Sparkles, Target } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { TaskInput } from '../utils/planner';

interface TaskFormProps {
  onSubmit: (task: TaskInput) => void;
  isLoading: boolean;
  darkMode: boolean;
  initialTask?: TaskInput | null;
}

export default function TaskForm({ onSubmit, isLoading, darkMode, initialTask }: TaskFormProps) {
  const [name, setName] = useState(initialTask?.name || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [deadline, setDeadline] = useState(initialTask?.deadline || '');
  const [difficulty, setDifficulty] = useState<TaskInput['difficulty']>(
    initialTask?.difficulty || 'Medium'
  );
  const [hoursPerDay, setHoursPerDay] = useState(initialTask?.hoursPerDay || 4);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isTightDeadline = useMemo(() => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);
    const daysUntil = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil < 2;
  }, [deadline]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Task name is required';
    }

    if (!deadline) {
      newErrors.deadline = 'Deadline is required';
    } else {
      const deadlineDate = new Date(deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadlineDate <= today) {
        newErrors.deadline = 'Deadline must be in the future';
      }
    }

    if (hoursPerDay < 1 || hoursPerDay > 16) {
      newErrors.hoursPerDay = 'Hours must be between 1 and 16';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      deadline,
      difficulty,
      hoursPerDay
    });
  };

  const inputBase = `w-full px-4 py-3.5 rounded-xl transition-all duration-300 ${
    darkMode
      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 focus:bg-white'
  } border-2 focus:outline-none focus:ring-4`;

  const labelBase = `absolute left-4 transition-all duration-300 pointer-events-none ${
    darkMode ? 'text-gray-500' : 'text-gray-400'
  }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="relative">
        <input
          id="task-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder=" "
          className={`${inputBase} pt-5 pb-2 ${errors.name ? 'border-red-500' : ''}`}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        <label
          htmlFor="task-name"
          className={`${labelBase} ${name ? 'top-2 text-xs font-medium' : 'top-4 text-sm'}`}
        >
          <Target className="w-3 h-3 inline mr-1" />
          Task Name
        </label>
        {errors.name && (
          <p id="name-error" className="mt-1.5 text-sm text-red-500">
            {errors.name}
          </p>
        )}
      </div>

      <div className="relative">
        <textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder=" "
          rows={3}
          className={`${inputBase} pt-5 pb-2 resize-none`}
        />
        <label
          htmlFor="task-description"
          className={`${labelBase} ${description ? 'top-2 text-xs font-medium' : 'top-4 text-sm'}`}
        >
          Task Description
          <span className="ml-1 text-xs opacity-60">(optional)</span>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <input
            id="deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className={`${inputBase} pt-5 pb-2 ${errors.deadline ? 'border-red-500' : ''}`}
            aria-invalid={!!errors.deadline}
            aria-describedby={errors.deadline ? 'deadline-error' : undefined}
          />
          <label
            htmlFor="deadline"
            className={`${labelBase} top-2 text-xs font-medium`}
          >
            <Calendar className="w-3 h-3 inline mr-1" />
            Deadline
          </label>
          {isTightDeadline && !errors.deadline && (
            <div className="mt-2 flex items-center gap-2 text-amber-600 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Very tight deadline! We'll generate a compressed emergency plan.</span>
            </div>
          )}
          {errors.deadline && (
            <p id="deadline-error" className="mt-1.5 text-sm text-red-500">
              {errors.deadline}
            </p>
          )}
        </div>

        <div className="relative">
          <div className={`${inputBase} pt-5 pb-2 px-4`}>
            <label
              htmlFor="hours-per-day"
              className={`${labelBase} top-2 text-xs font-medium`}
            >
              <Clock className="w-3 h-3 inline mr-1" />
              Hours Per Day
            </label>
            <div className="flex items-center gap-4 mt-2">
              <input
                type="range"
                min="1"
                max="12"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span
                className={`text-lg font-bold min-w-[3rem] text-right ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                {hoursPerDay}h
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label
          className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
        >
          Estimated Difficulty
        </label>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {(['Easy', 'Medium', 'Hard'] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setDifficulty(level)}
              className={`flex-1 min-w-[80px] py-3 px-4 rounded-xl font-medium transition-all duration-300 min-h-[44px] ${
                difficulty === level
                  ? level === 'Easy'
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/30 scale-105'
                    : level === 'Medium'
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-105'
                    : 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-105'
                  : darkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 min-h-[52px] ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating Plan...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" />
            Generate Plan
          </span>
        )}
      </button>
    </form>
  );
}
