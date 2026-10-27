import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sun, Sparkles, Maximize2, Minimize2 } from 'lucide-react';
import { useGeolocation } from './hooks/useGeolocation';
import { LocationBanner } from './components/LocationBanner';
import { SystemContextStatusBar } from './components/SystemContextStatusBar';
import { DashboardCards } from './components/DashboardCards';
import { SolarYearChart } from './components/SolarYearChart';
import { WorldSolarMap } from './components/WorldSolarMap';
import { EquirectangularSkyMap } from './components/EquirectangularSkyMap';
import { CelestialDial } from './components/CelestialDial';
import { DateTimeSimulationBar } from './components/DateTimeSimulationBar';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { CoordinateModal } from './components/CoordinateModal';
import {
  calculateYearEphemeris,
  calculateRealTimeSunPosition,
  calculateSolarDay,
  calculateDaylightDeltaSeconds,
} from './utils/solarCalculator';

export default function App() {
  const geo = useGeolocation();
  // Master Live Tracking & Astronomical Date/Time Simulation State
  const [isLiveTrack, setIsLiveTrack] = useState<boolean>(true);
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [isCoordModalOpen, setIsCoordModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Unified reactive coordinate calculation engine state
  const [currentLatitude, setCurrentLatitude] = useState<number>(() => geo.latitude);
  const [currentLongitude, setCurrentLongitude] = useState<number>(() => geo.longitude);
  const [isCustomCoordinates, setIsCustomCoordinates] = useState<boolean>(false);

  // Sync with geo hardware coordinates when not in interactive drag mode
  useEffect(() => {
    if (!isCustomCoordinates) {
      setCurrentLatitude(geo.latitude);
      setCurrentLongitude(geo.longitude);
    }
  }, [geo.latitude, geo.longitude, isCustomCoordinates]);

  // Reactive coordinate update handler from interactive map dragging
  const handleUpdateCoordinates = useCallback((newLat: number, newLon: number) => {
    setCurrentLatitude(newLat);
    setCurrentLongitude(newLon);
    setIsCustomCoordinates(true);
  }, []);

  // GPS Reset: smoothly re-locks calculation coordinates to hardware GPS baseline
  const handleResetToGps = useCallback(() => {
    setIsCustomCoordinates(false);
    setCurrentLatitude(geo.latitude);
    setCurrentLongitude(geo.longitude);
    geo.refreshGps();
  }, [geo]);

  // Sync fullscreen state with native browser/device events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as any;
      const active = Boolean(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      );
      setIsFullscreen(active);
      if (active) {
        document.documentElement.classList.add('is-fullscreen-active');
      } else {
        document.documentElement.classList.remove('is-fullscreen-active');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Native Fullscreen Toggle API Handler
  const toggleFullscreen = async () => {
    try {
      const doc = document as any;
      const docEl = document.documentElement as any;

      if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) {
          await docEl.webkitRequestFullscreen();
        } else if (docEl.mozRequestFullScreen) {
          await docEl.mozRequestFullScreen();
        } else if (docEl.msRequestFullscreen) {
          await docEl.msRequestFullscreen();
        }
      } else {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          await doc.mozCancelFullScreen();
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Native Fullscreen API request:', err);
    }
  };

  // Live real-time tick every second (only active during Live Track mode)
  useEffect(() => {
    if (!isLiveTrack) return;
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [isLiveTrack]);

  // Master "☀️ Live Track" Reset: locks back to live internal clock, calendar, and Morden GPS
  const handleResetToLiveNow = useCallback(() => {
    setIsLiveTrack(true);
    setCurrentDate(new Date());
    handleResetToGps();
  }, [handleResetToGps]);

  // Master Toggle switch for Live Track
  const handleToggleLiveTrack = useCallback((enableLive: boolean) => {
    if (enableLive) {
      handleResetToLiveNow();
    } else {
      setIsLiveTrack(false);
    }
  }, [handleResetToLiveNow]);

  // Direct simulation date/time update handler (from 24h slider or precision numeric overrides)
  const handleUpdateDateTime = useCallback((newDate: Date) => {
    setIsLiveTrack(false);
    setCurrentDate(newDate);
  }, []);

  // Option B: Scrubbing from the 365-day Full-Year Graph vertical line
  const handleScrubDayOfYear = useCallback((targetDayOfYear: number) => {
    setIsLiveTrack(false);
    setCurrentDate((prev) => {
      const year = prev.getFullYear();
      const hours = prev.getHours();
      const minutes = prev.getMinutes();
      const seconds = prev.getSeconds();
      const d = new Date(year, 0, targetDayOfYear, hours, minutes, seconds);
      return d;
    });
  }, []);

  // Compute current day of year (1-365/366)
  const currentDayOfYear = useMemo(() => {
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const diffMs = currentDate.getTime() - startOfYear.getTime();
    return Math.min(366, Math.max(1, Math.floor(diffMs / (24 * 3600 * 1000)) + 1));
  }, [currentDate]);

  // Compute 365-day full year ephemeris curves (dynamically scaled using system offset & active coordinates)
  const yearEphemeris = useMemo(() => {
    return calculateYearEphemeris(
      currentLatitude,
      currentLongitude,
      geo.utcOffsetHours,
      currentDate.getFullYear()
    );
  }, [currentLatitude, currentLongitude, geo.utcOffsetHours, currentDate]);

  // Compute current day's specific solar data
  const todayData = useMemo(() => {
    return calculateSolarDay(
      currentDayOfYear,
      currentLatitude,
      currentLongitude,
      geo.utcOffsetHours,
      currentDate.getFullYear()
    );
  }, [currentDayOfYear, currentLatitude, currentLongitude, geo.utcOffsetHours, currentDate]);

  // Compute current day's daylight delta (day-over-day rate of change in daylight length)
  const daylightDeltaSeconds = useMemo(() => {
    return calculateDaylightDeltaSeconds(
      currentDayOfYear,
      currentLatitude,
      currentLongitude,
      geo.utcOffsetHours,
      currentDate.getFullYear()
    );
  }, [currentDayOfYear, currentLatitude, currentLongitude, geo.utcOffsetHours, currentDate]);

  // Compute instantaneous real-time sun position (elevation, azimuth, current hour)
  const currentPos = useMemo(() => {
    return calculateRealTimeSunPosition(
      currentDate,
      currentLatitude,
      currentLongitude,
      geo.utcOffsetHours
    );
  }, [currentDate, currentLatitude, currentLongitude, geo.utcOffsetHours]);

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Bar Contract (1-line Brand wordmark, 4 nav links, 1 primary action) */}
      <header className="flex items-center justify-between gap-8 px-4 sm:px-8 py-3.5 border-b border-slate-900 bg-black/95 sticky top-0 z-40 backdrop-blur-md">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sun className="w-4 h-4 animate-[spin_60s_linear_infinite]" />
          </div>
          <a
            href="/"
            className="text-lg font-bold tracking-tight text-white whitespace-nowrap hover:text-amber-300 transition"
          >
            HelioClock
          </a>
        </div>

        {/* Zone 2: 5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-slate-400">
          <a href="#dashboard" className="hover:text-amber-300 transition whitespace-nowrap shrink-0">
            Solar Transit
          </a>
          <a href="#graph" className="hover:text-amber-300 transition whitespace-nowrap shrink-0">
            365-Day Curves
          </a>
          <a href="#world-map" className="hover:text-amber-300 transition whitespace-nowrap shrink-0">
            Equal Earth Map
          </a>
          <a href="#twilight" className="hover:text-amber-300 transition whitespace-nowrap shrink-0">
            Celestial Dial
          </a>
        </nav>

        {/* Zone 3: Native Fullscreen Toggle & PWA Install */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Quick Master Live Track status in header */}
          <button
            type="button"
            onClick={handleResetToLiveNow}
            title={isLiveTrack ? 'Live tracking active (device clock & Morden GPS)' : 'Click to snap immediately back to Live tracking'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-mono text-xs font-bold transition-all border cursor-pointer active:scale-95 ${
              isLiveTrack
                ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
            }`}
          >
            <Sun className={`w-3.5 h-3.5 ${isLiveTrack ? 'text-emerald-400' : 'text-amber-400 animate-spin'}`} />
            <span className="hidden sm:inline">{isLiveTrack ? 'Live Track' : 'Simulation'}</span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Native Fullscreen (Edge-to-Edge)'}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Native Fullscreen'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-mono text-xs font-bold transition-all bg-amber-500/15 hover:bg-amber-500/25 active:bg-amber-500/35 text-amber-300 hover:text-amber-100 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)] focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline">Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline">Fullscreen</span>
              </>
            )}
          </button>
          <PWAInstallButton />
        </div>
      </header>

      {/* Dynamic Location Reference Banner */}
      <LocationBanner
        latitude={currentLatitude}
        longitude={currentLongitude}
        accuracy={geo.accuracy}
        loading={geo.loading}
        error={geo.error}
        utcOffsetHours={geo.utcOffsetHours}
        isLiveGps={geo.isLiveGps && !isCustomCoordinates}
        isCustomCoordinates={isCustomCoordinates}
        isLiveTrack={isLiveTrack}
        onRefreshGps={geo.refreshGps}
        onOpenCoordModal={() => setIsCoordModalOpen(true)}
        onResetGps={handleResetToGps}
        onResetToLiveNow={handleResetToLiveNow}
      />

      {/* Main Content Workspace (Dark Theme Background - Expands 100% Edge-to-Edge in Fullscreen) */}
      <main
        className={`flex-1 w-full mx-auto space-y-6 transition-all duration-300 landscape-fullscreen-pad ${
          isFullscreen
            ? 'max-w-none px-2 sm:px-4 py-3'
            : 'max-w-7xl px-3 sm:px-6 lg:px-8 py-5 sm:py-7'
        }`}
      >
        {/* Dashboard Display Section with isolated soft light-blue card surfaces */}
        <section id="dashboard" className="space-y-3">
          {/* Centralized Top-Level System Context Status Bar */}
          <SystemContextStatusBar
            currentDate={currentDate}
            latitude={currentLatitude}
            longitude={currentLongitude}
            utcOffsetHours={geo.utcOffsetHours}
            isLiveTrack={isLiveTrack}
            isCustomCoordinates={isCustomCoordinates}
          />

          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
            <span className="text-slate-300 font-semibold tracking-wider uppercase text-[11px]">
              Today's Solar & Lunar Ephemeris
            </span>
            <span className="text-slate-400">
              {currentDate.toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          <DashboardCards
            todayData={todayData}
            currentPos={currentPos}
            daylightDeltaSeconds={daylightDeltaSeconds}
            currentDate={currentDate}
            latitude={currentLatitude}
            longitude={currentLongitude}
          />
        </section>

        {/* Dual-View Landscape Container: Side-by-Side Two-Column Grid in Landscape */}
        <div className="landscape-dual-grid flex flex-col landscape:grid landscape:grid-cols-2 landscape:gap-4 landscape:items-start">
          {/* Full-Year Graph Layout (Prominently on Left Side in Landscape) */}
          <section id="graph" className="space-y-2 w-full">
            <SolarYearChart
              days={yearEphemeris.days}
              minDaylight={yearEphemeris.minDaylight}
              maxDaylight={yearEphemeris.maxDaylight}
              currentPos={currentPos}
              currentDayOfYear={currentDayOfYear}
              utcOffsetHours={geo.utcOffsetHours}
              latitude={currentLatitude}
              longitude={currentLongitude}
              isCustomCoordinates={isCustomCoordinates}
              currentDate={currentDate}
              isLiveTrack={isLiveTrack}
              onScrubDayOfYear={handleScrubDayOfYear}
              onResetLive={handleResetToLiveNow}
            />
          </section>

          {/* Interactive Equal Earth World Map with Live Day/Night Shadow Overlay (Side-by-Side on Right Side in Landscape) */}
          <section id="world-map" className="space-y-2 -mx-3 sm:mx-0 landscape:mx-0 w-full">
            <WorldSolarMap
              currentDate={currentDate}
              currentLatitude={currentLatitude}
              currentLongitude={currentLongitude}
              gpsLatitude={geo.latitude}
              gpsLongitude={geo.longitude}
              isLiveGps={geo.isLiveGps}
              isCustomCoordinates={isCustomCoordinates}
              isLiveTrack={isLiveTrack}
              onUpdateCoordinates={handleUpdateCoordinates}
              onResetGps={handleResetToGps}
              onResetLive={handleResetToLiveNow}
            />
          </section>
        </div>

        {/* Integrated Date/Time Simulation Engine (24-Hour Slider, Precision Numerical Overrides & Live Track Master Toggle) */}
        <section id="simulation-engine" className="space-y-2">
          <DateTimeSimulationBar
            currentDate={currentDate}
            isLiveTrack={isLiveTrack}
            todayData={todayData}
            currentPos={currentPos}
            onToggleLiveTrack={handleToggleLiveTrack}
            onUpdateDateTime={handleUpdateDateTime}
            onResetToLiveNow={handleResetToLiveNow}
          />
        </section>

        {/* Equirectangular Sky Map with 0° Horizon Baseline Split & Planetarium Grid */}
        <section id="twilight" className="space-y-4">
          <EquirectangularSkyMap
            currentDate={currentDate}
            latitude={currentLatitude}
            longitude={currentLongitude}
            currentPos={currentPos}
            isLiveGps={geo.isLiveGps && !isCustomCoordinates}
            isCustomCoordinates={isCustomCoordinates}
            onResetGps={handleResetToGps}
          />

          {/* Real-time Celestial Dial with isolated soft light-blue card surfaces */}
          <CelestialDial
            currentPos={currentPos}
            todayData={todayData}
            minDaylight={yearEphemeris.minDaylight}
            maxDaylight={yearEphemeris.maxDaylight}
          />
        </section>

        {/* Descriptive Astronomical Reference Notes */}
        <section id="ephemeris" className="p-4 rounded-xl bg-[#06080e] border border-slate-900 text-xs text-slate-400 leading-relaxed font-mono">
          <div className="flex items-center gap-2 text-slate-300 font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Astronomical Clock Calibration Engine</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-normal font-medium">
            Calculations strictly use NOAA Solar Geometry and the Jean Meeus solar ephemeris model.
            Solar transit, sunrise, and sunset curves are dynamically scaled using the native Android
            system timezone offset parser (<code>java.util.TimeZone.getDefault().getOffset(System.currentTimeMillis())</code>).
            All timeline coordinates, twilight boundaries, and the vertical current-day marker stay
            synchronized in real time with your device's active local clock.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-black/80 py-4 px-4 sm:px-8 text-center text-xs font-mono text-slate-600">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span>HelioClock Astronomical PWA</span>
          <span>·</span>
          <span>Native Android Web App</span>
          <span>·</span>
          <span>Offline Ephemeris Cache Active</span>
        </div>
      </footer>

      {/* Coordinate fine-tuner modal */}
      <CoordinateModal
        isOpen={isCoordModalOpen}
        onClose={() => setIsCoordModalOpen(false)}
        currentLat={currentLatitude}
        currentLon={currentLongitude}
        isLiveGps={geo.isLiveGps && !isCustomCoordinates}
        onApplyCoords={(lat, lon) => {
          handleUpdateCoordinates(lat, lon);
          geo.setManualCoordinates(lat, lon);
        }}
        onResetToLiveGps={handleResetToGps}
      />

      {/* Offline Status Toast */}
      <OfflineIndicator />

      {/* Floating Exit Fullscreen Button (Active only in Fullscreen for quick collapse) */}
      {isFullscreen && (
        <button
          type="button"
          onClick={toggleFullscreen}
          title="Exit Fullscreen Mode"
          aria-label="Exit Fullscreen Mode"
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3.5 py-2 rounded-full bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-mono text-xs font-bold shadow-2xl border border-amber-300 ring-2 ring-amber-400/50 transition-all cursor-pointer"
        >
          <Minimize2 className="w-4 h-4" />
          <span>Exit Fullscreen</span>
        </button>
      )}
    </div>
  );
}
