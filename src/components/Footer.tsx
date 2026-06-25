import { Heart, Loader2, Printer, RefreshCw } from 'lucide-react';

interface FooterProps {
  onRegenerate: () => void;
  onPrint: () => void;
  isLoading: boolean;
  darkMode: boolean;
}

export default function Footer({ onRegenerate, onPrint, isLoading, darkMode }: FooterProps) {
  return (
    <footer
      className={`mt-12 py-8 border-t ${
        darkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-gray-50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p
            className={`text-sm flex items-center gap-1 ${
              darkMode ? 'text-gray-500' : 'text-gray-400'
            }`}
          >
            Made with <Heart className="w-4 h-4 text-red-500" /> for deadline warriors
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={onRegenerate}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : darkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Regenerate
            </button>

            <button
              onClick={onPrint}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                darkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              <Printer className="w-4 h-4" />
              Print / PDF
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
