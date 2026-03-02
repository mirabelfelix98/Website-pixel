import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Save, Trash2, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

interface AccessTokenManagerProps {
  websiteId: string;
  onStatusChange?: (hasToken: boolean) => void;
}

export default function AccessTokenManager({ websiteId, onStatusChange }: AccessTokenManagerProps) {
  const [token, setToken] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState<'loading' | 'connected' | 'not_set' | 'error'>('loading');
  const [last4, setLast4] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    checkStatus();
  }, [websiteId]);

  const checkStatus = async () => {
    try {
      const res = await fetch(`/api/websites/${websiteId}/token-status`);
      const data = await res.json();
      if (data.hasToken) {
        setStatus('connected');
        setLast4(data.last4);
        onStatusChange?.(true);
      } else {
        setStatus('not_set');
        onStatusChange?.(false);
      }
    } catch (err) {
      setStatus('error');
    }
  };

  const handleSave = async () => {
    if (!token) return;
    
    try {
      const res = await fetch(`/api/websites/${websiteId}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'Token saved securely.' });
        setToken(''); // Clear input
        checkStatus();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save token.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error.' });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove this access token? CAPI events will stop working.')) return;

    try {
      const res = await fetch(`/api/websites/${websiteId}/token`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'Token removed.' });
        setStatus('not_set');
        setLast4(null);
        onStatusChange?.(false);
      } else {
        setMessage({ type: 'error', text: 'Failed to remove token.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error.' });
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
          <Key className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">Access Token Manager</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Securely store your Meta CAPI Access Token</p>
        </div>
        <div className="ml-auto">
          {status === 'connected' && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
              <ShieldCheck className="w-3 h-3" />
              Securely Connected
            </span>
          )}
          {status === 'not_set' && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              <AlertTriangle className="w-3 h-3" />
              Not Configured
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {status === 'connected' && (
          <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 dark:text-slate-400">Current Token:</span>
              <code className="text-sm font-mono text-slate-900 dark:text-white">
                ••••••••••••••••••••••••{last4}
              </code>
            </div>
            <button 
              onClick={handleDelete}
              className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Remove
            </button>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {status === 'connected' ? 'Update Access Token' : 'Paste Your Access Token Here'}
          </label>
          <div className="relative">
            <input
              type={isVisible ? 'text' : 'password'}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="EAA..."
              className="w-full pl-4 pr-12 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => setIsVisible(!isVisible)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {message && (
          <div className={`text-sm flex items-center gap-2 ${
            message.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {message.text}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={!token}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {status === 'connected' ? 'Update Token' : 'Save Token'}
          </button>
        </div>
      </div>
    </div>
  );
}
