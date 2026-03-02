import React from 'react';
import { BookOpen, Globe, MousePointerClick, Activity, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HowToUse() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-slate-900">How to Use PixelControl</h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto">
          A step-by-step guide to tracking your external websites and optimizing your Facebook Ads.
        </p>
      </div>

      {/* Quick Start Steps */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-50 rounded-full blur-2xl" />
          <div className="relative">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4 font-bold text-xl">1</div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Add Website</h3>
            <p className="text-slate-600 text-sm">
              Enter your destination URL and your Facebook Pixel ID. Choose your event type (e.g., Lead, Purchase).
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-50 rounded-full blur-2xl" />
          <div className="relative">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4 font-bold text-xl">2</div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Get Link</h3>
            <p className="text-slate-600 text-sm">
              We generate a unique tracking link (e.g., yourdomain.com/go/xyz). Copy this link from your library.
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-green-50 rounded-full blur-2xl" />
          <div className="relative">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4 font-bold text-xl">3</div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Run Ads</h3>
            <p className="text-slate-600 text-sm">
              Use the tracking link as the "Destination URL" in your Facebook Ad. We handle the pixel firing automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Guide */}
      <div className="space-y-8">
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <Globe className="w-6 h-6 text-indigo-600" />
              Adding a Website & Pixel
            </h2>
          </div>
          <div className="p-8 space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">1</div>
              <div>
                <h4 className="font-semibold text-slate-900">Destination URL</h4>
                <p className="text-slate-600 mt-1">
                  This is the actual website you want people to visit (e.g., an affiliate link, a store page, or a blog post).
                  <br />
                  <span className="text-sm text-slate-500 italic">Example: https://myshop.com/product-123</span>
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">2</div>
              <div>
                <h4 className="font-semibold text-slate-900">Facebook Pixel ID</h4>
                <p className="text-slate-600 mt-1">
                  This is a numeric ID found in your Facebook Events Manager. It allows Facebook to track who visits your page.
                  <br />
                  <span className="text-sm text-slate-500 italic">Example: 123456789012345</span>
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">3</div>
              <div>
                <h4 className="font-semibold text-slate-900">Event Type</h4>
                <p className="text-slate-600 mt-1">
                  Choose what signal to send to Facebook.
                </p>
                <ul className="mt-2 space-y-1 text-sm text-slate-600 list-disc pl-4">
                  <li><strong>PageView:</strong> Basic tracking, good for general traffic.</li>
                  <li><strong>ViewContent:</strong> Good for product pages.</li>
                  <li><strong>Lead:</strong> Use this if you are tracking signups.</li>
                  <li><strong>Purchase:</strong> Use this if you are tracking sales.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <MousePointerClick className="w-6 h-6 text-purple-600" />
              Tracking Modes Explained
            </h2>
          </div>
          <div className="p-8 grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Auto Redirect (Recommended)</h3>
              <p className="text-slate-600 mb-4">
                The user clicks your ad, sees a brief "Redirecting..." screen for less than a second, and lands on the destination.
              </p>
              <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600">
                <strong>Best for:</strong> Seamless user experience, high conversion rates, and general traffic tracking.
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">CTA Button Interstitial</h3>
              <p className="text-slate-600 mb-4">
                The user lands on a page with buttons (e.g., "Continue to Store"). They must click a button to proceed.
              </p>
              <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600">
                <strong>Best for:</strong> Filtering low-quality traffic, confirming intent, or routing to different offers (e.g., "Buy on Amazon" vs "Buy on Website").
              </div>
            </div>
          </div>
        </section>

        <section className="bg-indigo-900 rounded-2xl shadow-xl overflow-hidden text-white">
          <div className="p-8">
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
              <Activity className="w-6 h-6 text-indigo-300" />
              Pro Tips for Ad Optimization
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-indigo-200 mb-2">1. Verify Your Pixel</h4>
                <p className="text-indigo-100/80 text-sm">
                  Use the "Facebook Pixel Helper" Chrome extension to verify that your tracking link fires the correct event before running ads.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-indigo-200 mb-2">2. Use Custom Events</h4>
                <p className="text-indigo-100/80 text-sm">
                  If you run multiple campaigns, use "Custom Events" to distinguish traffic sources in your Facebook Events Manager.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-indigo-200 mb-2">3. Monitor Drop-off</h4>
                <p className="text-indigo-100/80 text-sm">
                  If using CTA mode, monitor how many people view the page vs. click the button. A low click rate might mean your ad promise doesn't match the landing page.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-indigo-200 mb-2">4. Domain Verification</h4>
                <p className="text-indigo-100/80 text-sm">
                  For best results with Facebook Aggregated Event Measurement, consider using a custom domain for your tracking links (Advanced).
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="flex justify-center pt-8">
        <Link 
          to="/add" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-indigo-200 transition-all flex items-center gap-2 hover:scale-105"
        >
          Create Your First Tracking Link
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
