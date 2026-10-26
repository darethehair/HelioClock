import React from 'react';
import { Compass, RotateCw, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatUtcOffset, getSystemTimeZoneId } from '../utils/solarCalculator';

interface LocationBannerProps {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
  utcOffsetHours: number;
  isLiveGps: boolean;
  isCustomCoordinates?: boolean;
  isLiveTrack?: boolean;
  onRefreshGps: () => void;
  onOpenCoordModal: () => void;
  onResetGps?: () => void;
  onResetToLiveNow?: () => void;
}

export const LocationBanner: React.FC<LocationBannerProps> = ({
  latitude,
  longitude,
  accuracy,
  loading,
  error,
  utcOffsetHours,
  isLiveGps,
  isCustomCoordinates = false,
  isLiveTrack = true,
  onRefreshGps,
  onOpenCoordModal,
  onResetGps,
  onResetToLiveNow,
}) => {
  const latStr = `${Math.abs(latitude).toFixed(2)}° ${latitude >= 0 ? 'N' : 'S'}`;
  const lonStr = `${Math.abs(longitude).toFixed(2)}° ${longitude >= 0 ? 'E' : 'W'}`;
  const calculatedOffset = formatUtcOffset(utcOffsetHours);
  
  // Exact required format: 'Location: [Detected Lat]° N, [Detected Lon]° W | System Timezone: UTC [Calculated Offset]'
  const dynamicBannerText = `Location: ${latStr}, ${lonStr} | System Timezone: UTC ${calculatedOffset}`;
  const timeZoneId = getSystemTimeZoneId();

  return (
    <div className="w-full bg-slate-950/95 border-b border-slate-800/90 backdrop-blur-md px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
      {/* Primary Required Dynamic Header Reference */}
      <div className="flex items-center gap-2 flex-wrap min-w-0">
        <div className="flex items-center gap-1.5 text-slate-300 font-mono tracking-tight font-medium text-xs sm:text-sm">
          <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-amber-200/95 font-semibold">{dynamicBannerText}</span>
        </div>

        {/* Custom Coordinates Indicator Badge */}
        {isCustomCoordinates && (
          <span className="px-1.5 py-0.5 rounded bg-amber-950/90 border border-amber-500/80 text-amber-300 font-mono text-[10.5px] font-bold shadow-xs">
            Interactive Drag Active
          </span>
        )}

        {/* Simulation Mode Indicator Badge */}
        {!isLiveTrack && (
          <span className="px-1.5 py-0.5 rounded bg-sky-950/90 border border-sky-500/80 text-sky-300 font-mono text-[10.5px] font-bold shadow-xs">
            Time Sim Active
          </span>
        )}

        {/* System Timezone Zone ID */}
        {timeZoneId && timeZoneId !== 'System Local' && (
          <span className="text-slate-400 font-mono text-[11px] hidden md:inline">
            ({timeZoneId})
          </span>
        )}

        <span className="text-slate-700 hidden xs:inline" aria-hidden="true">·</span>

        {/* GPS Live Status */}
        <div className="flex items-center gap-1 text-[11px] font-mono">
          {loading ? (
            <span className="text-amber-400 flex items-center gap-1 font-medium">
              <RotateCw className="w-3 h-3 animate-spin" />
              Locking GPS...
            </span>
          ) : isLiveGps ? (
            <span className="text-emerald-400 flex items-center gap-1 font-medium" title={accuracy ? `GPS Accuracy ±${Math.round(accuracy)}m` : 'Live Phone Sensor'}>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Live Sensor {accuracy ? `(±${Math.round(accuracy)}m)` : ''}
            </span>
          ) : (
            <span className="text-slate-400 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-slate-500" />
              Sensors Active
            </span>
          )}
        </div>
      </div>

      {/* Action triggers */}
      <div className="flex items-center gap-2 shrink-0">
        {error && (
          <span className="text-rose-400 text-[11px] flex items-center gap-1 truncate max-w-[180px]" title={error}>
            <AlertCircle className="w-3 h-3 shrink-0" />
            Sensor Notice
          </span>
        )}

        <button
          onClick={onRefreshGps}
          disabled={loading}
          className="p-1.5 px-2 rounded-md bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1 text-[11px] font-mono active:scale-95"
          title="Refresh live GPS reading from phone hardware"
          aria-label="Refresh live GPS sensors"
        >
          <RotateCw className={`w-3 h-3 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          <span className="hidden sm:inline">Refresh GPS</span>
        </button>

        {isCustomCoordinates && onResetGps && (
          <button
            onClick={onResetGps}
            className="p-1.5 px-2.5 rounded-md bg-amber-950/80 border border-amber-600/90 hover:bg-amber-900 text-amber-300 hover:text-white transition flex items-center gap-1.5 text-[11px] font-mono active:scale-95 cursor-pointer font-bold shadow-sm"
            title="Snap coordinates back to Morden live GPS baseline"
          >
            <RotateCw className="w-3 h-3 text-amber-400" />
            <span>Reset to GPS</span>
          </button>
        )}

        {!isLiveTrack && onResetToLiveNow && (
          <button
            onClick={onResetToLiveNow}
            className="p-1.5 px-2.5 rounded-md bg-emerald-950/80 border border-emerald-500/90 hover:bg-emerald-900 text-emerald-300 hover:text-white transition flex items-center gap-1.5 text-[11px] font-mono active:scale-95 cursor-pointer font-bold shadow-sm"
            title="Snap back to device live internal clock, calendar, and Morden GPS"
          >
            <RotateCw className="w-3 h-3 text-emerald-400" />
            <span>☀️ Live Track</span>
          </button>
        )}

        <button
          onClick={onOpenCoordModal}
          className="p-1.5 px-2 rounded-md bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-300 hover:text-white transition text-[11px] font-mono active:scale-95"
          title="Inspect or simulate other latitudes/longitudes"
        >
          Coordinates
        </button>
      </div>
    </div>
  );
};
