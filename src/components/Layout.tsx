import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, List, Globe, BookOpen, HelpCircle, LogOut, Activity } from 'lucide-react';
import { useTour } from '../context/TourContext';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ui/ThemeToggle';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { startTour } = useTour();
  const { logout } = useAuth();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, id: 'nav-dashboard' },
    { path: '/add', label: 'Add Website', icon: PlusCircle, id: 'nav-add' },
    { path: '/library', label: 'Website Library', icon: List, id: 'nav-library' },
    { path: '/tester', label: 'Pixel Tester', icon: Activity, id: 'nav-tester' },
    { path: '/guide', label: 'User Guide', icon: BookOpen, id: 'nav-guide' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-shrink-0 fixed h-full z-10 flex flex-col transition-colors duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xl">
            <Globe className="w-6 h-6" />
            <span>PixelControl</span>
          </div>
          <ThemeToggle />
        </div>
        <nav className="p-4 space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                id={item.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <button
            onClick={startTour}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
            <span>Restart Tour</span>
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
