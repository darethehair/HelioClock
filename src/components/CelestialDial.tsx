import React, { useRef } from 'react';
import { Compass, Eye, Sparkles, Maximize2, Minimize2 } from 'lucide-react';
import { CurrentSolarPosition, SolarDayData, formatHours } from '../utils/solarCalculator';
import { useElementFullscreen } from '../hooks/useElementFullscreen';

interface CelestialDialProps {
  currentPos: CurrentSolarPosition;
  todayData: SolarDayData;
  minDaylight: number;
  maxDaylight: number;
}

export const CelestialDial: React.FC<CelestialDialProps> = ({
  currentPos,
  todayData,
  minDaylight,
  maxDaylight,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { isFullscreen, toggleFullscreen } = useElementFullscreen(containerRef);

  const { elevationDeg, azimuthDeg, twilightState, isDaytime, currentStandardHour } = currentPos;
  const { declinationDeg, equationOfTimeMin } = todayData;

  function getCardinalDirection(deg: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(((deg % 360) / 22.5)) % 16;
    return directions[index];
  }

  const twilightLabels: Record<string, { label: string; desc: string; color: string; border: string }> = {
    daylight: {
      label: 'True Daylight',
      desc: 'Sun above horizon (> -0.83°)',
      color: 'text-amber-950 bg-amber-100/90',
      border: 'border-amber-400',
    },
    civil: {
      label: 'Civil Twilight',
      desc: 'Sun between 0° and -6° (ambient daylight)',
      color: 'text-blue-950 bg-blue-100/90',
      border: 'border-blue-400',
    },
    nautical: {
      label: 'Nautical Twilight',
      desc: 'Sun between -6° and -12° (horizon visible)',
      color: 'text-indigo-950 bg-indigo-100/90',
      border: 'border-indigo-400',
    },
    astronomical: {
      label: 'Astronomical Twilight',
      desc: 'Sun between -12° and -18° (dark sky faint glow)',
      color: 'text-violet-950 bg-violet-100/90',
      border: 'border-violet-400',
    },
    night: {
      label: 'True Astronomical Night',
      desc: 'Sun below -18° (full darkness / deep space)',
      color: 'text-slate-900 bg-sky-200/70',
      border: 'border-sky-300',
    },
  };

  const currentTwilight = twilightLabels[twilightState] || twilightLabels.night;

  return (
    <div
      ref={containerRef}
      className={`fullscreen-module-card w-full bg-black rounded-2xl border border-slate-800 p-3 sm:p-5 shadow-2xl relative select-none transition-all ${
        isFullscreen
          ? 'fullscreen-module-active !rounded-none !p-4 !h-screen !w-screen flex flex-col justify-between overflow-y-auto z-[100]'
          : ''
      }`}
    >
      {/* Module Title Header & Individual Fullscreen Button */}
      <div className="flex items-center justify-between gap-3 mb-3 text-xs border-b border-slate-900 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white tracking-wide text-sm flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
            Celestial Dial & Sky Chart Planetarium Grid
          </span>
          <span className="text-slate-500 hidden sm:inline">·</span>
          <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">
            Atmospheric Twilight, Horizon Coordinates & Orbital Ephemeris
          </span>
        </div>

        {/* Dedicated Individual Module Fullscreen Toggle Button */}
        <button
          type="button"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit Celestial Dial Fullscreen (Esc)' : 'Maximize Celestial Dial to Fullscreen'}
          aria-label={isFullscreen ? 'Exit Celestial Dial Fullscreen' : 'Maximize Celestial Dial to Fullscreen'}
          className={`p-1.5 sm:p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
            isFullscreen
              ? 'bg-amber-500 text-black border-amber-300 hover:bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
              : 'bg-slate-900/90 hover:bg-slate-800 text-amber-400 hover:text-white border-slate-700/60 hover:border-amber-500/60 shadow-sm'
          }`}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 text-black stroke-[2.2]" />
          ) : (
            <Maximize2 className="w-4 h-4 text-amber-400 hover:text-white stroke-[2.2]" />
          )}
        </button>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-3 landscape:grid-cols-3 gap-3 ${isFullscreen ? 'flex-1 items-stretch' : ''}`}>
      {/* 1. Real-Time Horizon Elevation & Compass Azimuth (Small Data Card) */}
      <div className="p-4 rounded-xl bg-[#e0f2fe] border border-sky-300 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-700 mb-2">
          <span className="flex items-center gap-1.5 font-bold text-slate-900">
            <Compass className="w-4 h-4 text-amber-600" />
            Live Celestial Coordinates
          </span>
          <span className="font-mono text-slate-700 text-[11px] font-semibold">
            {formatHours(currentStandardHour, true)} Local
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 my-1">
          <div className="bg-white/80 p-2.5 rounded-lg border border-sky-200">
            <span className="text-[10px] text-slate-600 uppercase font-mono block font-bold">Sun Elevation</span>
            <span className={`text-xl font-bold font-mono ${elevationDeg >= 0 ? 'text-amber-700' : 'text-blue-800'}`}>
              {elevationDeg >= 0 ? `+${elevationDeg.toFixed(2)}°` : `${elevationDeg.toFixed(2)}°`}
            </span>
            <span className="text-[10px] text-slate-600 block mt-0.5 font-medium">
              {elevationDeg >= 0 ? 'Above Horizon' : 'Below Horizon'}
            </span>
          </div>

          <div className="bg-white/80 p-2.5 rounded-lg border border-sky-200">
            <span className="text-[10px] text-slate-600 uppercase font-mono block font-bold">Sun Azimuth</span>
            <span className="text-xl font-bold font-mono text-slate-950">
              {azimuthDeg.toFixed(1)}°
            </span>
            <span className="text-[10px] text-amber-700 font-mono block mt-0.5 font-bold">
              {getCardinalDirection(azimuthDeg)} Bearing
            </span>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-sky-200/80 flex items-center justify-between text-[11px] font-mono text-slate-700">
          <span>Horizon Crossing:</span>
          <span className="text-slate-950 font-bold">
            {isDaytime ? `Sunset in ${formatHours(todayData.sunset)}` : `Sunrise at ${formatHours(todayData.sunrise)}`}
          </span>
        </div>
      </div>

      {/* 2. Active Twilight Phase Status (Small Data Card) */}
      <div className="p-4 rounded-xl bg-[#e0f2fe] border border-sky-300 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-700 mb-2">
          <span className="flex items-center gap-1.5 font-bold text-slate-900">
            <Eye className="w-4 h-4 text-blue-700" />
            Current Sky Phase
          </span>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-600 font-bold">Atmosphere</span>
        </div>

        <div className={`p-3 rounded-lg border ${currentTwilight.border} ${currentTwilight.color} my-1`}>
          <div className="text-base font-bold flex items-center gap-2">
            <span>{currentTwilight.label}</span>
          </div>
          <p className="text-xs mt-1 font-semibold leading-relaxed">
            {currentTwilight.desc}
          </p>
        </div>

        <div className="mt-2 pt-2 border-t border-sky-200/80 flex items-center justify-between text-[11px] font-mono text-slate-700">
          <span>Dark Sky Threshold:</span>
          <span className="text-violet-900 font-bold">-18.0° Solar Altitude</span>
        </div>
      </div>

      {/* 3. Astronomical Ephemeris Constants (Small Data Card) */}
      <div className="p-4 rounded-xl bg-[#e0f2fe] border border-sky-300 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-700 mb-2">
          <span className="flex items-center gap-1.5 font-bold text-slate-900">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            Orbital Calibration
          </span>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-600 font-bold">Jean Meeus</span>
        </div>

        <div className="space-y-1.5 text-xs font-mono my-1">
          <div className="flex items-center justify-between py-1 px-2 rounded bg-white/80 border border-sky-200">
            <span className="text-slate-700 font-medium">Solar Declination (δ):</span>
            <span className="text-slate-950 font-bold">{declinationDeg.toFixed(2)}°</span>
          </div>

          <div className="flex items-center justify-between py-1 px-2 rounded bg-white/80 border border-sky-200">
            <span className="text-slate-700 font-medium">Equation of Time (EoT):</span>
            <span className={`font-bold ${equationOfTimeMin >= 0 ? 'text-amber-700' : 'text-blue-800'}`}>
              {equationOfTimeMin >= 0 ? `+${equationOfTimeMin.toFixed(1)}m` : `${equationOfTimeMin.toFixed(1)}m`}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 px-2 rounded bg-white/80 border border-sky-200">
            <span className="text-slate-700 font-medium">Annual Daylight Range:</span>
            <span className="text-emerald-900 font-bold">
              {minDaylight.toFixed(1)}h – {maxDaylight.toFixed(1)}h
            </span>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-sky-200/80 flex items-center justify-between text-[11px] font-mono text-slate-700">
          <span>Solstice Spread:</span>
          <span className="text-emerald-950 font-bold">
            Δ {(maxDaylight - minDaylight).toFixed(2)} hours
          </span>
        </div>
      </div>
    </div>
  </div>
  );
};
