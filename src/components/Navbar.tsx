import { Moon, Sun, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface NavbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  scheduleStatus?: 'on-track' | 'behind' | null;
}

export default function Navbar({ darkMode, toggleDarkMode, scheduleStatus }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? darkMode
            ? 'bg-gray-900/95 backdrop-blur-md shadow-lg'
            : 'bg-white/95 backdrop-blur-md shadow-lg'
          : darkMode
          ? 'bg-gray-900'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Clock className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <span
              className={`text-xl font-bold tracking-tight ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Deadline Rescue
            </span>
          </div>

          <div className="flex items-center gap-4">
            {scheduleStatus && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium">
                <span
                  className={`w-2 h-2 rounded-full ${
                    scheduleStatus === 'on-track' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span
                  className={
                    scheduleStatus === 'on-track'
                      ? darkMode
                        ? 'text-green-400'
                        : 'text-green-600'
                      : darkMode
                      ? 'text-red-400'
                      : 'text-red-600'
                  }
                >
                  {scheduleStatus === 'on-track' ? 'On Track' : 'Behind Schedule'}
                </span>
              </div>
            )}

            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                darkMode
                  ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
