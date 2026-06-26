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

  const inputBase = `w-full px-4 py-3 rounded-xl transition-all duration-200 ${
    darkMode
      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
  } border focus:outline-none focus:ring-4`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="task-name"
          className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
        >
          <Target className="w-4 h-4 inline mr-1" />
          Task Name
        </label>
        <input
          id="task-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Complete React project presentation"
          className={`${inputBase} ${errors.name ? 'border-red-500' : ''}`}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <p id="name-error" className="mt-1 text-sm text-red-500">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="task-description"
          className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
        >
          Task Description
          <span className={`ml-1 text-xs font-normal ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            (optional)
          </span>
        </label>
        <textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add any relevant details or context..."
          rows={3}
          className={`${inputBase} resize-none`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="deadline"
            className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
          >
            <Calendar className="w-4 h-4 inline mr-1" />
            Deadline
          </label>
          <input
            id="deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className={`${inputBase} ${errors.deadline ? 'border-red-500' : ''}`}
            aria-invalid={!!errors.deadline}
            aria-describedby={errors.deadline ? 'deadline-error' : undefined}
          />
          {isTightDeadline && !errors.deadline && (
            <div className="mt-2 flex items-center gap-2 text-amber-600 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Very tight deadline! We'll generate a compressed emergency plan.</span>
            </div>
          )}
          {errors.deadline && (
            <p id="deadline-error" className="mt-1 text-sm text-red-500">
              {errors.deadline}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="hours-per-day"
            className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
          >
            <Clock className="w-4 h-4 inline mr-1" />
            Hours Per Day
          </label>
          <input
            id="hours-per-day"
            type="number"
            value={hoursPerDay}
            onChange={(e) => setHoursPerDay(Number(e.target.value))}
            min={1}
            max={16}
            className={`${inputBase} ${errors.hoursPerDay ? 'border-red-500' : ''}`}
            aria-invalid={!!errors.hoursPerDay}
            aria-describedby={errors.hoursPerDay ? 'hours-error' : undefined}
          />
          {errors.hoursPerDay && (
            <p id="hours-error" className="mt-1 text-sm text-red-500">
              {errors.hoursPerDay}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
        >
          Estimated Difficulty
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['Easy', 'Medium', 'Hard'] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setDifficulty(level)}
              className={`py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                difficulty === level
                  ? level === 'Easy'
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                    : level === 'Medium'
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                    : 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                  : darkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
        className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5'
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
