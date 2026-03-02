import { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  ChevronDown, 
  Clock, 
  Globe, 
  Layout, 
  MousePointerClick, 
  Server, 
  ShoppingCart, 
  UserPlus, 
  XCircle 
} from 'lucide-react';
import { Website } from '../types';

interface LogEvent {
  id: string;
  time: string;
  source: 'Browser' | 'Server';
  event: string;
  status: 'success' | 'failed';
  eventId?: string;
  details?: string;
}

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

import AccessTokenManager from '../components/AccessTokenManager';

// ... existing imports ...

export default function PixelTester() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [selectedPixel, setSelectedPixel] = useState<Website | null>(null);
  const [events, setEvents] = useState<LogEvent[]>([]);
  const [isPixelLoaded, setIsPixelLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState<{ code: number; message: string } | null>(null);
  const [showTokenManager, setShowTokenManager] = useState(false);
  const logEndRef = useRef<HTMLTableRowElement>(null);

  // Fetch websites on load
  useEffect(() => {
    fetch('/api/websites')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setWebsites(data);
          if (data.length > 0) {
            setSelectedPixel(data[0]);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Inject Pixel Script when selected pixel changes
  useEffect(() => {
    if (!selectedPixel) return;

    // Reset state
    setIsPixelLoaded(false);
    
    // Remove existing pixel if any (cleanup)
    const existingScript = document.getElementById('fb-pixel-script');
    if (existingScript) existingScript.remove();

    // Inject new pixel
    const script = document.createElement('script');
    script.id = 'fb-pixel-script';
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${selectedPixel.pixel_id}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);

    // Check for load
    const checkInterval = setInterval(() => {
      if (window.fbq && window.fbq.loaded) {
        setIsPixelLoaded(true);
        clearInterval(checkInterval);
        addLog('Browser', 'Pixel Script Loaded', 'success');
      }
    }, 500);

    return () => clearInterval(checkInterval);
  }, [selectedPixel]);

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  const addLog = (source: 'Browser' | 'Server', event: string, status: 'success' | 'failed', details?: string) => {
    const newEvent: LogEvent = {
      id: Math.random().toString(36).substr(2, 9),
      time: new Date().toLocaleTimeString(),
      source,
      event,
      status,
      details
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const fireBrowserEvent = (eventName: string) => {
    if (!window.fbq) {
      addLog('Browser', eventName, 'failed', 'Pixel not loaded');
      return;
    }

    try {
      window.fbq('track', eventName);
      addLog('Browser', eventName, 'success');
    } catch (err) {
      addLog('Browser', eventName, 'failed', String(err));
    }
  };

  const fireServerEvent = async (eventName: string) => {
    if (!selectedPixel) return;

    try {
      // Use the new secure endpoint
      const res = await fetch('/api/send-capi-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pixel_id: selectedPixel.pixel_id,
          website_id: selectedPixel.id, // Pass website_id to lookup token
          event_name: eventName,
          user_data: { email: 'test@example.com' }
        })
      });

      const data = await res.json();
      setServerStatus({ code: res.status, message: data.message || data.error || res.statusText });

      if (res.ok) {
        addLog('Server', eventName, 'success', `Event ID: ${data.event_id}`);
      } else {
        addLog('Server', eventName, 'failed', data.error || 'Unknown error');
      }
    } catch (err) {
      setServerStatus({ code: 500, message: 'Network Error' });
      addLog('Server', eventName, 'failed', 'Network Error');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading tester...</div>;

  return (
    <div className="space-y-8">
      {/* 1️⃣ Top Header Section */}
      <header className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pixel Tester</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-slate-500 dark:text-slate-400">Active Pixel:</span>
              <div className="relative">
                <select
                  value={selectedPixel?.id || ''}
                  onChange={(e) => {
                    const pixel = websites.find(w => w.id === e.target.value);
                    setSelectedPixel(pixel || null);
                    setShowTokenManager(false); // Close manager on switch
                  }}
                  className="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-md py-1 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {websites.map(w => (
                    <option key={w.id} value={w.id}>{w.pixel_id} ({w.name})</option>
                  ))}
                  {websites.length === 0 && <option>No Pixels Found</option>}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 top-1.5 pointer-events-none" />
              </div>
              
              {selectedPixel && (
                <button
                  onClick={() => setShowTokenManager(!showTokenManager)}
                  className={`ml-2 px-3 py-1 text-xs font-medium rounded-md border transition-colors ${
                    showTokenManager 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {showTokenManager ? 'Hide Settings' : 'Configure Token'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${
            isPixelLoaded 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
          }`}>
            {isPixelLoaded ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {isPixelLoaded ? 'Active' : 'Not Detected'}
          </div>
        </div>
      </header>

      {/* Access Token Manager Section */}
      {showTokenManager && selectedPixel && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-200">
          <AccessTokenManager websiteId={selectedPixel.id} />
        </div>
      )}

      {/* 2️⃣ Main Testing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Browser Events Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
              <Globe className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Browser Events (Client-Side)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => fireBrowserEvent('PageView')}
              className="flex items-center justify-center gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
            >
              <Layout className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
              <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">PageView</span>
            </button>
            <button
              onClick={() => fireBrowserEvent('Lead')}
              className="flex items-center justify-center gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
            >
              <UserPlus className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
              <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Lead</span>
            </button>
            <button
              onClick={() => fireBrowserEvent('InitiateCheckout')}
              className="flex items-center justify-center gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
            >
              <ShoppingCart className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
              <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">InitiateCheckout</span>
            </button>
            <button
              onClick={() => fireBrowserEvent('Purchase')}
              className="flex items-center justify-center gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
            >
              <CheckCircle className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
              <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Purchase</span>
            </button>
          </div>
        </div>

        {/* Server Events Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg">
              <Server className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Server Events (CAPI)</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => fireServerEvent('Lead')}
                className="flex items-center justify-center gap-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium"
              >
                Send Test Lead
              </button>
              <button
                onClick={() => fireServerEvent('Purchase')}
                className="flex items-center justify-center gap-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium"
              >
                Send Test Purchase
              </button>
            </div>

            {/* Server Status Box */}
            <div className={`mt-6 p-4 rounded-lg border ${
              serverStatus 
                ? (serverStatus.code >= 200 && serverStatus.code < 300 
                  ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800')
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Server Response</span>
                {serverStatus && (
                  <span className={`text-xs font-mono font-bold ${
                    serverStatus.code >= 200 && serverStatus.code < 300 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    HTTP {serverStatus.code}
                  </span>
                )}
              </div>
              <p className={`text-sm ${
                serverStatus 
                  ? (serverStatus.code >= 200 && serverStatus.code < 300 
                    ? 'text-green-700 dark:text-green-300' 
                    : 'text-red-700 dark:text-red-300')
                  : 'text-slate-500 dark:text-slate-400 italic'
              }`}>
                {serverStatus ? serverStatus.message : 'Waiting for server event...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3️⃣ Real-Time Event Log */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            Event Log
          </h3>
          <button 
            onClick={() => setEvents([])}
            className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Clear Log
          </button>
        </div>
        
        <div className="h-64 overflow-y-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 sticky top-0 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-3 font-medium w-24">Time</th>
                <th className="px-6 py-3 font-medium w-24">Source</th>
                <th className="px-6 py-3 font-medium">Event</th>
                <th className="px-6 py-3 font-medium w-24">Status</th>
                <th className="px-6 py-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 italic">
                    No events fired yet. Click a button above to test.
                  </td>
                </tr>
              ) : (
                events.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">{log.time}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        log.source === 'Browser' 
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                          : 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                      }`}>
                        {log.source}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-medium text-slate-900 dark:text-slate-200">{log.event}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center gap-1 ${
                        log.status === 'success' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {log.status === 'success' ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {log.status === 'success' ? 'Success' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400 text-xs truncate max-w-xs" title={log.details}>
                      {log.details || '-'}
                    </td>
                  </tr>
                ))
              )}
              <tr ref={logEndRef} />
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔍 Live Traffic Monitor Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <MousePointerClick className="w-5 h-5 text-indigo-500" />
          Live Pixel Activity
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Script Status</p>
            <div className="flex items-center gap-2">
              {isPixelLoaded ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-slate-900 dark:text-white">Loaded</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium text-slate-900 dark:text-white">Not Detected</span>
                </>
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Last Event</p>
            <p className="font-medium text-slate-900 dark:text-white">
              {events.length > 0 ? events[events.length - 1].event : '-'}
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Last Event Time</p>
            <p className="font-medium text-slate-900 dark:text-white">
              {events.length > 0 ? events[events.length - 1].time : '-'}
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Session Events</p>
            <p className="font-medium text-slate-900 dark:text-white">{events.length}</p>
          </div>
        </div>

        {!isPixelLoaded && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center gap-3 text-yellow-800 dark:text-yellow-300 text-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p>
              Pixel script is not detected. Browser events will fail. Ensure your ad blocker is disabled for this page or check if the Pixel ID is valid.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
