import { useCallback, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Calendar, CalendarDays, Clock, Download, FileQuestion, Info, Loader2, RefreshCw, Sparkles, X } from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import ProgressBar from '../components/ProgressBar';
import Timeline from '../components/Timeline';
import TaskForm from '../components/TaskForm';
import StatsDashboard from '../components/StatsDashboard';
import type { ScheduleItem, TaskInput } from '../utils/planner';
import { generatePlan, getDaysRemaining, reschedulePlan } from '../utils/planner';
import { downloadICS } from '../utils/calendar';

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
  const [showToast, setShowToast] = useState<string | null>(null);
  const [showWarningBanner, setShowWarningBanner] = useState(true);
  const [showBehindBanner, setShowBehindBanner] = useState(true);
  const [isRescheduling, setIsRescheduling] = useState(false);

  const scheduleRef = useRef<HTMLDivElement>(null);

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const todayIndex = schedule.findIndex(item => item.date === todayStr);
  const previousIncomplete = schedule.filter((item, index) => {
    if (index >= todayIndex) return false;
    return !item.completed;
  });
  const incompleteCount = previousIncomplete.length;

  const todayItem = todayIndex >= 0 ? schedule[todayIndex] : null;
  const todayIncomplete = todayItem && !todayItem.completed;
  const hour = new Date().getHours();
  const isAfter6PM = hour >= 18;

  const scheduleStatus: 'on-track' | 'behind' | null =
    schedule.length > 0 ? (incompleteCount === 0 && (!todayIncomplete || !isAfter6PM) ? 'on-track' : 'behind') : null;

  useEffect(() => {
    if (schedule.length > 0 && showWarningBanner && todayIncomplete && isAfter6PM) {
      setShowWarningBanner(true);
    }
  }, [schedule, todayIncomplete, isAfter6PM]);

  const toast = useCallback((message: string) => {
    setShowToast(message);
    setTimeout(() => setShowToast(null), 4000);
  }, []);

  useEffect(() => {
    if (task && schedule.length > 0) {
      const data: SavedData = { task, schedule, darkMode };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [task, schedule, darkMode]);

  useEffect(() => {
    scheduleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [schedule.length]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

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

  const handleToggle = useCallback((index: number) => {
    setSchedule((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], completed: !updated[index].completed };
      return updated;
    });
  }, []);

  useEffect(() => {
    if (schedule.length > 0) {
      const allCompleted = schedule.every((item) => item.completed);
      if (allCompleted) {
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

  const handleRegenerate = useCallback(() => {
    if (task) {
      handleSubmit(task);
    }
  }, [task, handleSubmit]);

  const handleDownload = useCallback(() => {
    if (schedule.length > 0) {
      downloadICS(schedule);
      toast('Calendar file downloaded! Open it to import into Google Calendar, Apple Calendar, or Outlook.');
    }
  }, [schedule, toast]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleReschedule = useCallback(async () => {
    if (!task) return;
    setIsRescheduling(true);
    try {
      const incompleteDays = schedule.filter(item => !item.completed);
      const newSchedule = await reschedulePlan(task, incompleteDays);
      setSchedule(newSchedule);
      toast('Schedule updated! You have a new compressed plan.');
    } catch (error) {
      console.error('Failed to reschedule:', error);
    } finally {
      setIsRescheduling(false);
    }
  }, [task, schedule, toast]);

  const completedCount = schedule.filter((item) => item.completed).length;
  const daysRemaining = task ? getDaysRemaining(task.deadline) : 0;
  const totalHours = schedule.reduce((sum, item) => sum + item.hours, 0);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-950' : 'bg-gray-50'}`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} scheduleStatus={scheduleStatus} />

      {showToast && (
        <div className="fixed top-20 right-4 z-50 animate-fade-in">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 ${
              darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            }`}
          >
            <CalendarDays className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium">{showToast}</span>
          </div>
        </div>
      )}

      {schedule.length > 0 && todayIncomplete && isAfter6PM && showWarningBanner && (
        <div className="fixed top-16 left-0 right-0 z-40 animate-fade-in">
          <div
            className={`px-4 py-4 flex items-center justify-between gap-4 shadow-lg ${
              darkMode ? 'bg-amber-900/90 backdrop-blur-md' : 'bg-amber-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <p className={`text-sm font-medium ${darkMode ? 'text-amber-200' : 'text-amber-800'}`}>
                You haven't completed today's task yet! You're at risk of falling behind.
              </p>
            </div>
            <button
              onClick={() => setShowWarningBanner(false)}
              className={`p-2 rounded-full hover:bg-amber-700/30 min-w-[44px] min-h-[44px] flex items-center justify-center ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {schedule.length > 0 && incompleteCount >= 2 && showBehindBanner && (
        <div className="fixed top-16 left-0 right-0 z-40 animate-fade-in" style={{ top: todayIncomplete && isAfter6PM && showWarningBanner ? '6.5rem' : '4rem' }}>
          <div
            className={`px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg ${
              darkMode ? 'bg-red-900/90 backdrop-blur-md' : 'bg-red-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔄</span>
              <p className={`text-sm font-medium ${darkMode ? 'text-red-200' : 'text-red-800'}`}>
                You're falling behind! Click Reschedule to get an updated plan.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReschedule}
                disabled={isRescheduling}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all min-h-[44px] ${
                  isRescheduling
                    ? 'bg-gray-400 cursor-not-allowed'
                    : darkMode
                    ? 'bg-red-700 text-white hover:bg-red-600'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {isRescheduling ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Reschedule
              </button>
              <button
                onClick={() => setShowBehindBanner(false)}
                className={`p-2 rounded-full hover:bg-red-700/30 min-w-[44px] min-h-[44px] flex items-center justify-center ${darkMode ? 'text-red-300' : 'text-red-700'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section with Animated Gradient */}
      <header className={`relative pt-24 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden ${
        darkMode ? 'bg-gray-900' : ''
      }`}>
        {/* Animated Gradient Background */}
        {!darkMode && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 animate-gradient-x" />
        )}
        {darkMode && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900" />
        )}

        <div className="relative max-w-4xl mx-auto text-center">
          <div className={`inline-flex items-center gap-2 mb-4 sm:mb-6 px-4 py-2 rounded-full text-sm font-medium animate-fade-in ${
            darkMode
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200/50'
          }`}>
            <Sparkles className="w-4 h-4" />
            Powered by Gemini AI
          </div>
          <h1
            className={`text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4 animate-fade-in ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}
            style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
          >
            Turn Panic Into a{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Plan.
            </span>
          </h1>
          <p
            className={`text-lg sm:text-xl lg:text-2xl mb-8 animate-fade-in ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
            style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
          >
            AI-powered scheduling that beats any deadline.
          </p>

          {/* Features */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-4 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
            {[
              { icon: Calendar, text: 'Day-by-Day Planning' },
              { icon: Sparkles, text: 'AI-Powered Scheduling' },
              { icon: Clock, text: 'Buffer Time Included' }
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 ${
                  darkMode ? 'bg-gray-800/80 text-gray-300 border border-gray-700' : 'bg-white/80 text-gray-600 shadow-sm border border-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Task Form Card */}
        <div
          className={`rounded-2xl p-5 sm:p-8 mb-8 transition-all duration-300 ${
            darkMode
              ? 'bg-gray-900/80 border border-gray-800 shadow-xl shadow-gray-900/50'
              : 'bg-white shadow-xl border border-gray-100'
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${
                darkMode ? 'bg-blue-500/20' : 'bg-gradient-to-br from-blue-100 to-indigo-100'
              }`}
            >
              <Info className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <h2 className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
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
            className={`rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 ${
              darkMode
                ? 'bg-gray-900/80 border border-gray-800'
                : 'bg-white shadow-xl border border-gray-100'
            }`}
          >
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-blue-100 to-indigo-100'
              }`}
            >
              <FileQuestion className={`w-8 h-8 ${darkMode ? 'text-gray-600' : 'text-blue-500'}`} />
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
            <div className="mb-6">
              <ProgressBar
                completed={completedCount}
                total={schedule.length}
                daysRemaining={daysRemaining}
                deadline={task?.deadline || ''}
                darkMode={darkMode}
              />
            </div>

            {/* Stats Dashboard */}
            <StatsDashboard
              totalDays={schedule.length}
              daysCompleted={completedCount}
              daysRemaining={daysRemaining}
              schedule={schedule}
              totalHours={totalHours}
              darkMode={darkMode}
            />

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
              ref={scheduleRef}
              className={`rounded-2xl p-4 sm:p-6 lg:p-8 ${
                darkMode
                  ? 'bg-gray-900/80 border border-gray-800'
                  : 'bg-white shadow-xl border border-gray-100'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <CalendarDays className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Your Action Plan
                  </h2>
                </div>
                <button
                  onClick={handleDownload}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 min-h-[44px] ${
                    darkMode
                      ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  Add to Calendar
                </button>
              </div>
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
          className={`mt-8 rounded-xl p-5 sm:p-6 transition-all duration-300 ${
            darkMode ? 'bg-gray-900/80 border border-gray-800' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
              <Info className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
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
