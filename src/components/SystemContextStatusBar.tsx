import React from 'react';
import { Calendar, Clock, MapPin, Globe } from 'lucide-react';
import { formatUtcOffset } from '../utils/solarCalculator';

interface SystemContextStatusBarProps {
  currentDate: Date;
  latitude: number;
  longitude: number;
  utcOffsetHours: number;
  isLiveTrack: boolean;
  isCustomCoordinates?: boolean;
}

export const SystemContextStatusBar: React.FC<SystemContextStatusBarProps> = ({
  currentDate,
  latitude,
  longitude,
  utcOffsetHours,
  isLiveTrack,
  isCustomCoordinates = false,
}) => {
  // 1. Simulation Date: Displaying active day, month, and year (e.g., "October 27, 2026")
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // 2. Simulation Time: Displaying active wall-clock hour and minute in 24-hour format (e.g., "07:30" or "16:51")
  const hours = currentDate.getHours().toString().padStart(2, '0');
  const minutes = currentDate.getMinutes().toString().padStart(2, '0');
  const formattedTime = `${hours}:${minutes}`;

  // 3. Active Location: Displaying exact center coordinates (e.g., "Location: 49.19° N, 98.10° W")
  const latDir = latitude >= 0 ? 'N' : 'S';
  const lonDir = longitude >= 0 ? 'E' : 'W';
  const latStr = `${Math.abs(latitude).toFixed(2)}° ${latDir}`;
  const lonStr = `${Math.abs(longitude).toFixed(2)}° ${lonDir}`;
  const formattedLocation = `Location: ${latStr}, ${lonStr}`;

  // 4. Timezone Offset: Displaying dynamic timezone label and UTC offset (e.g., "Zone: Morden, MB (UTC-5)")
  const isNearMorden = Math.abs(latitude - 49.19) < 0.25 && Math.abs(longitude - (-98.10)) < 0.25;
  let zoneLabel = 'Morden, MB';
  if (!isNearMorden && isCustomCoordinates) {
    zoneLabel = 'Custom Grid';
  }
  const calculatedOffset = formatUtcOffset(utcOffsetHours);
  const formattedTimezone = `Zone: ${zoneLabel} (UTC${calculatedOffset})`;

  return (
    <div
      role="region"
      aria-label="System Context Status Bar"
      className="system-context-status-bar w-full rounded-xl border border-sky-300/35 bg-[#e0f2fe]/[0.06] backdrop-blur-md px-3.5 sm:px-5 py-2.5 shadow-sm transition-colors duration-200"
    >
      <div className="flex flex-wrap items-center justify-between sm:justify-center gap-x-4 sm:gap-x-7 lg:gap-x-9 gap-y-2 text-[11px] font-mono font-normal tracking-tight text-slate-300">
        {/* Metric 1: Simulation Date */}
        <div className="system-status-item flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="text-slate-400 font-normal">Simulation Date:</span>
          <span className="text-sky-200 font-normal">{formattedDate}</span>
        </div>

        <span className="hidden sm:inline text-sky-400/30 select-none font-light" aria-hidden="true">
          ·
        </span>

        {/* Metric 2: Simulation Time */}
        <div className="system-status-item flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="text-slate-400 font-normal">Simulation Time:</span>
          <span className="text-sky-200 font-normal">{formattedTime}</span>
        </div>

        <span className="hidden sm:inline text-sky-400/30 select-none font-light" aria-hidden="true">
          ·
        </span>

        {/* Metric 3: Active Location */}
        <div className="system-status-item flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="text-slate-400 font-normal">Active Location:</span>
          <span className="text-sky-200 font-normal">{formattedLocation}</span>
        </div>

        <span className="hidden sm:inline text-sky-400/30 select-none font-light" aria-hidden="true">
          ·
        </span>

        {/* Metric 4: Timezone Offset */}
        <div className="system-status-item flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="text-slate-400 font-normal">Timezone Offset:</span>
          <span className="text-sky-200 font-normal">{formattedTimezone}</span>
        </div>

        {/* Dynamic Mode Sync Indicator Tag */}
        <div className="system-status-item flex items-center gap-1.5 pl-1 sm:pl-2">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              isLiveTrack ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
            }`}
          />
          <span
            className={`text-[10px] font-mono ${
              isLiveTrack ? 'text-emerald-300' : 'text-amber-300'
            }`}
          >
            {isLiveTrack ? 'Live Sync' : 'Simulated'}
          </span>
        </div>
      </div>
    </div>
  );
};
