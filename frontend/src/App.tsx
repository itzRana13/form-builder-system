import { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import FormPage from './pages/FormPage';
import SubmissionsPage from './pages/SubmissionsPage';

function App() {
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem('theme');
    if (stored === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      window.localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      window.localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-background-dark dark:text-gray-100">
      <nav className="bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex">
              <Link
                to="/"
                className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium ${location.pathname === '/'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Form
              </Link>
              <Link
                to="/submissions"
                className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium ${location.pathname === '/submissions'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Submissions
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setIsDarkMode((prev) => !prev)}
              className="inline-flex items-center rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<FormPage />} />
          <Route path="/submissions" element={<SubmissionsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

