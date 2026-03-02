import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, AlertCircle, CheckCircle, Globe, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [devLink, setDevLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    setDevLink('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setStatus('success');
      setMessage(data.message);
      if (data.devLink) setDevLink(data.devLink);
    } catch (err) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800">
        <div className="p-8">
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-2xl">
              <Globe className="w-8 h-8" />
              <span>PixelControl</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-2">Reset Password</h2>
          <p className="text-slate-500 dark:text-slate-400 text-center mb-8">Enter your email to receive instructions</p>

          {status === 'success' ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-4 rounded-lg border border-green-100 dark:border-green-800">
                <p>{message}</p>
                {devLink && (
                  <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                    <p className="text-xs font-bold uppercase mb-1">Dev Environment Only:</p>
                    <Link to={devLink} className="text-indigo-600 dark:text-indigo-400 underline break-all">
                      Click here to reset password
                    </Link>
                  </div>
                )}
              </div>
              <Link to="/login" className="block text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {status === 'error' && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg flex items-center gap-2 text-sm border border-red-100 dark:border-red-800">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {message}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-5 h-5 text-slate-400 dark:text-slate-500" />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white py-2.5 rounded-lg font-semibold shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
              >
                {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
                {status !== 'loading' && <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="text-center">
                <Link to="/login" className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center gap-1 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
