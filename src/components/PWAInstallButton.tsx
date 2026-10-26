import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Hide if already running as installed standalone PWA
  if (isInstalled) {
    return null;
  }

  // Android / Chromium native install prompt
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold shadow-md shadow-amber-500/10 active:scale-95 transition"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:text-white text-xs font-medium active:scale-95 transition"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span>Install PWA</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-950 border border-slate-800 p-5 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-semibold text-white">Install HelioClock</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-4 space-y-3 text-xs text-slate-300">
                <p>Install this astronomical solar clock directly to your home screen for instant offline access:</p>
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <Share2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>1. Tap the <strong>Share</strong> button in your browser toolbar.</span>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <PlusSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>2. Scroll down and select <strong>Add to Home Screen</strong>.</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback direct button for browsers where prompt isn't fired yet
  return (
    <button
      onClick={() => {
        alert('To install HelioClock on Android: Tap the three dots (⋮) in Chrome and select "Install app" or "Add to Home screen".');
      }}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-200 hover:text-white text-xs font-mono font-medium active:scale-95 transition"
      title="Install HelioClock PWA to Home Screen"
    >
      <Download className="w-3.5 h-3.5 text-amber-400" />
      <span>Install PWA</span>
    </button>
  );
};
