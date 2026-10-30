import React from 'react';
import { Sunrise, Sunset, Sun, Moon, Clock, TrendingDown, TrendingUp } from 'lucide-react';
import {
  SolarDayData,
  CurrentSolarPosition,
  formatHours,
  formatDuration,
  formatDurationPrecise,
  formatDaylightDelta,
} from '../utils/solarCalculator';
import { MoonPhaseCard } from './MoonPhaseCard';

interface DashboardCardsProps {
  todayData: SolarDayData;
  currentPos: CurrentSolarPosition;
  daylightDeltaSeconds?: number;
  currentDate: Date;
  latitude: number;
  longitude: number;
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({
  todayData,
  currentPos,
  daylightDeltaSeconds,
  currentDate,
  latitude,
  longitude,
}) => {
  const { sunrise, sunset, solarNoon, solarNadir, daylightHours, civilDawn, civilDusk, isPolarDay, isPolarNight } = todayData;
  const { elevationDeg, isDaytime, daylightProgress } = currentPos;

  const nightHours = Math.max(0, 24 - daylightHours);

  return (
    <div className="w-full">
      {/* 6 Individual Ephemeris Cards (Solar + Lunar) with Soft Light-Blue Background Accent */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {/* Card 1: Sunrise */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-[#e0f2fe] border border-sky-300 shadow-sm relative overflow-hidden group hover:border-sky-400 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-1 font-medium">
              <span className="flex items-center gap-1.5 text-amber-800 font-bold">
                <Sunrise className="w-4 h-4 text-amber-600 shrink-0" />
                Sunrise
              </span>
              <span className="text-[11px] font-mono text-slate-700 font-semibold">Dawn</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-950 tabular-nums">
              {isPolarDay ? '24h Sun' : isPolarNight ? 'No Rise' : formatHours(sunrise)}
            </div>
          </div>
          <div className="mt-1.5 text-[11px] font-mono text-slate-700 flex items-center justify-between font-medium">
            <span>Civil Dawn:</span>
            <span className="text-slate-950 font-bold">{formatHours(civilDawn)}</span>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-400/15 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Card 2: Solar Peak (Transit) */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-[#e0f2fe] border border-sky-300 shadow-sm relative overflow-hidden group hover:border-sky-400 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-1 font-medium">
              <span className="flex items-center gap-1.5 text-amber-800 font-bold">
                <Sun className="w-4 h-4 text-amber-600 shrink-0" />
                Solar Peak
              </span>
              <span className="text-[11px] font-mono text-slate-700 font-semibold">Transit</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-950 tabular-nums">
              {formatHours(solarNoon)}
            </div>
          </div>
          <div className="mt-1.5 text-[11px] font-mono text-slate-700 flex items-center justify-between font-medium">
            <span>Current Alt:</span>
            <span className={`font-bold ${elevationDeg >= 0 ? 'text-amber-700' : 'text-blue-700'}`}>
              {elevationDeg.toFixed(1)}°
            </span>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-400/15 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Card 3: Sunset */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-[#e0f2fe] border border-sky-300 shadow-sm relative overflow-hidden group hover:border-sky-400 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-1 font-medium">
              <span className="flex items-center gap-1.5 text-orange-800 font-bold">
                <Sunset className="w-4 h-4 text-orange-600 shrink-0" />
                Sunset
              </span>
              <span className="text-[11px] font-mono text-slate-700 font-semibold">Dusk</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-950 tabular-nums">
              {isPolarDay ? '24h Sun' : isPolarNight ? 'No Set' : formatHours(sunset)}
            </div>
          </div>
          <div className="mt-1.5 text-[11px] font-mono text-slate-700 flex items-center justify-between font-medium">
            <span>Civil Dusk:</span>
            <span className="text-slate-950 font-bold">{formatHours(civilDusk)}</span>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-orange-400/15 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Card 4: Solar Nadir (Anti-Transit) */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-[#e0f2fe] border border-sky-300 shadow-sm relative overflow-hidden group hover:border-sky-400 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-1 font-medium">
              <span className="flex items-center gap-1.5 text-blue-900 font-bold">
                <Moon className="w-4 h-4 text-blue-700 shrink-0" />
                Solar Nadir
              </span>
              <span className="text-[11px] font-mono text-slate-700 font-semibold">Anti-Transit</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-950 tabular-nums">
              {formatHours(solarNadir)}
            </div>
          </div>
          <div className="mt-1.5 text-[11px] font-mono text-slate-700 flex items-center justify-between font-medium">
            <span>Night Span:</span>
            <span className="text-slate-950 font-bold">{formatDuration(nightHours)}</span>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/15 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Card 5: Daylight Length */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-[#e0f2fe] border border-emerald-400 shadow-sm relative overflow-hidden group hover:border-emerald-500 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <span className="flex items-center gap-1.5 text-emerald-900 font-bold">
                <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                Daylight Length
              </span>
              <span className="text-[11px] font-mono text-emerald-800 font-bold">
                {((daylightHours / 24) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-emerald-950 tabular-nums">
              {formatDurationPrecise(daylightHours)}
            </div>
            <div className="mt-1 text-[11px] font-mono text-slate-700 flex items-center justify-between font-medium">
              <span>Decimal:</span>
              <span className="text-emerald-900 font-bold">{daylightHours.toFixed(2)} hrs</span>
            </div>
          </div>

          <div>
            {/* Compact High-Contrast Daylight Delta Metric Line */}
            {daylightDeltaSeconds !== undefined && (
              <div className="mt-2 pt-1.5 border-t border-sky-300/80 flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-1 text-slate-800 font-bold text-[10px] sm:text-[11px]">
                  {daylightDeltaSeconds >= 0 ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  )}
                  Delta:
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-bold tracking-tight shadow-xs font-mono ${
                  daylightDeltaSeconds >= 0
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-slate-950 text-amber-300 border border-slate-800'
                }`}>
                  {formatDaylightDelta(daylightDeltaSeconds)}
                </span>
              </div>
            )}

            {/* Live daylight progress line */}
            <div className="w-full bg-sky-200/90 rounded-full h-1 mt-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${isDaytime ? 'bg-emerald-600' : 'bg-slate-400'}`}
                style={{ width: `${Math.round((isDaytime ? daylightProgress : 1) * 100)}%` }}
              />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-400/20 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Card 6: Realistic Moon Phase & Limb Tilt Tracking Card with Fullscreen */}
        <MoonPhaseCard
          currentDate={currentDate}
          latitude={latitude}
          longitude={longitude}
        />
      </div>
    </div>
  );
};
