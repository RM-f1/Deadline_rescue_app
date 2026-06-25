import { useCallback, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Calendar, Clock, FileQuestion, Info, Loader2, Sparkles, Zap } from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import ProgressBar from '../components/ProgressBar';
import Timeline from '../components/Timeline';
import TaskForm from '../components/TaskForm';
import type { ScheduleItem, TaskInput } from '../utils/planner';
import { generatePlan, getDaysRemaining } from '../utils/planner';

const STORAGE_KEY = 'deadline-rescue-data';

interface SavedData {
  task: TaskInput;
  schedule: ScheduleItem[];
  darkMode: boolean;
}

export default function Home() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data: SavedData = JSON.parse(saved);
      return data.darkMode;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [task, setTask] = useState<TaskInput | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data: SavedData = JSON.parse(saved);
      return data.task;
    }
    return null;
  });

  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data: SavedData = JSON.parse(saved);
      return data.schedule;
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState(false);

  // Persist to localStorage
  useEffect(() => {
    if (task && schedule.length > 0) {
      const data: SavedData = { task, schedule, darkMode };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [task, schedule, darkMode]);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (newTask: TaskInput) => {
    setIsLoading(true);
    setTask(newTask);

    try {
      const newSchedule = await generatePlan(newTask);
      setSchedule(newSchedule);
    } catch (error) {
      console.error('Failed to generate plan:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Toggle task completion
  const handleToggle = useCallback((index: number) => {
    setSchedule((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], completed: !updated[index].completed };
      return updated;
    });
  }, []);

  // Check for celebration
  useEffect(() => {
    if (schedule.length > 0) {
      const allCompleted = schedule.every((item) => item.completed);
      if (allCompleted) {
        // Trigger confetti
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

        const interval = setInterval(() => {
          const timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) {
            clearInterval(interval);
            return;
          }

          confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors
          });
          confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors
          });
        }, 150);

        return () => clearInterval(interval);
      }
    }
  }, [schedule]);

  // Regenerate plan
  const handleRegenerate = useCallback(() => {
    if (task) {
      handleSubmit(task);
    }
  }, [task, handleSubmit]);

  // Print handler
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Calculate stats
  const completedCount = schedule.filter((item) => item.completed).length;
  const daysRemaining = task ? getDaysRemaining(task.deadline) : 0;

  // Apply dark mode to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-950' : 'bg-gray-50'}`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      {/* Hero Section */}
      <header className={`pt-24 pb-12 px-4 sm:px-6 lg:px-8 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-blue-50 to-white'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
            <Zap className="w-4 h-4" />
            AI-Powered Task Planning
          </div>
          <h1
            className={`text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Deadline Rescue{' '}
            <span role="img" aria-label="alarm clock">
              ⏰
            </span>
          </h1>
          <p
            className={`text-lg sm:text-xl mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
          >
            Turn panic into a plan. Let AI break your tasks into daily action steps.
          </p>

          {/* Features */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            {[
              { icon: Calendar, text: 'Day-by-Day Planning' },
              { icon: Sparkles, text: 'AI-Powered Scheduling' },
              { icon: Clock, text: 'Buffer Time Included' }
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                  darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600 shadow-sm'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Task Form Card */}
        <div
          className={`rounded-2xl p-6 sm:p-8 mb-8 ${
            darkMode
              ? 'bg-gray-900 border border-gray-800'
              : 'bg-white shadow-xl border border-gray-100'
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                darkMode ? 'bg-blue-500/20' : 'bg-blue-100'
              }`}
            >
              <Info className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Enter Your Task
              </h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Provide details about your task and deadline
              </p>
            </div>
          </div>

          <TaskForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            darkMode={darkMode}
            initialTask={task}
          />
        </div>

        {/* Empty State or Schedule */}
        {schedule.length === 0 ? (
          <div
            className={`rounded-2xl p-12 text-center ${
              darkMode
                ? 'bg-gray-900 border border-gray-800'
                : 'bg-white shadow-xl border border-gray-100'
            }`}
          >
            <div
              className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                darkMode ? 'bg-gray-800' : 'bg-gray-100'
              }`}
            >
              <FileQuestion className={`w-8 h-8 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            </div>
            <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              No plan yet
            </h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Enter your task above and let AI do the thinking.
            </p>
          </div>
        ) : (
          <>
            {/* Progress Section */}
            <div className="mb-8">
              <ProgressBar
                completed={completedCount}
                total={schedule.length}
                daysRemaining={daysRemaining}
                deadline={task?.deadline || ''}
                darkMode={darkMode}
              />
            </div>

            {/* Warning Banner */}
            {schedule.some((item) => item.warning) && (
              <div
                className={`mb-8 rounded-xl p-4 flex items-center gap-3 ${
                  darkMode
                    ? 'bg-red-900/30 border border-red-800'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className={`font-semibold ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                    Tight Deadline Alert!
                  </h4>
                  <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                    Your deadline is approaching fast. This is a compressed plan to help you make it!
                  </p>
                </div>
              </div>
            )}

            {/* Schedule Items */}
            <div
              className={`rounded-2xl p-6 sm:p-8 ${
                darkMode
                  ? 'bg-gray-900 border border-gray-800'
                  : 'bg-white shadow-xl border border-gray-100'
              }`}
            >
              <Timeline schedule={schedule} onToggle={handleToggle} darkMode={darkMode} />
            </div>

            {/* Footer */}
            <Footer
              onRegenerate={handleRegenerate}
              onPrint={handlePrint}
              isLoading={isLoading}
              darkMode={darkMode}
            />
          </>
        )}

        {/* Info Section */}
        <div
          className={`mt-8 rounded-xl p-6 ${
            darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-blue-50 border border-blue-100'
          }`}
        >
          <div className="flex items-start gap-3">
            <Info className={`w-5 h-5 flex-shrink-0 mt-0.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <div>
              <h4 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                How it works
              </h4>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Gemini 1.5 Flash AI analyzes your task, deadline, and available time to create a
                realistic, day-by-day plan. Buffer days are included for revision, and you can track
                progress by checking off each day's goal. Your plans are saved locally and restored
                when you return.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
