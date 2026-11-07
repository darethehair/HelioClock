import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Sun,
  Pause,
  RotateCcw,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Sliders,
} from 'lucide-react';

export interface PersistentTimeControlBarProps {
  currentDate: Date;
  isLiveTrack: boolean;
  onToggleLiveTrack: (enableLive: boolean) => void;
  onUpdateDateTime: (newDate: Date) => void;
  onResetToLiveNow: () => void;
}

export const PersistentTimeControlBar: React.FC<PersistentTimeControlBarProps> = ({
  currentDate,
  isLiveTrack,
  onToggleLiveTrack,
  onUpdateDateTime,
  onResetToLiveNow,
}) => {
  // Track native fullscreen DOM target for createPortal integration
  const [fullscreenTarget, setFullscreenTarget] = useState<Element | null>(null);
  const [showScrubber, setShowScrubber] = useState<boolean>(false);

  // Monitor fullscreen changes so the bar is injected into element-level fullscreen viewports
  useEffect(() => {
    const updateFullscreenElement = () => {
      const doc = document as any;
      const fsEl =
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement;

      if (fsEl && fsEl !== document.documentElement) {
        setFullscreenTarget(fsEl);
      } else {
        setFullscreenTarget(null);
      }
    };

    document.addEventListener('fullscreenchange', updateFullscreenElement);
    document.addEventListener('webkitfullscreenchange', updateFullscreenElement);
    document.addEventListener('mozfullscreenchange', updateFullscreenElement);
    document.addEventListener('MSFullscreenChange', updateFullscreenElement);

    return () => {
      document.removeEventListener('fullscreenchange', updateFullscreenElement);
      document.removeEventListener('webkitfullscreenchange', updateFullscreenElement);
      document.removeEventListener('mozfullscreenchange', updateFullscreenElement);
      document.removeEventListener('MSFullscreenChange', updateFullscreenElement);
    };
  }, []);

  // Format date to local HTML5 datetime-local string (YYYY-MM-DDTHH:mm)
  const datetimeLocalValue = useMemo(() => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const y = currentDate.getFullYear();
    const m = pad(currentDate.getMonth() + 1);
    const d = pad(currentDate.getDate());
    const h = pad(currentDate.getHours());
    const min = pad(currentDate.getMinutes());
    return `${y}-${m}-${d}T${h}:${min}`;
  }, [currentDate]);

  // Formatted seconds and time string for real-time live clock feedback
  const formattedTimeWithSeconds = useMemo(() => {
    return currentDate.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  }, [currentDate]);

  // Step helper functions
  const handleStepHours = useCallback(
    (deltaHours: number) => {
      const next = new Date(currentDate.getTime() + deltaHours * 3600000);
      onUpdateDateTime(next);
    },
    [currentDate, onUpdateDateTime]
  );

  const handleStepDays = useCallback(
    (deltaDays: number) => {
      const next = new Date(currentDate.getTime() + deltaDays * 86400000);
      onUpdateDateTime(next);
    },
    [currentDate, onUpdateDateTime]
  );

  // Intraday minutes scrubber (0 to 1439)
  const currentMinutes = useMemo(() => {
    return currentDate.getHours() * 60 + currentDate.getMinutes();
  }, [currentDate]);

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const mins = parseInt(e.target.value, 10);
      const hours = Math.floor(mins / 60);
      const remMins = mins % 60;
      const next = new Date(currentDate.getTime());
      next.setHours(hours, remMins, 0, 0);
      onUpdateDateTime(next);
    },
    [currentDate, onUpdateDateTime]
  );

  // Handle direct datetime-local input changes
  const handleDatetimeInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (!val) return;
      const parsed = new Date(val);
      if (!isNaN(parsed.getTime())) {
        // Retain original seconds
        parsed.setSeconds(currentDate.getSeconds());
        onUpdateDateTime(parsed);
      }
    },
    [currentDate, onUpdateDateTime]
  );

  const barContent = (
    <div
      className="time-control-bar"
      role="region"
      aria-label="Celestial Time Adjustment Controls"
    >
      <div className="flex items-center justify-between gap-2 sm:gap-3 w-full max-w-7xl mx-auto flex-wrap sm:flex-nowrap">
        {/* Left Zone: Live Track status toggle & Reset to Now */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onToggleLiveTrack(!isLiveTrack)}
            title={
              isLiveTrack
                ? 'Switch to simulation time (pause live device clock)'
                : 'Resume live tracking (sync with device clock)'
            }
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-mono text-xs font-bold transition-all border cursor-pointer active:scale-95 ${
              isLiveTrack
                ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
            }`}
          >
            {isLiveTrack ? (
              <>
                <Sun className="w-3.5 h-3.5 text-emerald-400 animate-[spin_30s_linear_infinite]" />
                <span className="hidden xs:inline">Live Track</span>
                <span className="xs:hidden">Live</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xs:inline">Sim Mode</span>
                <span className="xs:hidden">Sim</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onResetToLiveNow}
            title="Reset to current real-time moment & GPS coordinates"
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg font-mono text-xs font-semibold bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 hover:text-white border border-slate-700/80 hover:border-slate-600 transition-all cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Now</span>
          </button>

          {/* Toggle mini 24h scrubber */}
          <button
            type="button"
            onClick={() => setShowScrubber((prev) => !prev)}
            title={showScrubber ? 'Hide 24h slider' : 'Show 24h intraday scrubber slider'}
            className={`p-1.5 rounded-lg border font-mono text-xs transition-all cursor-pointer active:scale-95 ${
              showScrubber
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center Zone: Step Buttons & DateTime Picker */}
        <div className="flex items-center justify-center gap-1 sm:gap-1.5 flex-1 min-w-[260px]">
          {/* Step Back Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleStepDays(-1)}
              title="Step backward 1 day (-24 hours)"
              aria-label="Step backward 1 day"
              className="px-1.5 sm:px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border border-slate-700 font-mono text-[11px] font-bold transition active:scale-95 cursor-pointer flex items-center gap-0.5"
            >
              <ChevronsLeft className="w-3 h-3 text-slate-400" />
              <span>1d</span>
            </button>
            <button
              type="button"
              onClick={() => handleStepHours(-1)}
              title="Step backward 1 hour (-60 minutes)"
              aria-label="Step backward 1 hour"
              className="px-1.5 sm:px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border border-slate-700 font-mono text-[11px] font-bold transition active:scale-95 cursor-pointer flex items-center gap-0.5"
            >
              <ChevronLeft className="w-3 h-3 text-slate-400" />
              <span>1h</span>
            </button>
          </div>

          {/* DateTime Picker Input */}
          <div className="relative flex items-center">
            <input
              type="datetime-local"
              value={datetimeLocalValue}
              onChange={handleDatetimeInputChange}
              title="Fine-tune simulated date and time"
              aria-label="Simulation date and time"
              className="bg-slate-900/95 hover:bg-slate-900 text-slate-100 font-mono text-xs sm:text-[13px] font-semibold px-2 py-1 sm:py-1.5 rounded-lg border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition shadow-inner w-[165px] sm:w-[190px]"
            />
          </div>

          {/* Step Forward Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleStepHours(1)}
              title="Step forward 1 hour (+60 minutes)"
              aria-label="Step forward 1 hour"
              className="px-1.5 sm:px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border border-slate-700 font-mono text-[11px] font-bold transition active:scale-95 cursor-pointer flex items-center gap-0.5"
            >
              <span>1h</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </button>
            <button
              type="button"
              onClick={() => handleStepDays(1)}
              title="Step forward 1 day (+24 hours)"
              aria-label="Step forward 1 day"
              className="px-1.5 sm:px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border border-slate-700 font-mono text-[11px] font-bold transition active:scale-95 cursor-pointer flex items-center gap-0.5"
            >
              <span>1d</span>
              <ChevronsRight className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Right Zone: Live Digital Seconds Display */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 border border-slate-800 font-mono text-xs text-amber-300 font-bold shadow-inner">
            <Clock className="w-3 h-3 text-amber-400/80" />
            <span>{formattedTimeWithSeconds}</span>
          </div>
        </div>
      </div>

      {/* Expandable 24-Hour Intraday Scrubber Slider */}
      {showScrubber && (
        <div className="w-full max-w-3xl mx-auto pt-2 pb-0.5 flex items-center gap-3 animate-fadeIn">
          <span className="font-mono text-[10px] text-slate-400 font-bold shrink-0">00:00</span>
          <input
            type="range"
            min={0}
            max={1439}
            step={1}
            value={currentMinutes}
            onChange={handleSliderChange}
            aria-label="24-hour time of day scrubber"
            className="flex-1 accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer transition-all"
          />
          <span className="font-mono text-[10px] text-slate-400 font-bold shrink-0">23:59</span>
        </div>
      )}
    </div>
  );

  // If inside an element-level fullscreen target, portal into it so native compositing renders it;
  // otherwise render as normal viewport-fixed element.
  if (fullscreenTarget) {
    return createPortal(barContent, fullscreenTarget);
  }

  return barContent;
};
