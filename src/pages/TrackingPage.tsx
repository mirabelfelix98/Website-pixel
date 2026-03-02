import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Website } from '../types';
import { Loader2 } from 'lucide-react';

declare global {
  interface Window {
    fbq: any;
  }
}

export default function TrackingPage() {
  const { id } = useParams();
  const [website, setWebsite] = useState<Website | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    // Fetch website details
    fetch(`/api/websites/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Website not found');
        return res.json();
      })
      .then((data) => {
        setWebsite(data);
        setLoading(false);
        
        // Initialize Pixel
        initPixel(data.pixel_id);
        
        // Track View
        fetch(`/api/websites/${id}/track`, { method: 'POST' });

        // Fire Event
        if (window.fbq) {
          window.fbq('track', data.event_type);
        }

        // Auto Redirect if mode is 'auto'
        if (data.tracking_mode === 'auto') {
          setTimeout(() => {
            window.location.href = data.destination_url;
          }, 500); // 500ms delay for pixel to fire
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Invalid tracking link');
        setLoading(false);
      });
  }, [id]);

  const initPixel = (pixelId: string) => {
    if (window.fbq) {
      window.fbq('init', pixelId);
    } else {
      // Inject Facebook Pixel Code
      if (document.getElementById('fb-pixel')) return;

      const script = document.createElement('script');
      script.id = 'fb-pixel';
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelId}');
      `;
      document.head.appendChild(script);
    }
  };

  const handleCTAClick = (url: string, eventType: string) => {
    if (window.fbq) {
      window.fbq('track', eventType);
    }
    // Small delay to ensure pixel fires
    setTimeout(() => {
      window.location.href = url;
    }, 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <h2 className="text-xl font-medium text-slate-700">Redirecting...</h2>
      </div>
    );
  }

  if (error || !website) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-slate-600">{error || 'Website not found'}</p>
        </div>
      </div>
    );
  }

  // CTA Mode UI
  if (website.tracking_mode === 'cta') {
    const ctaButtons = JSON.parse(website.cta_config || '[]');
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{website.name}</h1>
          <p className="text-slate-500 mb-8">Please select an option to continue:</p>
          
          <div className="space-y-4">
            {ctaButtons.map((btn: any, idx: number) => (
              <button
                key={idx}
                onClick={() => handleCTAClick(btn.url, btn.event_type || 'Lead')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                {btn.label}
              </button>
            ))}
            
            {/* Fallback/Main destination button if no CTAs configured or as extra option */}
            {ctaButtons.length === 0 && (
               <button
               onClick={() => handleCTAClick(website.destination_url, 'ViewContent')}
               className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
             >
               Continue to Website
             </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Auto Mode UI (Redirecting)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
      <h2 className="text-xl font-medium text-slate-700">Redirecting to {website.name}...</h2>
    </div>
  );
}
