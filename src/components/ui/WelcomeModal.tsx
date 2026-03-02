import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Map } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
}

export default function WelcomeModal({ isOpen, onClose, onStartTour }: WelcomeModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="bg-indigo-600 p-6 text-white">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-white/10 rounded-xl inline-block mb-4">
                  <Map className="w-8 h-8 text-white" />
                </div>
                <button 
                  onClick={onClose}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h2 className="text-2xl font-bold">Welcome to PixelControl</h2>
              <p className="text-indigo-100 mt-2">
                Your command center for tracking external websites with Facebook Pixels.
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <p className="text-slate-600">
                  This platform helps you:
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                    Track visitors on websites you don't own
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                    Fire Facebook Pixel events reliably
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                    Manage all your tracking links in one place
                  </li>
                </ul>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={onStartTour}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-indigo-200"
                >
                  Start Guided Tour
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-3 text-slate-500 hover:text-slate-700 font-medium transition-colors"
                >
                  Skip for Now
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
