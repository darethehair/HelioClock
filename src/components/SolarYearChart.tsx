import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Maximize2, Minimize2, RotateCcw, Calendar, Sun } from 'lucide-react';
import { useElementFullscreen } from '../hooks/useElementFullscreen';
import {
  SolarDayData,
  CurrentSolarPosition,
  formatHours,
  formatDurationPrecise,
  formatDuration,
  formatUtcOffset,
} from '../utils/solarCalculator';

export interface MilestoneMarker {
  id: 'summer' | 'winter' | 'vernal' | 'autumnal';
  name: string;
  approxDate: string;
  dayOfYear: number;
  dateString: string;
  daylightHours: number;
  formattedDuration: string;
  color: string;
  borderColor: string;
  auraColor: string;
  dotColor: string;
  dayData: SolarDayData;
  x: number;
  y: number;
}

interface SolarYearChartProps {
  days: SolarDayData[];
  minDaylight: number;
  maxDaylight: number;
  currentPos: CurrentSolarPosition;
  currentDayOfYear: number;
  utcOffsetHours: number;
  latitude?: number;
  longitude?: number;
  isCustomCoordinates?: boolean;
  currentDate?: Date;
  isLiveTrack?: boolean;
  onScrubDayOfYear?: (dayOfYear: number) => void;
  onResetLive?: () => void;
}

// Month definitions for X-Axis with full words for desktop and short 3-letter abbreviations for mobile
const MONTHS = [
  { fullName: 'January', shortName: 'Jan', dayStart: 1, dayEnd: 31 },
  { fullName: 'February', shortName: 'Feb', dayStart: 32, dayEnd: 59 },
  { fullName: 'March', shortName: 'Mar', dayStart: 60, dayEnd: 90 },
  { fullName: 'April', shortName: 'Apr', dayStart: 91, dayEnd: 120 },
  { fullName: 'May', shortName: 'May', dayStart: 121, dayEnd: 151 },
  { fullName: 'June', shortName: 'Jun', dayStart: 152, dayEnd: 181 },
  { fullName: 'July', shortName: 'Jul', dayStart: 182, dayEnd: 212 },
  { fullName: 'August', shortName: 'Aug', dayStart: 213, dayEnd: 243 },
  { fullName: 'September', shortName: 'Sep', dayStart: 244, dayEnd: 273 },
  { fullName: 'October', shortName: 'Oct', dayStart: 274, dayEnd: 304 },
  { fullName: 'November', shortName: 'Nov', dayStart: 305, dayEnd: 334 },
  { fullName: 'December', shortName: 'Dec', dayStart: 335, dayEnd: 365 },
];

export const SolarYearChart: React.FC<SolarYearChartProps> = ({
  days,
  minDaylight,
  maxDaylight,
  currentPos,
  currentDayOfYear,
  utcOffsetHours,
  latitude,
  longitude,
  isCustomCoordinates = false,
  currentDate,
  isLiveTrack = true,
  onScrubDayOfYear,
  onResetLive,
}) => {
  const [hoveredDay, setHoveredDay] = useState<SolarDayData | null>(null);
  const [lockedDay, setLockedDay] = useState<SolarDayData | null>(null);
  const [hoveredMilestone, setHoveredMilestone] = useState<MilestoneMarker | null>(null);
  const [lockedMilestone, setLockedMilestone] = useState<MilestoneMarker | null>(null);

  // Option B Interactive Date Controller dragging state
  const [isDraggingDateLine, setIsDraggingDateLine] = useState<boolean>(false);
  const isDraggingDateLineRef = useRef<boolean>(false);
  const rafScrubRef = useRef<number | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { isFullscreen, toggleFullscreen } = useElementFullscreen(containerRef);

  // Mobile responsive detection (< 600px width override) & Landscape orientation detection
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 600;
    }
    return false;
  });

  const [isLandscape, setIsLandscape] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(orientation: landscape)').matches;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
      if (window.matchMedia) {
        setIsLandscape(window.matchMedia('(orientation: landscape)').matches);
      }
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const useBoostedTypography = isMobile || isLandscape || isFullscreen;
  const activeMilestone = hoveredMilestone || lockedMilestone;

  // Active inspected day is hovered day, locked day, active milestone, or current day
  const activeDay = hoveredDay || lockedDay || activeMilestone?.dayData || days[Math.min(364, Math.max(0, currentDayOfYear - 1))];

  // SVG coordinate dimensions with dynamic mobile/landscape spacing
  const width = 1000;
  const height = 520;
  const marginLeft = useBoostedTypography ? 74 : 62;
  const marginRight = useBoostedTypography ? 74 : 64;
  const marginTop = useBoostedTypography ? 38 : 36;
  const marginBottom = useBoostedTypography ? 54 : 48;

  const chartWidth = width - marginLeft - marginRight;
  const chartHeight = height - marginTop - marginBottom;
  const chartLeft = marginLeft;
  const chartRight = width - marginRight;
  const chartTop = marginTop;
  const chartBottom = height - marginBottom;

  // Auto-scale Right Y-Axis (Daylight Hours)
  const { rightMin, rightMax, rightTicks } = useMemo(() => {
    let rMin = Math.max(0, Math.floor(minDaylight * 2) / 2);
    let rMax = Math.min(24, Math.ceil(maxDaylight * 2) / 2);

    // Ensure at least a 1.5h spread (for equatorial regions where variation is minimal)
    if (rMax - rMin < 1.5) {
      const mid = (rMin + rMax) / 2;
      rMin = Math.max(0, Math.floor((mid - 1) * 2) / 2);
      rMax = Math.min(24, Math.ceil((mid + 1) * 2) / 2);
    }

    // Generate 4-6 neat tick labels
    const step = (rMax - rMin) <= 4 ? 0.5 : (rMax - rMin) <= 8 ? 1 : 2;
    const ticks: number[] = [];
    for (let t = Math.ceil(rMin / step) * step; t <= rMax; t += step) {
      ticks.push(t);
    }
    return { rightMin: rMin, rightMax: rMax, rightTicks: ticks };
  }, [minDaylight, maxDaylight]);

  // Coordinate conversion helpers
  const getX = useCallback((dayOfYear: number) => {
    return chartLeft + ((dayOfYear - 1) / 364) * chartWidth;
  }, [chartLeft, chartWidth]);

  // Left Y: 00:00 at bottom, 24:00 at top
  const getYLeft = useCallback((hours: number) => {
    const clamped = Math.max(0, Math.min(24, hours));
    return chartBottom - (clamped / 24) * chartHeight;
  }, [chartBottom, chartHeight]);

  // Right Y: auto-scaled daylight hours
  const getYRight = useCallback((daylightHrs: number) => {
    const clamped = Math.max(rightMin, Math.min(rightMax, daylightHrs));
    const ratio = (clamped - rightMin) / (rightMax - rightMin || 1);
    return chartBottom - ratio * chartHeight;
  }, [chartBottom, chartHeight, rightMin, rightMax]);

  // Four Solstice & Equinox Interactive Milestones directly on the Daylight Length Curve
  const milestones = useMemo(() => {
    if (!days || days.length === 0) return [];

    // Determine hemisphere based on daylight profile (longer days in June vs December)
    const isNorthern = (days[171]?.daylightHours ?? 12) >= (days[354]?.daylightHours ?? 12);

    let summerDay: SolarDayData;
    let winterDay: SolarDayData;

    if (isNorthern) {
      // Summer Solstice: absolute peak in June (~June 21)
      summerDay = days.slice(165, 180).reduce((prev, curr) => (curr.daylightHours > prev.daylightHours ? curr : prev), days[171] || days[0]);
      // Winter Solstice: lowest trough in December (~Dec 21)
      winterDay = days.slice(350, 364).reduce((prev, curr) => (curr.daylightHours < prev.daylightHours ? curr : prev), days[354] || days[0]);
    } else {
      // In Southern hemisphere: Peak is in December, trough in June
      summerDay = days.slice(350, 364).reduce((prev, curr) => (curr.daylightHours > prev.daylightHours ? curr : prev), days[354] || days[0]);
      winterDay = days.slice(165, 180).reduce((prev, curr) => (curr.daylightHours < prev.daylightHours ? curr : prev), days[171] || days[0]);
    }

    // Vernal Equinox (approx. March 20, exact intersection where day and night are equal)
    const vernalDay = days.slice(74, 85).reduce((prev, curr) => (Math.abs(curr.daylightHours - 12) < Math.abs(prev.daylightHours - 12) ? curr : prev), days[78] || days[0]);

    // Autumnal Equinox (approx. September 22, exact intersection where day and night are equal)
    const autumnDay = days.slice(260, 275).reduce((prev, curr) => (Math.abs(curr.daylightHours - 12) < Math.abs(prev.daylightHours - 12) ? curr : prev), days[264] || days[0]);

    const items: MilestoneMarker[] = [
      {
        id: 'summer',
        name: isNorthern ? 'Summer Solstice' : 'Summer Solstice (Southern)',
        approxDate: isNorthern ? 'approx. June 21' : 'approx. December 21',
        dayOfYear: summerDay.dayOfYear,
        dateString: summerDay.dateString,
        daylightHours: summerDay.daylightHours,
        formattedDuration: formatDurationPrecise(summerDay.daylightHours),
        color: '#f59e0b', // Golden
        borderColor: '#78350f',
        auraColor: 'rgba(245, 158, 11, 0.35)',
        dotColor: '#fbbf24',
        dayData: summerDay,
        x: getX(summerDay.dayOfYear),
        y: getYRight(summerDay.daylightHours),
      },
      {
        id: 'vernal',
        name: isNorthern ? 'Vernal Equinox' : 'Autumnal Equinox',
        approxDate: 'approx. March 20',
        dayOfYear: vernalDay.dayOfYear,
        dateString: vernalDay.dateString,
        daylightHours: vernalDay.daylightHours,
        formattedDuration: formatDurationPrecise(vernalDay.daylightHours),
        color: '#e2e8f0', // Silver
        borderColor: '#475569',
        auraColor: 'rgba(226, 232, 240, 0.35)',
        dotColor: '#f1f5f9',
        dayData: vernalDay,
        x: getX(vernalDay.dayOfYear),
        y: getYRight(vernalDay.daylightHours),
      },
      {
        id: 'autumnal',
        name: isNorthern ? 'Autumnal Equinox' : 'Vernal Equinox',
        approxDate: 'approx. September 22',
        dayOfYear: autumnDay.dayOfYear,
        dateString: autumnDay.dateString,
        daylightHours: autumnDay.daylightHours,
        formattedDuration: formatDurationPrecise(autumnDay.daylightHours),
        color: '#e2e8f0', // Silver
        borderColor: '#475569',
        auraColor: 'rgba(226, 232, 240, 0.35)',
        dotColor: '#f1f5f9',
        dayData: autumnDay,
        x: getX(autumnDay.dayOfYear),
        y: getYRight(autumnDay.daylightHours),
      },
      {
        id: 'winter',
        name: isNorthern ? 'Winter Solstice' : 'Winter Solstice (Southern)',
        approxDate: isNorthern ? 'approx. December 21' : 'approx. June 21',
        dayOfYear: winterDay.dayOfYear,
        dateString: winterDay.dateString,
        daylightHours: winterDay.daylightHours,
        formattedDuration: formatDurationPrecise(winterDay.daylightHours),
        color: '#38bdf8', // Light-blue
        borderColor: '#0369a1',
        auraColor: 'rgba(56, 189, 248, 0.35)',
        dotColor: '#7dd3fc',
        dayData: winterDay,
        x: getX(winterDay.dayOfYear),
        y: getYRight(winterDay.daylightHours),
      },
    ];

    return items;
  }, [days, getX, getYRight]);

  // Build SVG polygon paths for twilight and daylight areas
  const chartPaths = useMemo(() => {
    if (!days || days.length === 0) return null;

    // Helper to build a closed polygon between topCurve and bottomCurve
    function makeBandPolygon(
      getTop: (d: SolarDayData) => number,
      getBottom: (d: SolarDayData) => number
    ) {
      let forward = '';
      let backward = '';
      for (let i = 0; i < days.length; i++) {
        const d = days[i];
        const x = getX(d.dayOfYear);
        const yTop = getYLeft(getTop(d));
        const yBottom = getYLeft(getBottom(d));
        forward += `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${yTop.toFixed(1)} `;
        backward = `L ${x.toFixed(1)} ${yBottom.toFixed(1)} ` + backward;
      }
      return `${forward} ${backward} Z`;
    }

    // Helper to build a continuous line path
    function makeLinePath(getYVal: (d: SolarDayData) => number, isValid?: (d: SolarDayData) => boolean) {
      let path = '';
      let inSegment = false;
      for (let i = 0; i < days.length; i++) {
        const d = days[i];
        if (isValid && !isValid(d)) {
          inSegment = false;
          continue;
        }
        const x = getX(d.dayOfYear);
        const y = getYVal(d);
        path += `${!inSegment ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)} `;
        inSegment = true;
      }
      return path;
    }

    // 1. Center Daylight Core (Between Sunrise and Sunset)
    // In polar day: 0 to 24. In polar night: 0 (collapsed)
    const daylightPath = makeBandPolygon(
      (d) => (d.sunset !== null ? d.sunset : d.isPolarDay ? 24 : d.solarNoon),
      (d) => (d.sunrise !== null ? d.sunrise : d.isPolarDay ? 0 : d.solarNoon)
    );

    // 1b. Golden Hour Morning Band (Sunrise to +6° Altitude)
    const goldenHourMorningBand = makeBandPolygon(
      (d) => (d.goldenHourMorningEnd !== null ? d.goldenHourMorningEnd : d.sunrise !== null ? d.sunrise : d.solarNoon),
      (d) => (d.sunrise !== null ? d.sunrise : d.isPolarDay ? 0 : d.solarNoon)
    );

    // 1c. Golden Hour Evening Band (+6° Altitude to Sunset)
    const goldenHourEveningBand = makeBandPolygon(
      (d) => (d.sunset !== null ? d.sunset : d.isPolarDay ? 24 : d.solarNoon),
      (d) => (d.goldenHourEveningStart !== null ? d.goldenHourEveningStart : d.sunset !== null ? d.sunset : d.solarNoon)
    );

    // +6° Golden Hour Morning Threshold Curve (Thin Dashed Golden Curve)
    const goldenHourMorningCurve = makeLinePath(
      (d) => getYLeft(d.goldenHourMorningEnd!),
      (d) => d.goldenHourMorningEnd !== null
    );

    // +6° Golden Hour Evening Threshold Curve (Thin Dashed Golden Curve)
    const goldenHourEveningCurve = makeLinePath(
      (d) => getYLeft(d.goldenHourEveningStart!),
      (d) => d.goldenHourEveningStart !== null
    );

    // 2. Civil Twilight Morning (Civil Dawn to Sunrise)
    const civilDawnBand = makeBandPolygon(
      (d) => (d.sunrise !== null ? d.sunrise : d.isPolarDay ? 0 : d.solarNoon),
      (d) => (d.civilDawn !== null ? d.civilDawn : d.sunrise !== null ? d.sunrise : d.solarNoon)
    );

    // Civil Twilight Evening (Sunset to Civil Dusk)
    const civilDuskBand = makeBandPolygon(
      (d) => (d.civilDusk !== null ? d.civilDusk : d.sunset !== null ? d.sunset : d.solarNoon),
      (d) => (d.sunset !== null ? d.sunset : d.isPolarDay ? 24 : d.solarNoon)
    );

    // 3. Nautical Twilight Morning (Nautical Dawn to Civil Dawn)
    const nauticalDawnBand = makeBandPolygon(
      (d) => (d.civilDawn !== null ? d.civilDawn : d.solarNoon),
      (d) => (d.nauticalDawn !== null ? d.nauticalDawn : d.civilDawn !== null ? d.civilDawn : d.solarNoon)
    );

    // Nautical Twilight Evening (Civil Dusk to Nautical Dusk)
    const nauticalDuskBand = makeBandPolygon(
      (d) => (d.nauticalDusk !== null ? d.nauticalDusk : d.civilDusk !== null ? d.civilDusk : d.solarNoon),
      (d) => (d.civilDusk !== null ? d.civilDusk : d.solarNoon)
    );

    // 4. Astronomical Twilight Morning (Astro Dawn to Nautical Dawn)
    const astroDawnBand = makeBandPolygon(
      (d) => (d.nauticalDawn !== null ? d.nauticalDawn : d.solarNoon),
      (d) => (d.astroDawn !== null ? d.astroDawn : d.nauticalDawn !== null ? d.nauticalDawn : d.solarNoon)
    );

    // Astronomical Twilight Evening (Nautical Dusk to Astro Dusk)
    const astroDuskBand = makeBandPolygon(
      (d) => (d.astroDusk !== null ? d.astroDusk : d.nauticalDusk !== null ? d.nauticalDusk : d.solarNoon),
      (d) => (d.nauticalDusk !== null ? d.nauticalDusk : d.solarNoon)
    );

    // Prominent Bright Green Daylight Length Curve (Mapped to Right Y-Axis)
    const daylightCurve = makeLinePath((d) => getYRight(d.daylightHours));

    // Solar Peak (Transit) curve
    const solarNoonCurve = makeLinePath((d) => getYLeft(d.solarNoon));

    // Solar Nadir (Anti-Transit) curves (near 0h and 24h)
    const solarNadirCurve = makeLinePath((d) => getYLeft(d.solarNadir));

    return {
      daylightPath,
      goldenHourMorningBand,
      goldenHourEveningBand,
      goldenHourMorningCurve,
      goldenHourEveningCurve,
      civilDawnBand,
      civilDuskBand,
      nauticalDawnBand,
      nauticalDuskBand,
      astroDawnBand,
      astroDuskBand,
      daylightCurve,
      solarNoonCurve,
      solarNadirCurve,
    };
  }, [days, getX, getYLeft, getYRight]);

  // Option B Interactive Date Controller Drag Handlers
  const handleDateLinePointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    isDraggingDateLineRef.current = true;
    setIsDraggingDateLine(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const handleDateLinePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingDateLineRef.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const scaleX = width / rect.width;
    const svgX = clientX * scaleX;

    const clampedX = Math.max(chartLeft, Math.min(chartRight, svgX));
    const dayRatio = (clampedX - chartLeft) / chartWidth;
    const targetDay = Math.min(365, Math.max(1, Math.round(dayRatio * 364) + 1));

    if (rafScrubRef.current) {
      cancelAnimationFrame(rafScrubRef.current);
    }
    rafScrubRef.current = requestAnimationFrame(() => {
      if (onScrubDayOfYear) {
        onScrubDayOfYear(targetDay);
      }
    });
  }, [chartLeft, chartRight, chartWidth, onScrubDayOfYear, width]);

  const handleDateLinePointerUp = useCallback((e: React.PointerEvent) => {
    if (isDraggingDateLineRef.current) {
      isDraggingDateLineRef.current = false;
      setIsDraggingDateLine(false);
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    }
  }, []);

  // Pointer interaction handler for 365-day scrubbing & milestone detection
  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    const svgX = clientX * scaleX;
    const svgY = clientY * scaleY;

    // If currently dragging the vertical date line, route directly to scrub
    if (isDraggingDateLineRef.current) {
      const clampedX = Math.max(chartLeft, Math.min(chartRight, svgX));
      const dayRatio = (clampedX - chartLeft) / chartWidth;
      const targetDay = Math.min(365, Math.max(1, Math.round(dayRatio * 364) + 1));
      if (rafScrubRef.current) {
        cancelAnimationFrame(rafScrubRef.current);
      }
      rafScrubRef.current = requestAnimationFrame(() => {
        if (onScrubDayOfYear) {
          onScrubDayOfYear(targetDay);
        }
      });
      return;
    }

    // Check if hovering near one of the 4 milestone markers (solstices/equinoxes)
    const hitDist = useBoostedTypography ? 26 : 20;
    const nearMilestone = milestones.find((m) => Math.hypot(svgX - m.x, svgY - m.y) < hitDist);
    if (nearMilestone) {
      setHoveredMilestone(nearMilestone);
      setHoveredDay(nearMilestone.dayData);
      return;
    } else {
      setHoveredMilestone(null);
    }

    const clampedX = Math.max(chartLeft, Math.min(chartRight, svgX));
    const dayRatio = (clampedX - chartLeft) / chartWidth;
    const dayIdx = Math.round(dayRatio * 364);
    const day = days[Math.max(0, Math.min(364, dayIdx))];
    if (day) {
      setHoveredDay(day);
    }
  }, [chartLeft, chartRight, chartWidth, days, width, height, milestones, onScrubDayOfYear, useBoostedTypography]);

  const handlePointerLeave = useCallback(() => {
    if (isDraggingDateLineRef.current) {
      isDraggingDateLineRef.current = false;
      setIsDraggingDateLine(false);
    }
    setHoveredDay(null);
    setHoveredMilestone(null);
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (isDraggingDateLineRef.current) {
      isDraggingDateLineRef.current = false;
      setIsDraggingDateLine(false);
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    }
  }, []);

  const handleClick = useCallback(() => {
    if (hoveredMilestone) {
      setLockedMilestone((prev) => (prev?.id === hoveredMilestone.id ? null : hoveredMilestone));
      setLockedDay(hoveredMilestone.dayData);
    } else if (hoveredDay) {
      setLockedMilestone(null);
      setLockedDay((prev) => (prev?.dayOfYear === hoveredDay.dayOfYear ? null : hoveredDay));
    }
  }, [hoveredMilestone, hoveredDay]);

  // Current real-time / simulated sun coordinates
  const currentSunX = getX(currentDayOfYear);
  const currentSunY = getYLeft(currentPos.currentStandardHour);

  // Left Y-Axis ticks (00:00 to 24:00 every 2 or 3 hours)
  const leftHourTicks = [0, 3, 6, 9, 12, 15, 18, 21, 24];

  return (
    <div
      ref={containerRef}
      className={`fullscreen-module-card w-full bg-black rounded-2xl border border-slate-800 p-3 sm:p-5 shadow-2xl relative select-none transition-all ${
        isFullscreen
          ? 'fullscreen-module-active !rounded-none !p-3 sm:!p-5 !h-screen !w-screen flex flex-col justify-between overflow-y-auto z-[100]'
          : ''
      }`}
    >
      {/* Chart Header & Interactive Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs border-b border-slate-900 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white tracking-wide text-sm flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#22c55e]" />
            Full-Year Solar Ephemeris & Daylight Curves
          </span>
          <span className="text-slate-500 hidden sm:inline">·</span>
          <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">
            System Timezone Synced (UTC {formatUtcOffset(utcOffsetHours)})
            {latitude !== undefined && longitude !== undefined && (
              <span className={`ml-1.5 ${isCustomCoordinates ? 'text-amber-300 font-semibold' : 'text-slate-400'}`}>
                · {Math.abs(latitude).toFixed(1)}°{latitude >= 0 ? 'N' : 'S'}, {Math.abs(longitude).toFixed(1)}°{longitude >= 0 ? 'E' : 'W'} {isCustomCoordinates ? '(Drag View)' : ''}
              </span>
            )}
          </span>
        </div>

        {/* Legend with Mobile Responsive Override & Fullscreen Control */}
        <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-[11px] font-mono flex-wrap">
          <div className="flex items-center gap-1.5 py-1 px-1.5 rounded bg-slate-900/60 sm:bg-transparent chart-legend-text">
            <span className="w-3.5 h-3.5 sm:w-3 sm:h-3 rounded-sm bg-[#7dd3fc] border border-sky-400" />
            <span className="text-slate-200 font-bold sm:font-medium">Daylight</span>
          </div>
          <div className="flex items-center gap-1.5 py-1 px-1.5 rounded bg-amber-950/40 sm:bg-transparent border border-amber-800/40 sm:border-0 chart-legend-text">
            <span className="w-3.5 h-3.5 sm:w-3 sm:h-3 rounded-sm bg-[#f59e0b] border border-amber-300" />
            <span className="text-amber-300 font-bold sm:font-medium">Golden (+6°)</span>
          </div>
          <div className="flex items-center gap-1.5 py-1 px-1.5 rounded bg-slate-900/60 sm:bg-transparent chart-legend-text">
            <span className="w-3.5 h-3.5 sm:w-3 sm:h-3 rounded-sm bg-blue-600" />
            <span className="text-blue-300 font-bold sm:font-normal">Civil Twilight</span>
          </div>
          <div className="flex items-center gap-1.5 py-1 px-1.5 rounded bg-slate-900/60 sm:bg-transparent chart-legend-text">
            <span className="w-3.5 h-3.5 sm:w-3 sm:h-3 rounded-sm bg-blue-900" />
            <span className="text-blue-400 font-bold sm:font-normal">Nautical</span>
          </div>
          <div className="flex items-center gap-1.5 py-1 px-1.5 rounded bg-slate-900/60 sm:bg-transparent chart-legend-text">
            <span className="w-3.5 h-3.5 sm:w-3 sm:h-3 rounded-sm bg-slate-950 border border-slate-800" />
            <span className="text-slate-300 font-bold sm:font-normal">Night</span>
          </div>
          <div className="flex items-center gap-1.5 py-1 px-1.5 rounded bg-emerald-950/40 sm:bg-transparent border border-emerald-800/40 sm:border-0 chart-legend-text">
            <span className="w-4 h-1.5 sm:w-3.5 sm:h-1 bg-emerald-400 rounded-full shadow-[0_0_6px_#22c55e]" />
            <span className="text-emerald-400 font-bold">Daylight Length (Rt Axis)</span>
          </div>
          {/* Milestone Legend Entry with Enlarged Badges */}
          <div className="flex items-center gap-2 pl-1 sm:pl-2 sm:border-l border-slate-800 text-sm sm:text-[10px] text-slate-300 flex-wrap">
            <div className="flex items-center gap-1.5 py-1 px-1.5 rounded bg-amber-950/40 sm:bg-transparent border border-amber-800/40 sm:border-0 chart-legend-text" title="Summer Solstice (Peak of Curve)">
              <span className="w-3 h-3 sm:w-2 sm:h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
              <span className="text-amber-300 font-bold">Summer</span>
            </div>
            <div className="flex items-center gap-1.5 py-1 px-1.5 rounded bg-sky-950/40 sm:bg-transparent border border-sky-800/40 sm:border-0 chart-legend-text" title="Winter Solstice (Lowest Trough)">
              <span className="w-3 h-3 sm:w-2 sm:h-2 rounded-full bg-sky-400 shadow-[0_0_6px_#38bdf8]" />
              <span className="text-sky-300 font-bold">Winter</span>
            </div>
            <div className="flex items-center gap-1.5 py-1 px-1.5 rounded bg-slate-900/60 sm:bg-transparent border border-slate-700/40 sm:border-0 chart-legend-text" title="Equinoxes (Equal Day & Night)">
              <span className="w-3 h-3 sm:w-2 sm:h-2 rounded-full bg-slate-200 shadow-[0_0_6px_#e2e8f0]" />
              <span className="text-slate-200 font-bold">Equinoxes</span>
            </div>
          </div>

          {!isLiveTrack && (
            <button
              type="button"
              onClick={onResetLive}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-mono text-[10px] sm:text-xs font-bold transition active:scale-95 cursor-pointer"
              title="Reset graph date to live today"
            >
              <RotateCcw className="w-3 h-3 text-amber-300" />
              <span>Reset Date</span>
            </button>
          )}

          {/* Individual Module Fullscreen Toggle Button directly in the Upper Right Corner */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Chart Fullscreen (Esc)' : 'Maximize Chart to Fullscreen'}
            aria-label={isFullscreen ? 'Exit Chart Fullscreen' : 'Maximize Chart to Fullscreen'}
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
      </div>

      {/* Main SVG Chart with Stark Black Background */}
      <div className="relative w-full overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto cursor-crosshair touch-none"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          onPointerUp={handlePointerUp}
          onClick={handleClick}
        >
          <defs>
            {/* Glowing filter for Sun symbol */}
            <filter id="sun-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Glowing filter for Bright Green Daylight Length curve */}
            <filter id="green-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#22c55e" floodOpacity="0.7" />
            </filter>

            {/* Stark black background pattern */}
            <radialGradient id="sky-radial" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#080c14" />
              <stop offset="100%" stopColor="#000000" />
            </radialGradient>

            {/* Daytime Sky Gradient matching the Rectangular Sky Plot exactly */}
            <linearGradient id="chart-sky-daylight-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#7dd3fc" />
            </linearGradient>
          </defs>

          {/* 1. Stark Black Night Base Canvas */}
          <rect
            x={chartLeft}
            y={chartTop}
            width={chartWidth}
            height={chartHeight}
            fill="url(#sky-radial)"
          />

          {/* 2. Layered Twilight Phases (Astronomical, Nautical, Civil) */}
          {chartPaths && (
            <g>
              {/* Astronomical Twilight (Midnight Navy #0c1529) */}
              <path d={chartPaths.astroDawnBand} fill="#0c1529" opacity="0.95" />
              <path d={chartPaths.astroDuskBand} fill="#0c1529" opacity="0.95" />

              {/* Nautical Twilight (Deep Cobalt #172554) */}
              <path d={chartPaths.nauticalDawnBand} fill="#172554" opacity="0.95" />
              <path d={chartPaths.nauticalDuskBand} fill="#172554" opacity="0.95" />

              {/* Civil Twilight (Royal Blue #2563eb / #1d4ed8) */}
              <path d={chartPaths.civilDawnBand} fill="#2563eb" opacity="0.95" />
              <path d={chartPaths.civilDuskBand} fill="#2563eb" opacity="0.95" />

              {/* Center Daylight Core: Light Blue Gradient matching Rectangular Sky Plot */}
              <path d={chartPaths.daylightPath} fill="url(#chart-sky-daylight-gradient)" opacity="0.96" />

              {/* Golden Hour (0° to +6°) Shaded Bands */}
              <path d={chartPaths.goldenHourMorningBand} fill="#f59e0b" opacity="0.32" />
              <path d={chartPaths.goldenHourEveningBand} fill="#f59e0b" opacity="0.32" />

              {/* +6° Golden Hour Threshold Curves (Thin Dashed Golden Lines) */}
              {chartPaths.goldenHourMorningCurve && (
                <path
                  d={chartPaths.goldenHourMorningCurve}
                  fill="none"
                  stroke="#facc15"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                  opacity="0.85"
                />
              )}
              {chartPaths.goldenHourEveningCurve && (
                <path
                  d={chartPaths.goldenHourEveningCurve}
                  fill="none"
                  stroke="#facc15"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                  opacity="0.85"
                />
              )}

              {/* Solar Peak (Transit / Solar Noon) Hairline Curve */}
              <path
                d={chartPaths.solarNoonCurve}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.8"
              />

              {/* Solar Nadir (Anti-Transit / Solar Midnight) Hairline Curve */}
              <path
                d={chartPaths.solarNadirCurve}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.2"
                strokeDasharray="3 3"
                opacity="0.6"
              />

              {/* Prominent Bright Green Curve: Total Daylight Length (Mapped to Right Y-Axis) */}
              <path
                d={chartPaths.daylightCurve}
                fill="none"
                stroke="#22c55e"
                strokeWidth="3.5"
                filter="url(#green-glow)"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          )}

          {/* 3. Grid Lines & Ticks */}
          <g opacity="0.25">
            {/* Horizontal Hour Grid Lines */}
            {leftHourTicks.map((h) => {
              const y = getYLeft(h);
              return (
                <line
                  key={`grid-h-${h}`}
                  x1={chartLeft}
                  y1={y}
                  x2={chartRight}
                  y2={y}
                  stroke="#94a3b8"
                  strokeWidth="0.8"
                  strokeDasharray={h % 6 === 0 ? undefined : '2 4'}
                />
              );
            })}

            {/* Vertical Month Boundary Lines */}
            {MONTHS.map((m) => {
              const x = getX(m.dayStart);
              return (
                <line
                  key={`grid-m-${m.shortName}`}
                  x1={x}
                  y1={chartTop}
                  x2={x}
                  y2={chartBottom}
                  stroke="#64748b"
                  strokeWidth="0.8"
                  strokeDasharray="2 3"
                />
              );
            })}
          </g>

          {/* 4. Month Labels (X-Axis: clean 3-letter calendar abbreviations on mobile < 600px to prevent overlapping) */}
          <g>
            {MONTHS.map((m) => {
              const xMid = getX(Math.round((m.dayStart + m.dayEnd) / 2));
              return (
                <g key={`month-${m.shortName}`}>
                  {/* Full Month Name on desktop/wide displays */}
                  <text
                    x={xMid}
                    y={chartBottom + (useBoostedTypography ? 24 : 20)}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize={useBoostedTypography ? "14" : "11"}
                    fontFamily="monospace"
                    fontWeight={useBoostedTypography ? "bold" : "600"}
                    className="chart-month-label chart-month-desktop"
                  >
                    {m.fullName}
                  </text>
                  {/* Clean 3-letter Calendar Abbreviation on Mobile < 600px */}
                  <text
                    x={xMid}
                    y={chartBottom + 24}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="14"
                    fontFamily="monospace"
                    fontWeight="bold"
                    className="chart-month-label chart-month-mobile"
                  >
                    {m.shortName}
                  </text>
                </g>
              );
            })}
          </g>

          {/* 5. Left Y-Axis (Day Hour from 00:00 at bottom to 24:00 at top: minimum 14px bold on mobile/landscape) */}
          <g>
            {/* Axis line */}
            <line
              x1={chartLeft}
              y1={chartTop}
              x2={chartLeft}
              y2={chartBottom}
              stroke="#475569"
              strokeWidth="1.2"
            />
            {leftHourTicks.map((h) => {
              const y = getYLeft(h);
              const label = `${h.toString().padStart(2, '0')}:00`;
              return (
                <g key={`left-tick-${h}`}>
                  <line
                    x1={chartLeft - (useBoostedTypography ? 7 : 5)}
                    y1={y}
                    x2={chartLeft}
                    y2={y}
                    stroke="#64748b"
                    strokeWidth="1"
                  />
                  <text
                    x={chartLeft - (useBoostedTypography ? 10 : 8)}
                    y={y + (useBoostedTypography ? 5 : 3.5)}
                    textAnchor="end"
                    fill="#94a3b8"
                    fontSize={useBoostedTypography ? "14" : "10"}
                    fontFamily="monospace"
                    fontWeight={useBoostedTypography ? "bold" : "500"}
                    className="chart-left-y-label"
                  >
                    {label}
                  </text>
                </g>
              );
            })}
            {/* Axis Title */}
            <text
              transform={`rotate(-90) translate(${-(chartTop + chartHeight / 2)}, ${useBoostedTypography ? 18 : 14})`}
              textAnchor="middle"
              fill="#cbd5e1"
              fontSize={useBoostedTypography ? "13" : "11"}
              fontFamily="monospace"
              fontWeight="bold"
              className="chart-axis-title"
            >
              DAY HOUR (LOCAL TIME)
            </text>
          </g>

          {/* 6. Right Y-Axis (Daylight Hours Auto-Scaled: minimum 14px bold on mobile/landscape) */}
          <g>
            {/* Axis line */}
            <line
              x1={chartRight}
              y1={chartTop}
              x2={chartRight}
              y2={chartBottom}
              stroke="#22c55e"
              strokeWidth="1.2"
              opacity="0.8"
            />
            {rightTicks.map((dHours) => {
              const y = getYRight(dHours);
              return (
                <g key={`right-tick-${dHours}`}>
                  <line
                    x1={chartRight}
                    y1={y}
                    x2={chartRight + (useBoostedTypography ? 7 : 5)}
                    y2={y}
                    stroke="#22c55e"
                    strokeWidth="1"
                  />
                  <text
                    x={chartRight + (useBoostedTypography ? 11 : 9)}
                    y={y + (useBoostedTypography ? 5 : 3.5)}
                    textAnchor="start"
                    fill="#4ade80"
                    fontSize={useBoostedTypography ? "14" : "10"}
                    fontFamily="monospace"
                    fontWeight={useBoostedTypography ? "bold" : "600"}
                    className="chart-right-y-label"
                  >
                    {dHours % 1 === 0 ? `${dHours}h` : `${dHours.toFixed(1)}h`}
                  </text>
                </g>
              );
            })}
            {/* Axis Title */}
            <text
              transform={`rotate(90) translate(${chartTop + chartHeight / 2}, ${-(width - (useBoostedTypography ? 18 : 12))})`}
              textAnchor="middle"
              fill="#4ade80"
              fontSize={useBoostedTypography ? "13" : "11"}
              fontFamily="monospace"
              fontWeight="bold"
              className="chart-axis-title"
            >
              DAYLIGHT HOURS
            </text>
          </g>

          {/* 7. Option B Interactive Date Controller & Sun Tracker */}
          {/* Vertical indicator line on the chart acting as a responsive touch/drag handle */}
          <g
            className="cursor-ew-resize select-none"
            onPointerDown={handleDateLinePointerDown}
            onPointerMove={handleDateLinePointerMove}
            onPointerUp={handleDateLinePointerUp}
            onPointerCancel={handleDateLinePointerUp}
          >
            {/* Wide transparent interactive touch/drag hit zone (48px wide) */}
            <rect
              x={currentSunX - 24}
              y={chartTop - 24}
              width={48}
              height={chartHeight + 48}
              fill="transparent"
              className="cursor-ew-resize"
              style={{ touchAction: 'none' }}
            />

            {/* Glowing drag beam when active */}
            {isDraggingDateLine && (
              <rect
                x={currentSunX - 16}
                y={chartTop}
                width={32}
                height={chartHeight}
                fill="#f59e0b"
                opacity="0.15"
              />
            )}

            {/* Vertical indicator line on the chart highlighting the active/simulated day */}
            <line
              x1={currentSunX}
              y1={chartTop}
              x2={currentSunX}
              y2={chartBottom}
              stroke={isDraggingDateLine ? '#38bdf8' : isLiveTrack ? '#facc15' : '#38bdf8'}
              strokeWidth={isDraggingDateLine ? '2.8' : '2'}
              strokeDasharray={isLiveTrack ? '4 2' : undefined}
              opacity="0.95"
            />

            {/* Tactile Drag Handle Pill at Top */}
            <g transform={`translate(${currentSunX}, ${chartTop - 12})`}>
              <rect
                x={-54}
                y={-11}
                width={108}
                height={22}
                rx={11}
                fill={isDraggingDateLine ? '#0284c7' : isLiveTrack ? '#854d0e' : '#0369a1'}
                stroke={isDraggingDateLine ? '#38bdf8' : isLiveTrack ? '#facc15' : '#7dd3fc'}
                strokeWidth={isDraggingDateLine ? '2' : '1.2'}
                className="shadow-lg transition-colors cursor-ew-resize"
              />
              <text
                x={0}
                y={3.5}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
                className="pointer-events-none tracking-tight chart-drag-handle-text"
              >
                {isDraggingDateLine
                  ? `◂ DAY ${currentDayOfYear} ▸`
                  : isLiveTrack
                  ? '◂ TODAY ⇋ DRAG ▸'
                  : `◂ ${activeDay?.dateString ? activeDay.dateString.toUpperCase() : `DAY ${currentDayOfYear}`} ▸`}
              </text>
            </g>

            {/* Marker triangle pin pointing down at top boundary */}
            <polygon
              points={`${currentSunX - 6},${chartTop - 1} ${currentSunX + 6},${chartTop - 1} ${currentSunX},${chartTop + 7}`}
              fill={isDraggingDateLine ? '#38bdf8' : isLiveTrack ? '#facc15' : '#38bdf8'}
            />

            {/* Distinct yellow sun symbol icon (☀️) directly on the graph's vertical time scale */}
            {/* 1) Moving dynamically on Left Axis scale at current hour */}
            <g transform={`translate(${chartLeft - 22}, ${currentSunY})`}>
              <circle cx="0" cy="0" r="8" fill="#eab308" filter="url(#sun-glow)" />
              <text x="0" y="3.5" textAnchor="middle" fontSize="11" fill="#000">
                ☀️
              </text>
            </g>

            {/* Current hour time tag next to left scale */}
            <g transform={`translate(${chartLeft + 4}, ${currentSunY})`}>
              <rect x="0" y="-8" width="44" height="16" rx="3" fill="#854d0e" opacity="0.9" />
              <text x="22" y="3.5" textAnchor="middle" fontSize="9" fontFamily="monospace" fontWeight="700" fill="#fef08a">
                {formatHours(currentPos.currentStandardHour)}
              </text>
            </g>

            {/* 2) Distinct yellow sun symbol icon superimposed directly at current day & hour coordinate */}
            <g transform={`translate(${currentSunX}, ${currentSunY})`}>
              {/* Animated pulse halo */}
              <circle
                cx="0"
                cy="0"
                r="14"
                fill="none"
                stroke={isLiveTrack ? '#facc15' : '#38bdf8'}
                strokeWidth="1.5"
                opacity="0.8"
                className="animate-ping"
              />
              <circle
                cx="0"
                cy="0"
                r="9"
                fill={isLiveTrack ? '#facc15' : '#38bdf8'}
                filter="url(#sun-glow)"
              />
              <text x="0" y="4" textAnchor="middle" fontSize={isLiveTrack ? '13' : '11'} fill="#000000">
                {isLiveTrack ? '☀️' : '⏱'}
              </text>
            </g>
          </g>

          {/* 8. Interactive Cursor Inspection Line (when scrubbing) */}
          {activeDay && (hoveredDay || lockedDay) && (
            <g>
              <line
                x1={getX(activeDay.dayOfYear)}
                y1={chartTop}
                x2={getX(activeDay.dayOfYear)}
                y2={chartBottom}
                stroke="#38bdf8"
                strokeWidth="1.2"
                opacity="0.75"
              />
              {/* Daylight length point on green curve */}
              <circle
                cx={getX(activeDay.dayOfYear)}
                cy={getYRight(activeDay.daylightHours)}
                r="4.5"
                fill="#4ade80"
                stroke="#000"
                strokeWidth="1.5"
              />
            </g>
          )}

          {/* 8. Four Subtle Distinct Solstice & Equinox Marker Dots on the Daylight Curve */}
          <g>
            {milestones.map((m) => {
              const isHovered = hoveredMilestone?.id === m.id;
              const isLocked = lockedMilestone?.id === m.id;
              const isActive = isHovered || isLocked;

              return (
                <g
                  key={`milestone-dot-${m.id}`}
                  className="cursor-pointer group"
                  onPointerEnter={() => {
                    setHoveredMilestone(m);
                    setHoveredDay(m.dayData);
                  }}
                  onPointerLeave={() => {
                    setHoveredMilestone(null);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLockedMilestone((prev) => (prev?.id === m.id ? null : m));
                    setLockedDay(m.dayData);
                  }}
                >
                  {/* Generous touch/hover hit target for effortless interaction on mobile phones */}
                  <circle cx={m.x} cy={m.y} r={useBoostedTypography ? "28" : "20"} fill="transparent" />

                  {/* Subtle vertical alignment guideline when active */}
                  {isActive && (
                    <line
                      x1={m.x}
                      y1={chartTop}
                      x2={m.x}
                      y2={chartBottom}
                      stroke={m.color}
                      strokeWidth={useBoostedTypography ? "1.8" : "1.2"}
                      strokeDasharray="2 3"
                      opacity="0.75"
                    />
                  )}

                  {/* Subtle outer atmospheric aura glow */}
                  <circle
                    cx={m.x}
                    cy={m.y}
                    r={isActive ? (useBoostedTypography ? 16 : 11) : (useBoostedTypography ? 10 : 7)}
                    fill={m.color}
                    fillOpacity={isActive ? 0.5 : 0.28}
                    className="transition-all duration-200"
                  />

                  {/* Distinct central milestone marker dot */}
                  <circle
                    cx={m.x}
                    cy={m.y}
                    r={isActive ? (useBoostedTypography ? 8 : 5.5) : (useBoostedTypography ? 6 : 4)}
                    fill={m.dotColor}
                    stroke={m.borderColor}
                    strokeWidth={useBoostedTypography ? "2.2" : "1.6"}
                    className="transition-all duration-200"
                  />

                  {/* Animated radar pulse if actively hovered or locked */}
                  {isActive && (
                    <circle
                      cx={m.x}
                      cy={m.y}
                      r={useBoostedTypography ? "18" : "14"}
                      fill="none"
                      stroke={m.color}
                      strokeWidth={useBoostedTypography ? "1.5" : "1.2"}
                      strokeDasharray="3 2"
                      className="animate-spin"
                      style={{ animationDuration: '6s' }}
                    />
                  )}
                </g>
              );
            })}
          </g>

          {/* 9. Interactive Solstice / Equinox Tooltip (Hover & Tap: minimum 14px bold on mobile/landscape) */}
          {activeMilestone && (
            <g
              transform={`translate(${
                Math.max(chartLeft + 5, Math.min(chartRight - (useBoostedTypography ? 305 : 230), activeMilestone.x - (useBoostedTypography ? 150 : 110)))
              }, ${
                activeMilestone.y < chartTop + 140
                  ? activeMilestone.y + (useBoostedTypography ? 18 : 14)
                  : activeMilestone.y - (useBoostedTypography ? 114 : 80)
              })`}
              className="pointer-events-none select-none transition-all duration-150"
            >
              {/* Tooltip Card Container with Generous Touch Padding */}
              <rect
                x="0"
                y="0"
                width={useBoostedTypography ? 300 : 230}
                height={useBoostedTypography ? 106 : 74}
                rx="8"
                fill="#030712"
                fillOpacity="0.97"
                stroke={activeMilestone.color}
                strokeWidth={useBoostedTypography ? "2" : "1.4"}
                filter="drop-shadow(0 8px 24px rgba(0, 0, 0, 0.85))"
              />

              {/* Event Badge Dot & Name */}
              <circle
                cx={useBoostedTypography ? "18" : "15"}
                cy={useBoostedTypography ? "22" : "19"}
                r={useBoostedTypography ? "6" : "4.5"}
                fill={activeMilestone.dotColor}
                stroke={activeMilestone.borderColor}
                strokeWidth={useBoostedTypography ? "1.5" : "1"}
              />
              <text
                x={useBoostedTypography ? "32" : "26"}
                y={useBoostedTypography ? "27" : "23"}
                fill={activeMilestone.color}
                fontSize={useBoostedTypography ? "15" : "11.5"}
                fontFamily="monospace"
                fontWeight="bold"
                className="chart-tooltip-title"
              >
                {activeMilestone.name}
              </text>
              <text
                x={useBoostedTypography ? "286" : "216"}
                y={useBoostedTypography ? "27" : "22"}
                textAnchor="end"
                fill="#cbd5e1"
                fontSize={useBoostedTypography ? "14" : "9.5"}
                fontFamily="monospace"
                fontWeight="bold"
                className="chart-tooltip-text"
              >
                {activeMilestone.dateString}
              </text>

              {/* Subtle divider */}
              <line
                x1="12"
                y1={useBoostedTypography ? "38" : "32"}
                x2={useBoostedTypography ? "288" : "218"}
                y2={useBoostedTypography ? "38" : "32"}
                stroke="#1e293b"
                strokeWidth="1"
              />

              {/* Exact Daylight Duration for Milestone based on GPS Coordinates */}
              <text
                x="14"
                y={useBoostedTypography ? "58" : "47"}
                fill="#94a3b8"
                fontSize={useBoostedTypography ? "14" : "10"}
                fontFamily="monospace"
                fontWeight="bold"
                className="chart-tooltip-text"
              >
                Daylight:
              </text>
              <text
                x={useBoostedTypography ? "92" : "74"}
                y={useBoostedTypography ? "58" : "47"}
                fill="#4ade80"
                fontSize={useBoostedTypography ? "16" : "11"}
                fontFamily="monospace"
                fontWeight="bold"
                className="chart-tooltip-duration"
              >
                {activeMilestone.formattedDuration}
              </text>

              {/* Sunrise / Sunset times & milestone description */}
              <text
                x="14"
                y={useBoostedTypography ? "78" : "60"}
                fill="#94a3b8"
                fontSize={useBoostedTypography ? "14" : "9"}
                fontFamily="monospace"
                fontWeight={useBoostedTypography ? "600" : "500"}
                className="chart-tooltip-text"
              >
                Sunrise {formatHours(activeMilestone.dayData.sunrise)} · Sunset {formatHours(activeMilestone.dayData.sunset)}
              </text>
              <text
                x={useBoostedTypography ? "286" : "216"}
                y={useBoostedTypography ? "98" : "60"}
                textAnchor="end"
                fill="#94a3b8"
                fontSize={useBoostedTypography ? "14" : "8.5"}
                fontFamily="monospace"
                fontWeight="600"
                className="chart-tooltip-text"
              >
                {activeMilestone.approxDate}
              </text>
            </g>
          )}

          {/* Outer Border */}
          <rect
            x={chartLeft}
            y={chartTop}
            width={chartWidth}
            height={chartHeight}
            fill="none"
            stroke="#334155"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Active Milestone Mobile Callout Card: 14px+ text with generous touch padding */}
      {activeMilestone && (
        <div
          className="mt-3 p-3 sm:p-3.5 rounded-xl border flex items-center justify-between gap-3 text-sm font-mono shadow-lg transition-all"
          style={{
            backgroundColor: `${activeMilestone.color}15`,
            borderColor: `${activeMilestone.color}80`,
          }}
        >
          <div className="flex items-center gap-3">
            <span
              className="w-4 h-4 rounded-full shrink-0 shadow-[0_0_8px_currentColor]"
              style={{ backgroundColor: activeMilestone.dotColor, color: activeMilestone.color }}
            />
            <div>
              <div className="font-bold text-white text-sm sm:text-base flex items-center gap-2 flex-wrap">
                <span style={{ color: activeMilestone.color }}>{activeMilestone.name}</span>
                <span className="text-slate-400 font-semibold text-xs sm:text-sm">({activeMilestone.approxDate})</span>
              </div>
              <div className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
                <span className="text-emerald-400 font-bold text-sm sm:text-base">{activeMilestone.formattedDuration}</span>
                <span className="text-slate-300 font-medium">Daylight on {activeMilestone.dateString}</span>
                <span className="text-slate-500 hidden sm:inline">·</span>
                <span className="text-slate-400 hidden sm:inline">Sunrise {formatHours(activeMilestone.dayData.sunrise)} · Sunset {formatHours(activeMilestone.dayData.sunset)}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setLockedMilestone(null);
              setHoveredMilestone(null);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs sm:text-sm text-slate-200 font-bold shrink-0 transition-colors"
          >
            Close
          </button>
        </div>
      )}

      {/* Synchronized Inspection HUD Bar (Scrubber readout) */}
      <div className="mt-3 bg-slate-950/80 rounded-xl border border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3 text-sm sm:text-xs font-mono">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 font-medium">Inspecting:</span>
          <span className="text-amber-300 font-bold text-base sm:text-sm">
            {activeDay.dateString}
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-300 font-medium">Day {activeDay.dayOfYear}/365</span>
          {activeDay.dayOfYear === currentDayOfYear && (
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-xs font-bold">
              Today
            </span>
          )}
          {activeMilestone && (
            <span
              className="px-2.5 py-1 rounded text-xs font-bold border flex items-center gap-1.5"
              style={{
                backgroundColor: `${activeMilestone.color}22`,
                borderColor: `${activeMilestone.color}66`,
                color: activeMilestone.color,
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeMilestone.color }} />
              {activeMilestone.name} ({activeMilestone.approxDate})
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-5 flex-wrap text-slate-300">
          <div>
            <span className="text-slate-500 mr-1">Sunrise:</span>
            <span className="text-amber-200 font-semibold">{formatHours(activeDay.sunrise)}</span>
          </div>
          <div>
            <span className="text-slate-500 mr-1">Transit:</span>
            <span className="text-amber-400 font-semibold">{formatHours(activeDay.solarNoon)}</span>
          </div>
          <div>
            <span className="text-slate-500 mr-1">Sunset:</span>
            <span className="text-orange-300 font-semibold">{formatHours(activeDay.sunset)}</span>
          </div>
          <div>
            <span className="text-slate-500 mr-1">Nadir:</span>
            <span className="text-blue-300 font-semibold">{formatHours(activeDay.solarNadir)}</span>
          </div>
          <div>
            <span className="text-slate-500 mr-1">Daylight:</span>
            <span className="text-emerald-400 font-bold">{formatDuration(activeDay.daylightHours)}</span>
            <span className="text-emerald-500 text-[10px] ml-1">({activeDay.daylightHours.toFixed(2)}h)</span>
          </div>
        </div>

        {/* Quick Scrub Slider for Mobile & Touch */}
        <div className="w-full sm:w-auto flex items-center gap-2 text-slate-400 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-900">
          <span className="text-[10px] uppercase tracking-wider text-slate-500">Day Scrubber:</span>
          <input
            type="range"
            min="1"
            max="365"
            value={activeDay.dayOfYear}
            onChange={(e) => {
              const d = days[parseInt(e.target.value, 10) - 1];
              if (d) {
                setLockedMilestone(null);
                setLockedDay(d);
              }
            }}
            className="w-full sm:w-36 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
          {(lockedDay || lockedMilestone) && (
            <button
              onClick={() => {
                setLockedDay(null);
                setLockedMilestone(null);
              }}
              className="text-[10px] text-amber-300 hover:text-white underline font-mono"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
