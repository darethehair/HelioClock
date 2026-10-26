import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Clock,
  Calendar,
  Sun,
  Moon,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Sliders,
  History,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import { formatHours, CurrentSolarPosition, SolarDayData } from '../utils/solarCalculator';

interface DateTimeSimulationBarProps {
  currentDate: Date;
  isLiveTrack: boolean;
  todayData: SolarDayData;
  currentPos: CurrentSolarPosition;
  onToggleLiveTrack: (enableLive: boolean) => void;
  onUpdateDateTime: (newDate: Date) => void;
  onResetToLiveNow: () => void;
}

export const DateTimeSimulationBar: React.FC<DateTimeSimulationBarProps> = ({
  currentDate,
  isLiveTrack,
  todayData,
  currentPos,
  onToggleLiveTrack,
  onUpdateDateTime,
  onResetToLiveNow,
}) => {
  // Local state for precision numerical text inputs
  const [inputYear, setInputYear] = useState<string>(() => currentDate.getFullYear().toString());
  const [inputMonth, setInputMonth] = useState<string>(() => (currentDate.getMonth() + 1).toString());
  const [inputDay, setInputDay] = useState<string>(() => currentDate.getDate().toString());
  const [inputHour, setInputHour] = useState<string>(() => currentDate.getHours().toString().padStart(2, '0'));
  const [inputMinute, setInputMinute] = useState<string>(() => currentDate.getMinutes().toString().padStart(2, '0'));

  // Keep inputs synchronized when currentDate changes from outside (e.g. graph dragging or live clock)
  useEffect(() => {
    setInputYear(currentDate.getFullYear().toString());
    setInputMonth((currentDate.getMonth() + 1).toString());
    setInputDay(currentDate.getDate().toString());
    setInputHour(currentDate.getHours().toString().padStart(2, '0'));
    setInputMinute(currentDate.getMinutes().toString().padStart(2, '0'));
  }, [currentDate]);

  // Current time in minutes from midnight (0 to 1439)
  const currentMinutesOfDay = useMemo(() => {
    return currentDate.getHours() * 60 + currentDate.getMinutes();
  }, [currentDate]);

  // 24-Hour Slider change handler
  const handleTimeSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const totalMinutes = parseInt(e.target.value, 10);
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;

    const updated = new Date(currentDate.getTime());
    updated.setHours(newHours, newMinutes, 0, 0);
    onUpdateDateTime(updated);
  }, [currentDate, onUpdateDateTime]);

  // Step time by delta in minutes (e.g. -60 or +60)
  const stepTime = useCallback((deltaMinutes: number) => {
    const updated = new Date(currentDate.getTime() + deltaMinutes * 60 * 1000);
    onUpdateDateTime(updated);
  }, [currentDate, onUpdateDateTime]);

  // Apply manual text overrides with validation
  const handleApplyNumericalInputs = useCallback(() => {
    const y = parseInt(inputYear, 10);
    const m = parseInt(inputMonth, 10);
    const d = parseInt(inputDay, 10);
    const h = parseInt(inputHour, 10);
    const min = parseInt(inputMinute, 10);

    if (isNaN(y) || y < 1800 || y > 2200) return;
    if (isNaN(m) || m < 1 || m > 12) return;
    if (isNaN(d) || d < 1 || d > 31) return;
    if (isNaN(h) || h < 0 || h > 23) return;
    if (isNaN(min) || min < 0 || min > 59) return;

    // Use Date constructor with year, monthIndex (0-11), day, hour, minute
    const updated = new Date(y, m - 1, d, h, min, 0);
    onUpdateDateTime(updated);
  }, [inputYear, inputMonth, inputDay, inputHour, inputMinute, onUpdateDateTime]);

  // Auto-apply on field change if valid
  const handleFieldChange = (field: 'year' | 'month' | 'day' | 'hour' | 'minute', val: string) => {
    let newY = inputYear;
    let newM = inputMonth;
    let newD = inputDay;
    let newH = inputHour;
    let newMin = inputMinute;

    if (field === 'year') {
      newY = val;
      setInputYear(val);
    } else if (field === 'month') {
      newM = val;
      setInputMonth(val);
    } else if (field === 'day') {
      newD = val;
      setInputDay(val);
    } else if (field === 'hour') {
      newH = val;
      setInputHour(val);
    } else if (field === 'minute') {
      newMin = val;
      setInputMinute(val);
    }

    const y = parseInt(newY, 10);
    const m = parseInt(newM, 10);
    const d = parseInt(newD, 10);
    const h = parseInt(newH, 10);
    const min = parseInt(newMin, 10);

    if (
      !isNaN(y) && y >= 1800 && y <= 2200 &&
      !isNaN(m) && m >= 1 && m <= 12 &&
      !isNaN(d) && d >= 1 && d <= 31 &&
      !isNaN(h) && h >= 0 && h <= 23 &&
      !isNaN(min) && min >= 0 && min <= 59
    ) {
      const updated = new Date(y, m - 1, d, h, min, 0);
      onUpdateDateTime(updated);
    }
  };

  // Quick preset jump handlers
  const jumpToSolarEvent = (decimalHour: number | null) => {
    if (decimalHour === null) return;
    const hours = Math.floor(decimalHour);
    const minutes = Math.round((decimalHour - hours) * 60);
    const updated = new Date(currentDate.getTime());
    updated.setHours(hours, Math.min(59, minutes), 0, 0);
    onUpdateDateTime(updated);
  };

  // Jump to specific milestone date in current simulated year
  const jumpToDate = (monthIndex: number, day: number) => {
    const updated = new Date(currentDate.getFullYear(), monthIndex, day, currentDate.getHours(), currentDate.getMinutes(), 0);
    onUpdateDateTime(updated);
  };

  // Formatted date string e.g. "Thu, Oct 22, 2026"
  const formattedDateTitle = currentDate.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTimeDigital = `${currentDate.getHours().toString().padStart(2, '0')}:${currentDate
    .getMinutes()
    .toString()
    .padStart(2, '0')}:${currentDate.getSeconds().toString().padStart(2, '0')}`;

  return (
    <div className="w-full bg-[#05070c] rounded-2xl border border-slate-800 shadow-2xl p-3 sm:p-5 text-slate-200 select-none transition-all">
      {/* Top Controller Bar: Live Track Master Toggle & Simulation Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-3.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="font-bold text-white tracking-wide text-xs sm:text-sm font-sans uppercase">
              Date & Time Simulation Engine
            </span>
          </div>

          {/* Master Live Track State Pill */}
          {isLiveTrack ? (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/70 text-emerald-300 font-mono text-[11px] font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              LIVE TRACKING ACTIVE
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/70 text-amber-300 font-mono text-[11px] font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              SIMULATION OVERRIDE ACTIVE
            </span>
          )}
        </div>

        {/* Master Toggle & Quick Reset Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* "☀️ Live Track" Master Toggle Switch */}
          <button
            type="button"
            onClick={() => {
              if (isLiveTrack) {
                // Toggle OFF -> release app into simulation mode
                onToggleLiveTrack(false);
              } else {
                // Toggle ON -> lock back to live clock, calendar, and GPS
                onResetToLiveNow();
              }
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all border cursor-pointer active:scale-95 ${
              isLiveTrack
                ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/50 hover:text-white'
            }`}
            title={isLiveTrack ? 'Click to pause and release app for simulation testing' : 'Click to lock immediately back to live clock & Morden GPS'}
          >
            <Sun className={`w-3.5 h-3.5 ${isLiveTrack ? 'text-emerald-400 animate-[spin_10s_linear_infinite]' : 'text-amber-400'}`} />
            <span>☀️ Live Track: {isLiveTrack ? 'ON' : 'OFF'}</span>
            <div
              className={`w-7 h-3.5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                isLiveTrack ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full bg-black shadow-xs transform transition-transform duration-200 ease-in-out ${
                  isLiveTrack ? 'translate-x-3.5' : 'translate-x-0'
                }`}
              />
            </div>
          </button>

          {/* Quick Snap to Live Now Button (Active when simulated) */}
          {!isLiveTrack && (
            <button
              type="button"
              onClick={onResetToLiveNow}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-400/40 font-mono text-xs font-bold transition cursor-pointer active:scale-95 shadow-[0_0_10px_rgba(56,189,248,0.2)]"
              title="Instantly snap back to real-time Morden GPS & live device clock"
            >
              <RotateCcw className="w-3.5 h-3.5 text-sky-300" />
              <span>Snap to Live (Morden)</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Simulation Modules: 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Module 1 (7 cols on large): 24-Hour Time-of-Day Slider */}
        <div className="lg:col-span-7 bg-slate-950/70 rounded-xl border border-slate-800/90 p-3.5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wide">
                24-Hour Time of Day
              </span>
            </div>

            {/* Live Readout & Solar Twilight Phase */}
            <div className="flex items-center gap-2">
              <span className="text-white font-mono text-sm sm:text-base font-bold bg-slate-900 px-2.5 py-0.5 rounded border border-slate-700 shadow-inner">
                {formattedTimeDigital}
              </span>
              <span
                className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                  currentPos.twilightState === 'daylight'
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-600/60'
                    : currentPos.twilightState === 'civil'
                    ? 'bg-blue-950/80 text-blue-300 border border-blue-600/60'
                    : currentPos.twilightState === 'nautical'
                    ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-600/60'
                    : currentPos.twilightState === 'astronomical'
                    ? 'bg-purple-950/80 text-purple-300 border border-purple-600/60'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                {currentPos.twilightState}
              </span>
            </div>
          </div>

          {/* Slider Container with Twilight Ambient Spectrum Gradient Track */}
          <div className="space-y-1.5 px-0.5">
            <div className="relative flex items-center">
              <input
                type="range"
                min="0"
                max="1439"
                step="1"
                value={currentMinutesOfDay}
                onChange={handleTimeSliderChange}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer accent-amber-400 bg-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-400"
                style={{
                  background:
                    'linear-gradient(to right, #020617 0%, #0c1a3b 22%, #1e3a8a 27%, #f59e0b 33%, #38bdf8 50%, #f59e0b 77%, #1e3a8a 82%, #0c1a3b 88%, #020617 100%)',
                }}
              />
            </div>

            {/* Time Ticks */}
            <div className="flex justify-between text-[10px] font-mono text-slate-500 font-semibold px-0.5">
              <span>00:00</span>
              <span>04:00</span>
              <span>08:00</span>
              <span>12:00</span>
              <span>16:00</span>
              <span>20:00</span>
              <span>23:59</span>
            </div>
          </div>

          {/* Time Jump Controls & Solar Transit Presets */}
          <div className="flex items-center justify-between gap-1.5 flex-wrap pt-1 border-t border-slate-900 text-xs font-mono">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => stepTime(-60)}
                className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition active:scale-95"
                title="Step backward 1 hour"
              >
                -1h
              </button>
              <button
                type="button"
                onClick={() => stepTime(-15)}
                className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition active:scale-95"
                title="Step backward 15 minutes"
              >
                -15m
              </button>
              <button
                type="button"
                onClick={() => stepTime(15)}
                className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition active:scale-95"
                title="Step forward 15 minutes"
              >
                +15m
              </button>
              <button
                type="button"
                onClick={() => stepTime(60)}
                className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition active:scale-95"
                title="Step forward 1 hour"
              >
                +1h
              </button>
            </div>

            {/* Instant Solar Event Jump Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-500 hidden sm:inline uppercase">Snap:</span>
              {todayData.sunrise !== null && (
                <button
                  type="button"
                  onClick={() => jumpToSolarEvent(todayData.sunrise)}
                  className="px-2 py-0.5 rounded bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60 text-[11px] font-semibold transition active:scale-95"
                  title={`Jump to Sunrise (${formatHours(todayData.sunrise)})`}
                >
                  Sunrise ({formatHours(todayData.sunrise)})
                </button>
              )}
              <button
                type="button"
                onClick={() => jumpToSolarEvent(todayData.solarNoon)}
                className="px-2 py-0.5 rounded bg-sky-950/60 hover:bg-sky-900/60 text-sky-300 border border-sky-800/60 text-[11px] font-semibold transition active:scale-95"
                title={`Jump to Solar Noon (${formatHours(todayData.solarNoon)})`}
              >
                Noon ({formatHours(todayData.solarNoon)})
              </button>
              {todayData.sunset !== null && (
                <button
                  type="button"
                  onClick={() => jumpToSolarEvent(todayData.sunset)}
                  className="px-2 py-0.5 rounded bg-orange-950/60 hover:bg-orange-900/60 text-orange-300 border border-orange-800/60 text-[11px] font-semibold transition active:scale-95"
                  title={`Jump to Sunset (${formatHours(todayData.sunset)})`}
                >
                  Sunset ({formatHours(todayData.sunset)})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Module 2 (5 cols on large): Precision Numerical Text Overrides Card */}
        <div className="lg:col-span-5 bg-slate-950/70 rounded-xl border border-slate-800/90 p-3.5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wide">
                Precision Date & Year Override
              </span>
            </div>
            <span className="font-mono text-xs font-semibold text-emerald-300">
              {formattedDateTitle}
            </span>
          </div>

          {/* Numerical Inputs Matrix (Year, Month, Day, Hour, Minute) */}
          <div className="grid grid-cols-5 gap-2">
            {/* Year */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold text-center">
                Year
              </label>
              <input
                type="number"
                min="1800"
                max="2200"
                value={inputYear}
                onChange={(e) => handleFieldChange('year', e.target.value)}
                onBlur={handleApplyNumericalInputs}
                className="w-full text-center bg-slate-900 border border-slate-700 rounded-lg py-1.5 text-white font-mono font-bold text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Month */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold text-center">
                Month
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={inputMonth}
                onChange={(e) => handleFieldChange('month', e.target.value)}
                onBlur={handleApplyNumericalInputs}
                className="w-full text-center bg-slate-900 border border-slate-700 rounded-lg py-1.5 text-white font-mono font-bold text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Day */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold text-center">
                Day
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={inputDay}
                onChange={(e) => handleFieldChange('day', e.target.value)}
                onBlur={handleApplyNumericalInputs}
                className="w-full text-center bg-slate-900 border border-slate-700 rounded-lg py-1.5 text-white font-mono font-bold text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Hour */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold text-center">
                Hour
              </label>
              <input
                type="number"
                min="0"
                max="23"
                value={inputHour}
                onChange={(e) => handleFieldChange('hour', e.target.value)}
                onBlur={handleApplyNumericalInputs}
                className="w-full text-center bg-slate-900 border border-slate-700 rounded-lg py-1.5 text-white font-mono font-bold text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Minute */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold text-center">
                Min
              </label>
              <input
                type="number"
                min="0"
                max="59"
                value={inputMinute}
                onChange={(e) => handleFieldChange('minute', e.target.value)}
                onBlur={handleApplyNumericalInputs}
                className="w-full text-center bg-slate-900 border border-slate-700 rounded-lg py-1.5 text-white font-mono font-bold text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Quick Season & Solstice Jumps */}
          <div className="flex items-center justify-between gap-1 flex-wrap pt-1 border-t border-slate-900 text-[11px] font-mono">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Solstices:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => jumpToDate(2, 20)}
                className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition active:scale-95"
                title="Vernal Equinox (~Mar 20)"
              >
                Equinox (Mar 20)
              </button>
              <button
                type="button"
                onClick={() => jumpToDate(5, 21)}
                className="px-1.5 py-0.5 rounded bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60 transition active:scale-95"
                title="Summer Solstice (~Jun 21)"
              >
                Summer (Jun 21)
              </button>
              <button
                type="button"
                onClick={() => jumpToDate(8, 22)}
                className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition active:scale-95"
                title="Autumnal Equinox (~Sep 22)"
              >
                Equinox (Sep 22)
              </button>
              <button
                type="button"
                onClick={() => jumpToDate(11, 21)}
                className="px-1.5 py-0.5 rounded bg-cyan-950/50 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/60 transition active:scale-95"
                title="Winter Solstice (~Dec 21)"
              >
                Winter (Dec 21)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
