import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Globe, MousePointerClick, Plus } from 'lucide-react';
import { Website } from '../types';

export default function Dashboard() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/websites')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setWebsites(data);
        } else {
          console.error('Failed to fetch websites:', data);
          setWebsites([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setWebsites([]);
        setLoading(false);
      });
  }, []);

  const totalWebsites = websites.length;
  const activePixels = websites.filter((w) => w.status === 'active').length;
  const totalViews = websites.reduce((acc, curr) => acc + (curr.views || 0), 0);

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Overview of your tracking performance</p>
        </div>
        <Link
          to="/add"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          <Plus className="w-5 h-5" />
          Add Website
        </Link>
      </header>

      {/* Stats Cards */}
      <div id="stats-overview" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Websites</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalWebsites}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Pixels</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{activePixels}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg">
              <MousePointerClick className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Views</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalViews}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity / Quick List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Websites</h3>
          <Link
            to="/add"
            id="quick-add-btn"
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
          >
            + Quick Add
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3 font-medium">Website Name</th>
                <th className="px-6 py-3 font-medium">Pixel ID</th>
                <th className="px-6 py-3 font-medium">Views</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {websites.slice(0, 5).map((website) => (
                <tr key={website.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">{website.name}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono">{website.pixel_id}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{website.views}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        website.status === 'active'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                      }`}
                    >
                      {website.status}
                    </span>
                  </td>
                </tr>
              ))}
              {websites.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    No websites added yet. Click "Add Website" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
