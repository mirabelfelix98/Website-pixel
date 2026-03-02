import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Link as LinkIcon, AlertCircle, Globe, Activity, MousePointerClick, Plus } from 'lucide-react';
import HelpTooltip from '../components/ui/HelpTooltip';

export default function AddWebsite() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    destination_url: '',
    pixel_id: '',
    access_token: '',
    event_type: 'PageView',
    tracking_mode: 'auto',
    cta_config: [] as { label: string; url: string; event_type: string }[],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCTAChange = (index: number, field: string, value: string) => {
    const newConfig = [...formData.cta_config];
    // @ts-ignore
    newConfig[index] = { ...newConfig[index], [field]: value };
    setFormData({ ...formData, cta_config: newConfig });
  };

  const addCTA = () => {
    if (formData.cta_config.length < 3) {
      setFormData({
        ...formData,
        cta_config: [...formData.cta_config, { label: 'Click Here', url: '', event_type: 'Lead' }],
      });
    }
  };

  const removeCTA = (index: number) => {
    const newConfig = formData.cta_config.filter((_, i) => i !== index);
    setFormData({ ...formData, cta_config: newConfig });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to create website');

      await res.json();
      navigate('/library'); // Redirect to library after success
    } catch (err) {
      setError('Error creating website. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Add New Website</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Configure your tracking link and pixel settings.</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Block 1: Website Information */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Website Information
          </h2>
          <div className="grid gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                Website Name
                <HelpTooltip content="A friendly name for you to identify this link later (e.g., 'Summer Sale Campaign')." />
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                placeholder="My Store"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                Destination URL
                <HelpTooltip content="The actual website URL where you want visitors to land (e.g., https://myshop.com/product)." />
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-2.5 w-5 h-5 text-slate-400 dark:text-slate-500" />
                <input
                  type="url"
                  name="destination_url"
                  required
                  className="w-full pl-10 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                  placeholder="https://example.com"
                  value={formData.destination_url}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Block 2: Facebook Pixel Setup */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Facebook Pixel Setup
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                Pixel ID
                <HelpTooltip content="Your numeric Facebook Pixel ID found in Events Manager. We use this to fire events." />
              </label>
              <input
                type="text"
                name="pixel_id"
                required
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                placeholder="1234567890"
                value={formData.pixel_id}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                Access Token (Optional)
                <HelpTooltip content="Required for Server-Side (CAPI) events. Found in Events Manager > Settings." />
              </label>
              <input
                type="password"
                name="access_token"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                placeholder="EAA..."
                value={formData.access_token}
                onChange={handleChange}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                Default Event Type
                <HelpTooltip content="The event to fire when the page loads. 'PageView' is standard; 'Lead' or 'Purchase' are for specific goals." />
              </label>
              <select
                name="event_type"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                value={formData.event_type}
                onChange={handleChange}
              >
                <option value="PageView">PageView</option>
                <option value="ViewContent">ViewContent</option>
                <option value="Lead">Lead</option>
                <option value="Purchase">Purchase</option>
                <option value="Custom">Custom Event</option>
              </select>
            </div>
          </div>
        </div>

        {/* Block 3: Tracking Mode */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <MousePointerClick className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Tracking Mode
          </h2>
          
          <div className="flex items-center gap-4 mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="tracking_mode"
                value="auto"
                checked={formData.tracking_mode === 'auto'}
                onChange={handleChange}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-700 dark:text-slate-300 flex items-center">
                Track Page View Only (Auto Redirect)
                <HelpTooltip content="Automatically redirects the user after firing the pixel. Best for seamless tracking." />
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="tracking_mode"
                value="cta"
                checked={formData.tracking_mode === 'cta'}
                onChange={handleChange}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-700 dark:text-slate-300 flex items-center">
                Track CTA Click Before Redirect
                <HelpTooltip content="Shows a button the user must click to proceed. Good for filtering high-intent traffic." />
              </span>
            </label>
          </div>

          {formData.tracking_mode === 'cta' && (
            <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Configure up to 3 CTA buttons.</p>
              {formData.cta_config.map((cta, index) => (
                <div key={index} className="flex gap-4 items-end bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Button Text</label>
                    <input
                      type="text"
                      value={cta.label}
                      onChange={(e) => handleCTAChange(index, 'label', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Destination URL</label>
                    <input
                      type="url"
                      value={cta.url}
                      onChange={(e) => handleCTAChange(index, 'url', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      placeholder="https://"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCTA(index)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium pb-2"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {formData.cta_config.length < 3 && (
                <button
                  type="button"
                  onClick={addCTA}
                  className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add CTA Button
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-2"
          >
            {loading ? 'Generating...' : 'Generate Tracking Link'}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </div>
      </form>
    </div>
  );
}

