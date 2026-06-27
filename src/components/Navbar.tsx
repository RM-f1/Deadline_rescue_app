import { Clock, Menu, Moon, Sun, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface NavbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  scheduleStatus?: 'on-track' | 'behind' | null;
}

export default function Navbar({ darkMode, toggleDarkMode, scheduleStatus }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileMenuOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? darkMode
            ? 'bg-gray-900/70 backdrop-blur-md shadow-lg border-b border-gray-800/50'
            : 'bg-white/70 backdrop-blur-md shadow-lg border-b border-gray-200/50'
          : darkMode
          ? 'bg-transparent'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a
            href="#"
            className="flex items-center gap-2 group"
            onClick={(e) => e.preventDefault()}
          >
            <div className={`p-2 rounded-lg transition-transform duration-300 group-hover:scale-110 ${
              darkMode ? 'bg-blue-500/20' : 'bg-blue-100'
            }`}>
              <Clock className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <span
              className={`text-xl font-bold tracking-tight transition-all duration-300 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Deadline Rescue
            </span>
          </a>

          <div className="flex items-center gap-4">
            {scheduleStatus && (
              <div
                className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  scheduleStatus === 'on-track'
                    ? darkMode
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-green-100 text-green-700'
                    : darkMode
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    scheduleStatus === 'on-track' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                {scheduleStatus === 'on-track' ? 'On Track' : 'Behind Schedule'}
              </div>
            )}

            <button
              onClick={toggleDarkMode}
              className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-110 min-w-[44px] min-h-[44px] flex items-center justify-center ${
                darkMode
                  ? 'bg-gray-800/70 text-yellow-400 hover:bg-gray-700'
                  : 'bg-gray-100/70 text-gray-600 hover:bg-gray-200'
              }`}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className={`sm:hidden p-2.5 rounded-xl transition-all duration-300 min-w-[44px] min-h-[44px] flex items-center justify-center ${
                darkMode
                  ? 'bg-gray-800/70 text-white hover:bg-gray-700'
                  : 'bg-gray-100/70 text-gray-700 hover:bg-gray-200'
              }`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div
            className={`sm:hidden absolute top-16 left-0 right-0 shadow-xl animate-fade-in border-t ${
              darkMode
                ? 'bg-gray-900/95 backdrop-blur-md border-gray-800'
                : 'bg-white/95 backdrop-blur-md border-gray-200'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-4 space-y-3">
              {scheduleStatus && (
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${
                    scheduleStatus === 'on-track'
                      ? darkMode
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-green-100 text-green-700'
                      : darkMode
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full animate-pulse ${
                      scheduleStatus === 'on-track' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  {scheduleStatus === 'on-track' ? 'On Track' : 'Behind Schedule'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
