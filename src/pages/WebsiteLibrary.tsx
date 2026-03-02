import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Edit, Pause, Trash2, ExternalLink, Play } from 'lucide-react';
import { Website } from '../types';
import HelpTooltip from '../components/ui/HelpTooltip';

export default function WebsiteLibrary() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWebsites = () => {
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
        console.error('Error fetching websites:', err);
        setWebsites([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Tracking link copied to clipboard!');
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    await fetch(`/api/websites/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchWebsites();
  };

  const deleteWebsite = async (id: string) => {
    if (confirm('Are you sure you want to delete this website? This action cannot be undone.')) {
      await fetch(`/api/websites/${id}`, { method: 'DELETE' });
      fetchWebsites();
    }
  };

  if (loading) return <div className="p-8 text-center">Loading library...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Website Library</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage all your tracking links and pixels.</p>
        </div>
        <Link
          to="/add"
          id="add-new-btn"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          Add New Website
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4 font-medium">Website Name</th>
              <th className="px-6 py-4 font-medium flex items-center">
                Tracking Link
                <HelpTooltip content="This is the link you use in your Facebook Ad. It tracks the user before sending them to your site." />
              </th>
              <th className="px-6 py-4 font-medium">Pixel ID</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {websites.map((website) => {
              const trackingLink = `${window.location.origin}/go/${website.id}`;
              return (
                <tr key={website.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-slate-200">{website.name}</div>
                    <div className="text-slate-400 text-xs truncate max-w-[200px]">{website.destination_url}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs text-slate-600 dark:text-slate-400 font-mono truncate max-w-[150px]">
                        {trackingLink}
                      </code>
                      <button
                        onClick={() => copyToClipboard(trackingLink)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                        title="Copy Link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400">{website.pixel_id}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        website.status === 'active'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                      }`}
                    >
                      {website.status === 'active' ? 'Active' : 'Paused'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <button
                        onClick={() => toggleStatus(website.id, website.status)}
                        className={`p-2 rounded-lg transition-colors ${
                          website.status === 'active'
                            ? 'text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                            : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                        }`}
                        title={website.status === 'active' ? 'Pause' : 'Activate'}
                      >
                        {website.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteWebsite(website.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {websites.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                  No websites found. Create your first tracking link!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
