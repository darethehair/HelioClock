import React, { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { Compass, Maximize2, Minimize2, Sparkles, Sun, Moon, Info, Eye, RotateCcw, Orbit } from 'lucide-react';
import { useElementFullscreen } from '../hooks/useElementFullscreen';
import { useClickRing } from '../hooks/useClickRing';
import { CurrentSolarPosition } from '../utils/solarCalculator';
import {
  calculateCelestialEphemeris,
  CelestialPoint,
  TrajectorySegment,
  PlanetTrajectoryData,
} from '../utils/celestialEphemeris';
import {
  calculateOrreryEphemeris,
  PlanetOrbitalState,
  OrrerySystemState,
} from '../utils/orreryEphemeris';

interface EquirectangularSkyMapProps {
  currentDate: Date;
  latitude: number;
  longitude: number;
  currentPos: CurrentSolarPosition;
  isLiveGps: boolean;
  isCustomCoordinates?: boolean;
  onResetGps?: () => void;
}

/**
 * Global Canvas Configuration Variables for Sky Observatory Component
 * Overrides static bold text blocks with dynamic platform condition:
 * - Desktop (> 1024px): "9px sans-serif" (sharp precision desktop font)
 * - Mobile (<= 1024px): "14px sans-serif"
 */
export function getCanvasFont(): string {
  if (typeof window !== 'undefined') {
    return window.innerWidth > 1024 ? "9px sans-serif" : "14px sans-serif";
  }
  return "9px sans-serif";
}

// Absolute Text Opacity & Color: crisp, un-shadowed soft silver-white (#d1d5db)
export const LABEL_COLOR = "#d1d5db";

/**
 * JavaScript Canvas Text-Drawing Functions for Sky Observatory Component
 * 1. Force the engine to explicitly call ctx.font = getCanvasFont() directly before every single fillText() canvas operation.
 * 2. Precision 9px Desktop Font.
 * 3. Vertical Collision Offsets: In both Circular Polar and Equirectangular drawing loops,
 *    if two star text labels have identical horizontal coordinates or sit within 12 vertical pixels of each other,
 *    dynamically push the lower star's text label down by an extra 10 pixels (ctx.textBaseline = 'top')
 *    and lift the upper star's text label up (ctx.textBaseline = 'bottom') to completely eliminate text stacking.
 * 4. Maintain clean 8-pixel horizontal spacer padding so text strings sit perfectly clear of brightness markers.
 */
export function drawStars(
  ctx: CanvasRenderingContext2D,
  stars: CelestialPoint[],
  projectCoord: (az: number, alt: number) => { x: number; y: number },
  screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
) {
  const isDesktop = screenWidth > 1024;

  const items = stars.map((star) => {
    const pt = projectCoord(star.azimuth, star.altitude);
    const mag = star.magnitude ?? 1.0;
    const starRadius = isDesktop
      ? Math.max(1.0, Math.min(3.2, 2.4 - mag * 0.45))
      : Math.max(1.0, Math.min(5.0, 3.5 - mag * 0.75));
    const isLeft = star.azimuth < 180;
    const labelX = isLeft ? pt.x - 8 - starRadius : pt.x + 8 + starRadius;
    return {
      star,
      pt,
      starRadius,
      isLeft,
      labelX,
      yOffset: 0,
      baseline: 'middle' as CanvasTextBaseline,
    };
  });

  // Vertical overlap separation check for Circular Polar & Equirectangular loops
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i];
      const b = items[j];

      // Check if they share the same horizontal side/close X coordinates and sit within 12 vertical pixels
      const sameHorizontalSide = a.isLeft === b.isLeft && Math.abs(a.pt.x - b.pt.x) < 45;
      const verticalDist = Math.abs(a.pt.y - b.pt.y);

      if (sameHorizontalSide && verticalDist <= 12) {
        if (a.pt.y < b.pt.y) {
          // 'a' is upper (smaller screen Y), lift up
          a.yOffset = -10;
          a.baseline = 'bottom';
          // 'b' is lower (larger screen Y), push down
          b.yOffset = 10;
          b.baseline = 'top';
        } else {
          // 'b' is upper, lift up
          b.yOffset = -10;
          b.baseline = 'bottom';
          // 'a' is lower, push down
          a.yOffset = 10;
          a.baseline = 'top';
        }
      }
    }
  }

  for (const item of items) {
    const { star, pt, starRadius, isLeft, labelX, yOffset, baseline } = item;

    ctx.beginPath();
    ctx.arc(pt.x, pt.y, starRadius, 0, Math.PI * 2);
    ctx.fillStyle = star.color;
    ctx.fill();

    // Absolute Text Opacity & Color: crisp soft silver-white (#d1d5db)
    ctx.fillStyle = LABEL_COLOR;
    ctx.textAlign = isLeft ? 'right' : 'left';
    ctx.textBaseline = yOffset !== 0 ? baseline : 'middle';
    ctx.font = getCanvasFont();
    ctx.fillText(star.name, labelX, pt.y + yOffset);
  }
}

export function drawPlanets(
  ctx: CanvasRenderingContext2D,
  planets: CelestialPoint[],
  projectCoord: (az: number, alt: number) => { x: number; y: number },
  screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
) {
  for (const planet of planets) {
    const pt = projectCoord(planet.azimuth, planet.altitude);
    const isDesktop = screenWidth > 1024;
    const planetRadius = isDesktop ? 2.5 : 3.5;

    ctx.beginPath();
    ctx.arc(pt.x, pt.y, planetRadius, 0, Math.PI * 2);
    ctx.fillStyle = planet.color;
    ctx.fill();

    // Absolute Text Opacity & Color: crisp soft silver-white (#d1d5db)
    ctx.fillStyle = LABEL_COLOR;

    // Hard horizontal offset with font evaluator called directly before fillText
    if (planet.azimuth < 180) {
      ctx.textAlign = 'right';
      ctx.font = getCanvasFont();
      ctx.fillText(planet.name, pt.x - 8 - planetRadius, pt.y + 3.5);
    } else {
      ctx.textAlign = 'left';
      ctx.font = getCanvasFont();
      ctx.fillText(planet.name, pt.x + 8 + planetRadius, pt.y + 3.5);
    }
  }
}

export function drawGridLabels(
  ctx: CanvasRenderingContext2D,
  altitudeTicks: { deg: number; label: string; isMajor?: boolean }[] = [],
  azimuthTicks: { deg: number; label: string }[] = [],
  paddingLeft = 50,
  paddingTop = 30,
  plotWidth = 800,
  plotHeight = 400
) {
  ctx.fillStyle = "#64748b";

  ctx.textAlign = 'right';
  for (const tick of altitudeTicks) {
    const y = paddingTop + ((90 - tick.deg) / 180) * plotHeight;
    ctx.font = getCanvasFont();
    ctx.fillText(`${tick.deg > 0 ? '+' : ''}${tick.deg}°`, paddingLeft - 8, y + 3.5);
  }

  ctx.textAlign = 'center';
  for (const tick of azimuthTicks) {
    const x = paddingLeft + (tick.deg / 360) * plotWidth;
    ctx.font = getCanvasFont();
    ctx.fillText(tick.label, x, paddingTop + plotHeight + 14);
  }
}

/**
 * High-Precision Observatory Polar Grid Lines Drawing Function
 * Draws thin concentric circular altitude rings (+30°, +60°) and 10-degree radial azimuth spokes
 * with ultra-thin 0.5px line width and delicate 15% opacity.
 */
export function drawPolarGridLines(
  ctx: CanvasRenderingContext2D,
  center: { x: number; y: number },
  radius: number,
  showGridLines: boolean
) {
  if (!showGridLines) return;
  ctx.save();
  ctx.lineWidth = 0.5;
  ctx.strokeStyle = '#38bdf8';
  ctx.globalAlpha = 0.15;

  // Concentric +60° and +30° Altitude Circles
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius * (30 / 90), 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(center.x, center.y, radius * (60 / 90), 0, Math.PI * 2);
  ctx.stroke();

  // 10-Degree Radial Azimuth Spokes from Zenith to Perimeter
  for (let deg = 0; deg < 360; deg += 10) {
    const rad = deg * (Math.PI / 180);
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(center.x + radius * Math.sin(rad), center.y - radius * Math.cos(rad));
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Canvas Trajectory Drawing Functions
 * 1. Sun Trajectory (orange dotted arc, 1px) above 0° True Horizon
 * 2. Moon Trajectory (white dotted arc, 1px) above 0° True Horizon
 * 3. Dynamic Planet Trajectories (Venus, Mars, Jupiter, Saturn) at 1px, dashed 3 3, 20% opacity
 */
export function drawSunTrajectory(
  ctx: CanvasRenderingContext2D,
  sunTrajectory: TrajectorySegment[],
  projectCoord: (az: number, alt: number) => { x: number; y: number }
) {
  ctx.save();
  for (const seg of sunTrajectory) {
    if (seg.points.length < 2) continue;
    for (let i = 0; i < seg.points.length - 1; i++) {
      const p1 = seg.points[i];
      const p2 = seg.points[i + 1];
      if (p1.alt < 0 && p2.alt < 0) continue;
      const isGolden = (p1.alt + p2.alt) / 2 <= 6.0;
      const pt1 = projectCoord(p1.az, p1.alt);
      const pt2 = projectCoord(p2.az, p2.alt);

      ctx.beginPath();
      ctx.moveTo(pt1.x, pt1.y);
      ctx.lineTo(pt2.x, pt2.y);
      ctx.strokeStyle = isGolden ? '#facc15' : '#f59e0b';
      ctx.lineWidth = isGolden ? 1.8 : 1;
      ctx.setLineDash(isGolden ? [3, 3] : [4, 4]);
      ctx.globalAlpha = isGolden ? 0.95 : 0.75;
      ctx.stroke();
    }
  }
  ctx.restore();
}

export function drawMoonTrajectory(
  ctx: CanvasRenderingContext2D,
  moonTrajectory: TrajectorySegment[],
  projectCoord: (az: number, alt: number) => { x: number; y: number }
) {
  ctx.save();
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.65;
  ctx.setLineDash([4, 4]);

  for (const seg of moonTrajectory) {
    if (seg.points.length < 2) continue;
    ctx.beginPath();
    let started = false;
    for (const pt of seg.points) {
      if (pt.alt < 0) continue;
      const screenPt = projectCoord(pt.az, pt.alt);
      if (!started) {
        ctx.moveTo(screenPt.x, screenPt.y);
        started = true;
      } else {
        ctx.lineTo(screenPt.x, screenPt.y);
      }
    }
    if (started) ctx.stroke();
  }
  ctx.restore();
}

export function drawPlanetTrajectories(
  ctx: CanvasRenderingContext2D,
  planetTrajectories: PlanetTrajectoryData[],
  projectCoord: (az: number, alt: number) => { x: number; y: number }
) {
  ctx.save();
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.20;
  ctx.setLineDash([3, 3]);

  for (const ptraj of planetTrajectories) {
    ctx.strokeStyle = ptraj.color;
    for (const seg of ptraj.segments) {
      if (seg.points.length < 2) continue;
      ctx.beginPath();
      let started = false;
      for (const pt of seg.points) {
        if (pt.alt < 0) continue;
        const screenPt = projectCoord(pt.az, pt.alt);
        if (!started) {
          ctx.moveTo(screenPt.x, screenPt.y);
          started = true;
        } else {
          ctx.lineTo(screenPt.x, screenPt.y);
        }
      }
      if (started) ctx.stroke();
    }
  }
  ctx.restore();
}

/**
 * Automatically offsets each planet's name label away from the center Sun
 * based on its active quadrant angle (above, below, left, right) and dynamically
 * separates close neighbors to prevent collision/clumping.
 */
interface OrreryPlanetLabelPosition {
  x: number;
  y: number;
  textAnchor: 'start' | 'middle' | 'end';
}

function getOrreryPlanetLabelLayout(
  planet: PlanetOrbitalState,
  allPlanets: PlanetOrbitalState[],
  sunCenter: { x: number; y: number }
): OrreryPlanetLabelPosition {
  const dx = planet.screenX - sunCenter.x;
  const dy = planet.screenY - sunCenter.y;
  const angleDeg = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;

  // Collision separation check: if another planet is within 38px
  const closeNeighbor = allPlanets.find(
    (other) => other.id !== planet.id && Math.hypot(planet.screenX - other.screenX, planet.screenY - other.screenY) < 38
  );

  const pad = 9;

  if (closeNeighbor) {
    // Separate by radial distance: inner stays closer/above, outer pushes further/below
    if (planet.distanceAU < closeNeighbor.distanceAU) {
      return {
        x: planet.screenX,
        y: planet.screenY - planet.displayRadius - 7,
        textAnchor: 'middle',
      };
    } else {
      return {
        x: planet.screenX,
        y: planet.screenY + planet.displayRadius + 14,
        textAnchor: 'middle',
      };
    }
  }

  // Active quadrant displacement away from the Sun:
  // Right quadrant (315° to 45°) -> place to right of marker
  if (angleDeg >= 315 || angleDeg < 45) {
    return {
      x: planet.screenX + planet.displayRadius + pad,
      y: planet.screenY + 3,
      textAnchor: 'start',
    };
  }
  // Bottom quadrant (45° to 135°) -> place below marker
  if (angleDeg >= 45 && angleDeg < 135) {
    return {
      x: planet.screenX,
      y: planet.screenY + planet.displayRadius + 14,
      textAnchor: 'middle',
    };
  }
  // Left quadrant (135° to 225°) -> place to left of marker
  if (angleDeg >= 135 && angleDeg < 225) {
    return {
      x: planet.screenX - planet.displayRadius - pad,
      y: planet.screenY + 3,
      textAnchor: 'end',
    };
  }
  // Top quadrant (225° to 315°) -> place above marker
  return {
    x: planet.screenX,
    y: planet.screenY - planet.displayRadius - 7,
    textAnchor: 'middle',
  };
}

export const EquirectangularSkyMap: React.FC<EquirectangularSkyMapProps> = ({
  currentDate,
  latitude,
  longitude,
  currentPos,
  isLiveGps,
  isCustomCoordinates = false,
  onResetGps,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const { isFullscreen, toggleFullscreen } = useElementFullscreen(containerRef);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { clickRing, startRing, updateRing, endRing } = useClickRing();

  // Responsive mobile screen detection (< 600px), desktop detection (>= 1024px), & mobile landscape orientation
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 600 : false
  );
  const [isLandscape, setIsLandscape] = useState<boolean>(() =>
    typeof window !== 'undefined' ? (window.matchMedia?.('(orientation: landscape)')?.matches || window.innerWidth > window.innerHeight) : false
  );
  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );
  const [isMobileLandscape, setIsMobileLandscape] = useState<boolean>(() =>
    typeof window !== 'undefined' ? ((window.matchMedia?.('(orientation: landscape)')?.matches || window.innerWidth > window.innerHeight) && window.innerWidth < 1024) : false
  );

  // View Display Mode: Equirectangular vs Circular Polar vs Top-down Heliocentric Orrery
  const [projectionMode, setProjectionMode] = useState<'equirectangular' | 'polar' | 'orrery'>('equirectangular');

  // Dynamic canvas bounds state: dynamically recalculates [x, y] width & height bounds
  // so background grid lines scale, stretch, and display cleanly across the full horizontal layout area in landscape mode
  const [canvasBounds, setCanvasBounds] = useState<{ width: number; height: number }>({
    width: 1000,
    height: 540,
  });

  const recalculateBounds = useCallback(() => {
    const winW = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const winH = typeof window !== 'undefined' ? window.innerHeight : 800;
    const isLand = (typeof window !== 'undefined' && window.matchMedia?.('(orientation: landscape)')?.matches) || winW > winH;

    setIsMobile(winW < 600);
    setIsLandscape(isLand);
    setIsDesktop(winW >= 1024);
    setIsMobileLandscape(isLand && winW < 1024);

    // Dynamic horizontal aspect ratio calculation for landscape orientation
    let containerAspect = 1000 / 540;
    if (viewportRef.current) {
      const rect = viewportRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        containerAspect = rect.width / rect.height;
      }
    } else if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        containerAspect = (rect.width - 40) / Math.max(300, rect.height - 100);
      }
    } else if (isLand) {
      containerAspect = Math.max(1.85, winW / Math.max(1, winH));
    }

    if (isLand && projectionMode === 'equirectangular') {
      const newWidth = Math.round(540 * Math.max(1.85, Math.min(2.5, containerAspect)));
      setCanvasBounds((prev) => (prev.width === newWidth && prev.height === 540 ? prev : { width: newWidth, height: 540 }));
    } else {
      setCanvasBounds((prev) => (prev.width === 1000 && prev.height === 540 ? prev : { width: 1000, height: 540 }));
    }
  }, [projectionMode]);

  useEffect(() => {
    recalculateBounds();

    const handleResize = () => {
      recalculateBounds();
      requestAnimationFrame(recalculateBounds);
      setTimeout(recalculateBounds, 120);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    const landscapeMedia = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(orientation: landscape)') : null;
    if (landscapeMedia) {
      if (landscapeMedia.addEventListener) {
        landscapeMedia.addEventListener('change', handleResize);
      } else if ('addListener' in landscapeMedia) {
        (landscapeMedia as any).addListener(handleResize);
      }
    }

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && viewportRef.current) {
      ro = new ResizeObserver(() => {
        handleResize();
      });
      ro.observe(viewportRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (landscapeMedia) {
        if (landscapeMedia.removeEventListener) {
          landscapeMedia.removeEventListener('change', handleResize);
        } else if ('removeListener' in landscapeMedia) {
          (landscapeMedia as any).removeListener(handleResize);
        }
      }
      if (ro) ro.disconnect();
    };
  }, [recalculateBounds]);

  // Hover / probe inspection state for horizontal celestial coordinates
  const [hoveredCoords, setHoveredCoords] = useState<{
    azimuth: number;
    altitude: number;
  } | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<CelestialPoint | null>(null);

  // Orrery Sub-Toggle: Inner Planets vs Outer Planets (Pluto excluded)
  const [orreryGroup, setOrreryGroup] = useState<'inner' | 'outer'>('inner');

  // Orrery Probe & Selection State
  const [hoveredOrreryPlanet, setHoveredOrreryPlanet] = useState<PlanetOrbitalState | null>(null);
  const [hoveredOrreryCoords, setHoveredOrreryCoords] = useState<{ rAU: number; lambdaDeg: number } | null>(null);
  const [selectedOrreryPlanet, setSelectedOrreryPlanet] = useState<PlanetOrbitalState | null>(null);

  // Observatory Layer Feature Visibility Toggles
  const [showPaths, setShowPaths] = useState<boolean>(true);
  const [showStars, setShowStars] = useState<boolean>(true);
  const [showPlanets, setShowPlanets] = useState<boolean>(true);
  const [showGridLines, setShowGridLines] = useState<boolean>(true);

  // SVG Geometry Dimensions: dynamically recalculates exact [x, y] bounds in landscape mode
  const width = canvasBounds.width;
  const height = canvasBounds.height;
  const paddingTop = 32;
  const paddingBottom = 42;
  const paddingLeft = 56;
  const paddingRight = 28;

  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;
  const horizonY = paddingTop + plotHeight / 2;

  // Circular Polar & Orrery Projection Dimensions: Center dynamically tracks width / 2
  const polarCenter = useMemo(() => ({ x: width / 2, y: height / 2 }), [width, height]);
  const polarRadius = 230;
  const orreryRadius = 245;

  // Real-time Keplerian orbital calculation for the Orrery view mode driven by currentDate
  const orreryEphemeris = useMemo(() => {
    return calculateOrreryEphemeris(currentDate, polarCenter, orreryGroup, orreryRadius);
  }, [currentDate, polarCenter, orreryGroup, orreryRadius]);

  // Active SVG ViewBox computation
  // In portrait on mobile, centers tightly on the circle. In landscape or desktop, spans full width x height.
  const activeViewBox = useMemo(() => {
    if (isMobile && !isLandscape && (projectionMode === 'polar' || projectionMode === 'orrery')) {
      const cx = width / 2;
      const cy = height / 2;
      return { x: cx - 265, y: cy - 265, width: 530, height: 530, str: `${cx - 265} ${cy - 265} 530 530` };
    }
    return { x: 0, y: 0, width, height, str: `0 0 ${width} ${height}` };
  }, [isMobile, isLandscape, projectionMode, width, height]);

  // Project (Azimuth, Altitude) to SVG (X, Y)
  const projectCoord = useCallback(
    (az: number, alt: number): { x: number; y: number } => {
      if (projectionMode === 'polar') {
        const clampedAlt = Math.max(-90, Math.min(90, alt));
        const r = polarRadius * ((90 - clampedAlt) / 90);
        const rad = (az % 360) * (Math.PI / 180);
        const x = polarCenter.x + r * Math.sin(rad);
        const y = polarCenter.y - r * Math.cos(rad);
        return { x, y };
      }

      const clampedAlt = Math.max(-90, Math.min(90, alt));
      const normAz = ((az % 360) + 360) % 360;
      const x = paddingLeft + (normAz / 360) * plotWidth;
      const y = paddingTop + ((90 - clampedAlt) / 180) * plotHeight;
      return { x, y };
    },
    [projectionMode, polarCenter, polarRadius, paddingLeft, paddingTop, plotWidth, plotHeight]
  );

  // Inverse projection from screen pixel to (Azimuth, Altitude)
  const unprojectCoord = useCallback(
    (px: number, py: number): { azimuth: number; altitude: number } => {
      if (projectionMode === 'polar') {
        const dx = px - polarCenter.x;
        const dy = py - polarCenter.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const alt = 90 * (1 - dist / polarRadius);
        const rad = Math.atan2(dx, -dy);
        const az = ((rad * 180 / Math.PI) % 360 + 360) % 360;
        return {
          azimuth: az,
          altitude: Math.max(-90, Math.min(90, alt)),
        };
      }

      const az = ((px - paddingLeft) / plotWidth) * 360;
      const alt = 90 - ((py - paddingTop) / plotHeight) * 180;
      return {
        azimuth: ((az % 360) + 360) % 360,
        altitude: Math.max(-90, Math.min(90, alt)),
      };
    },
    [projectionMode, polarCenter, polarRadius, paddingLeft, paddingTop, plotWidth, plotHeight]
  );

  // Calculate live celestial positions and diurnal arcs
  const ephemeris = useMemo(() => {
    return calculateCelestialEphemeris(currentDate, latitude, longitude, projectCoord);
  }, [currentDate, latitude, longitude, projectCoord]);

  // Sun screen coordinates
  const sunPos = useMemo(() => {
    return projectCoord(ephemeris.sun.azimuth, ephemeris.sun.altitude);
  }, [ephemeris.sun, projectCoord]);

  // Moon screen coordinates
  const moonPos = useMemo(() => {
    return projectCoord(ephemeris.moon.azimuth, ephemeris.moon.altitude);
  }, [ephemeris.moon, projectCoord]);

  // Sun Trajectory segments for Equirectangular View split at +6° Golden Hour boundary
  const equirectangularSunSegments = useMemo(() => {
    if (projectionMode !== 'equirectangular') return [];
    const segments: { path: string; isGolden: boolean }[] = [];
    for (const seg of ephemeris.sunTrajectory) {
      if (!seg.points || seg.points.length < 2) continue;
      let currentChunk: { x: number; y: number }[] = [];
      let currentIsGolden: boolean | null = null;

      for (let i = 0; i < seg.points.length; i++) {
        const pt = seg.points[i];
        if (pt.alt < 0) continue;
        const isPtGolden = pt.alt <= 6.0;
        const screenPt = projectCoord(pt.az, pt.alt);

        if (currentIsGolden === null) {
          currentIsGolden = isPtGolden;
          currentChunk.push(screenPt);
        } else if (currentIsGolden === isPtGolden) {
          currentChunk.push(screenPt);
        } else {
          currentChunk.push(screenPt);
          if (currentChunk.length >= 2) {
            segments.push({
              path: 'M ' + currentChunk.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L '),
              isGolden: currentIsGolden,
            });
          }
          currentChunk = [screenPt];
          currentIsGolden = isPtGolden;
        }
      }

      if (currentChunk.length >= 2 && currentIsGolden !== null) {
        segments.push({
          path: 'M ' + currentChunk.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L '),
          isGolden: currentIsGolden,
        });
      }
    }
    return segments;
  }, [projectionMode, ephemeris.sunTrajectory, projectCoord]);

  // Trajectory paths for Circular Polar Projection with +6° Golden Hour color split
  const polarSunTrajectory = useMemo(() => {
    if (projectionMode !== 'polar') return [];
    const segments: { path: string; isGolden: boolean }[] = [];
    for (const seg of ephemeris.sunTrajectory) {
      if (!seg.points || seg.points.length < 2) continue;
      let currentChunk: { x: number; y: number }[] = [];
      let currentIsGolden: boolean | null = null;

      for (let i = 0; i < seg.points.length; i++) {
        const pt = seg.points[i];
        if (pt.alt < 0) {
          if (currentChunk.length >= 2 && currentIsGolden !== null) {
            segments.push({
              path: 'M ' + currentChunk.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L '),
              isGolden: currentIsGolden,
            });
          }
          currentChunk = [];
          currentIsGolden = null;
          continue;
        }

        const isPtGolden = pt.alt <= 6.0;
        const screenPt = projectCoord(pt.az, pt.alt);

        if (currentIsGolden === null) {
          currentIsGolden = isPtGolden;
          currentChunk.push(screenPt);
        } else if (currentIsGolden === isPtGolden) {
          currentChunk.push(screenPt);
        } else {
          currentChunk.push(screenPt);
          if (currentChunk.length >= 2) {
            segments.push({
              path: 'M ' + currentChunk.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L '),
              isGolden: currentIsGolden,
            });
          }
          currentChunk = [screenPt];
          currentIsGolden = isPtGolden;
        }
      }

      if (currentChunk.length >= 2 && currentIsGolden !== null) {
        segments.push({
          path: 'M ' + currentChunk.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L '),
          isGolden: currentIsGolden,
        });
      }
    }
    return segments;
  }, [projectionMode, ephemeris.sunTrajectory, projectCoord]);

  const polarMoonTrajectory = useMemo(() => {
    if (projectionMode !== 'polar') return [];
    const paths: string[] = [];
    for (const seg of ephemeris.moonTrajectory) {
      let chunk: { x: number; y: number }[] = [];
      for (const pt of seg.points) {
        if (pt.alt >= 0) {
          chunk.push(projectCoord(pt.az, pt.alt));
        } else {
          if (chunk.length >= 2) {
            paths.push('M ' + chunk.map(p => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L '));
          }
          chunk = [];
        }
      }
      if (chunk.length >= 2) {
        paths.push('M ' + chunk.map(p => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L '));
      }
    }
    return paths;
  }, [projectionMode, ephemeris.moonTrajectory, projectCoord]);

  // Dynamic Planet Trajectories for Circular Polar Projection (Filtered strictly to alt >= 0)
  const polarPlanetTrajectories = useMemo(() => {
    if (projectionMode !== 'polar' || !ephemeris.planetTrajectories) return [];
    return ephemeris.planetTrajectories.map((ptraj) => {
      const paths: string[] = [];
      for (const seg of ptraj.segments) {
        let chunk: { x: number; y: number }[] = [];
        for (const pt of seg.points) {
          if (pt.alt >= 0) {
            chunk.push(projectCoord(pt.az, pt.alt));
          } else {
            if (chunk.length >= 2) {
              paths.push('M ' + chunk.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L '));
            }
            chunk = [];
          }
        }
        if (chunk.length >= 2) {
          paths.push('M ' + chunk.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L '));
        }
      }
      return {
        id: ptraj.id,
        name: ptraj.name,
        color: ptraj.color,
        paths,
      };
    });
  }, [projectionMode, ephemeris.planetTrajectories, projectCoord]);

  // Sky auto-dimming theme colors & graduated solar glow stops based on Sun Altitude
  const skyTheme = useMemo(() => {
    const alt = ephemeris.sun.altitude;

    if (alt >= 0) {
      // True Daylight: brilliant bright core fading into a soft, graduated white-to-light-blue daytime sky dome
      return {
        mode: 'daylight',
        skyGradientTop: '#0284c7', // rich sky blue
        skyGradientBottom: '#7dd3fc', // soft light-blue at horizon
        domeRadius: 440,
        domeStops: [
          { offset: '0%', color: '#ffffff', opacity: 0.95 },
          { offset: '10%', color: '#fef08a', opacity: 0.78 },
          { offset: '28%', color: '#bae6fd', opacity: 0.48 },
          { offset: '58%', color: '#7dd3fc', opacity: 0.22 },
          { offset: '100%', color: '#0284c7', opacity: 0 },
        ],
        textColor: '#0c4a6e',
        badgeBg: 'bg-sky-500/20 text-sky-200 border-sky-400/40',
      };
    } else if (alt >= -6) {
      // Civil Twilight / Horizon Dusk: warm amber and deep indigo gradients mimicking a realistic horizon dusk
      const factor = (alt - (-6)) / 6; // 0 (at -6°) to 1 (at 0°)
      return {
        mode: 'civil',
        skyGradientTop: '#1e3a8a',
        skyGradientBottom: factor > 0.5 ? '#f97316' : '#3b82f6',
        domeRadius: 360,
        domeStops: [
          { offset: '0%', color: '#fbbf24', opacity: 0.95 },
          { offset: '15%', color: '#f97316', opacity: 0.72 },
          { offset: '38%', color: '#c2410c', opacity: 0.42 },
          { offset: '65%', color: '#312e81', opacity: 0.24 },
          { offset: '100%', color: '#0f172a', opacity: 0 },
        ],
        textColor: '#93c5fd',
        badgeBg: 'bg-blue-900/60 text-blue-200 border-blue-500/50',
      };
    } else if (alt >= -12) {
      // Nautical Twilight: rich deep indigo transitioning toward dusk edge
      return {
        mode: 'nautical',
        skyGradientTop: '#0f172a',
        skyGradientBottom: '#1e3a8a',
        domeRadius: 260,
        domeStops: [
          { offset: '0%', color: '#f97316', opacity: 0.60 },
          { offset: '18%', color: '#9a3412', opacity: 0.38 },
          { offset: '45%', color: '#1e3a8a', opacity: 0.22 },
          { offset: '75%', color: '#0f172a', opacity: 0.10 },
          { offset: '100%', color: '#020617', opacity: 0 },
        ],
        textColor: '#cbd5e1',
        badgeBg: 'bg-indigo-950/70 text-indigo-200 border-indigo-600/50',
      };
    } else if (alt >= -18) {
      // Astronomical Twilight: dark midnight blue
      return {
        mode: 'astronomical',
        skyGradientTop: '#050811',
        skyGradientBottom: '#0e172a',
        domeRadius: 180,
        domeStops: [
          { offset: '0%', color: '#60a5fa', opacity: 0.32 },
          { offset: '40%', color: '#1e1b4b', opacity: 0.16 },
          { offset: '75%', color: '#090d16', opacity: 0.06 },
          { offset: '100%', color: '#020617', opacity: 0 },
        ],
        textColor: '#94a3b8',
        badgeBg: 'bg-violet-950/80 text-violet-200 border-violet-700/50',
      };
    } else {
      // True Night: deep cosmos black
      return {
        mode: 'night',
        skyGradientTop: '#02040a',
        skyGradientBottom: '#040814',
        domeRadius: 120,
        domeStops: [
          { offset: '0%', color: '#38bdf8', opacity: 0.14 },
          { offset: '45%', color: '#0f172a', opacity: 0.04 },
          { offset: '100%', color: '#020617', opacity: 0 },
        ],
        textColor: '#64748b',
        badgeBg: 'bg-slate-900/90 text-slate-300 border-slate-700/60',
      };
    }
  }, [ephemeris.sun.altitude]);

  // Pointer interactions for probe readout and interactive click-ring feedback loop
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = activeViewBox.width / rect.width;
    const scaleY = activeViewBox.height / rect.height;
    const px = activeViewBox.x + (e.clientX - rect.left) * scaleX;
    const py = activeViewBox.y + (e.clientY - rect.top) * scaleY;
    startRing(px, py);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = activeViewBox.width / rect.width;
    const scaleY = activeViewBox.height / rect.height;
    const px = activeViewBox.x + (e.clientX - rect.left) * scaleX;
    const py = activeViewBox.y + (e.clientY - rect.top) * scaleY;

    // Dynamically track the distance between anchor click and active cursor tip
    updateRing(px, py);

    if (projectionMode === 'orrery') {
      const activeList = orreryGroup === 'inner' ? orreryEphemeris.innerPlanets : orreryEphemeris.outerPlanets;
      const foundPlanet = activeList.find((p) => Math.hypot(px - p.screenX, py - p.screenY) <= Math.max(16, p.displayRadius + 8));
      if (foundPlanet) {
        setHoveredOrreryPlanet(foundPlanet);
        setHoveredOrreryCoords(null);
        return;
      }
      setHoveredOrreryPlanet(null);

      const distPx = Math.hypot(px - polarCenter.x, py - polarCenter.y);
      if (distPx <= orreryRadius + 24) {
        const maxScaleAU = orreryGroup === 'inner' ? 1.78 : 33.5;
        const pxPerAU = orreryRadius / maxScaleAU;
        const rAU = distPx / pxPerAU;
        const dx = px - polarCenter.x;
        const dy = -(py - polarCenter.y);
        const lambdaDeg = ((Math.atan2(dy, dx) * 180 / Math.PI) % 360 + 360) % 360;
        setHoveredOrreryCoords({ rAU, lambdaDeg });
      } else {
        setHoveredOrreryCoords(null);
      }
      return;
    }

    if (projectionMode === 'polar') {
      const dist = Math.hypot(px - polarCenter.x, py - polarCenter.y);
      if (dist <= polarRadius + 18) {
        setHoveredCoords(unprojectCoord(px, py));
      } else {
        setHoveredCoords(null);
      }
      return;
    }

    if (px >= paddingLeft && px <= paddingLeft + plotWidth && py >= paddingTop && py <= paddingTop + plotHeight) {
      setHoveredCoords(unprojectCoord(px, py));
    } else {
      setHoveredCoords(null);
    }
  };

  const handlePointerUp = () => {
    endRing();
  };

  const handlePointerLeave = () => {
    setHoveredCoords(null);
    setHoveredOrreryPlanet(null);
    setHoveredOrreryCoords(null);
    endRing();
  };

  // Polar Azimuth spokes (every 30° around the circle)
  const polarAzimuthSpokes = useMemo(() => {
    return [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
      const rad = deg * (Math.PI / 180);
      const isCardinal = deg % 90 === 0;
      const x2 = polarCenter.x + polarRadius * Math.sin(rad);
      const y2 = polarCenter.y - polarRadius * Math.cos(rad);
      return { deg, isCardinal, x2, y2 };
    });
  }, [polarCenter, polarRadius]);

  // Polar Cardinal Labels on the perimeter (clean 11px primary visual anchors without bold weights)
  const polarCardinals = useMemo(() => {
    const labelRadius = polarRadius + 21;
    return [
      { label: 'N', az: 0, isMajor: true },
      { label: 'NE', az: 45, isMajor: false },
      { label: 'E', az: 90, isMajor: true },
      { label: 'SE', az: 135, isMajor: false },
      { label: 'S', az: 180, isMajor: true },
      { label: 'SW', az: 225, isMajor: false },
      { label: 'W', az: 270, isMajor: true },
      { label: 'NW', az: 315, isMajor: false },
    ].map((card) => {
      const rad = card.az * (Math.PI / 180);
      const x = polarCenter.x + labelRadius * Math.sin(rad);
      const y = polarCenter.y - labelRadius * Math.cos(rad);
      return { ...card, x, y };
    });
  }, [polarCenter, polarRadius]);

  // High-Density 10-Degree Azimuth Scale for Circular Polar Horizon Perimeter
  const polarAzimuthScale = useMemo(() => {
    const numRadius = polarRadius + 8.5;
    return Array.from({ length: 36 }, (_, i) => i * 10).map((deg) => {
      const rad = deg * (Math.PI / 180);
      const sin = Math.sin(rad);
      const cos = Math.cos(rad);
      const isCardinal = deg % 90 === 0;
      const is30 = deg % 30 === 0;
      const tickLen = isCardinal ? 9 : is30 ? 6.5 : 4.5;

      // Inward tick coordinates
      const x1 = polarCenter.x + (polarRadius - tickLen) * sin;
      const y1 = polarCenter.y - (polarRadius - tickLen) * cos;
      const x2 = polarCenter.x + polarRadius * sin;
      const y2 = polarCenter.y - polarRadius * cos;

      // Thinned dashed extension line reaching further inward
      const extLen = isCardinal ? 20 : is30 ? 15 : 9;
      const xExt = polarCenter.x + (polarRadius - extLen) * sin;
      const yExt = polarCenter.y - (polarRadius - extLen) * cos;

      // Outer number coordinates
      const xNum = polarCenter.x + numRadius * sin;
      const yNum = polarCenter.y - numRadius * cos;

      return {
        deg,
        label: deg.toString(),
        isCardinal,
        is30,
        x1,
        y1,
        x2,
        y2,
        xExt,
        yExt,
        xNum,
        yNum,
      };
    });
  }, [polarCenter, polarRadius]);

  // Azimuth grid lines definitions (every 45°)
  const azimuthTicks = [
    { deg: 0, label: '0° N', cardinal: 'N' },
    { deg: 45, label: '45° NE', cardinal: 'NE' },
    { deg: 90, label: '90° E', cardinal: 'E' },
    { deg: 135, label: '135° SE', cardinal: 'SE' },
    { deg: 180, label: '180° S', cardinal: 'S' },
    { deg: 225, label: '225° SW', cardinal: 'SW' },
    { deg: 270, label: '270° W', cardinal: 'W' },
    { deg: 315, label: '315° NW', cardinal: 'NW' },
    { deg: 360, label: '360° N', cardinal: 'N' },
  ];

  // Altitude grid lines definitions (from -90° to +90° in steps of 30°, with 15° minor ticks)
  const altitudeTicks = [
    { deg: 90, label: '+90° (Zenith)', isMajor: true },
    { deg: 75, label: '+75°', isMajor: false },
    { deg: 60, label: '+60°', isMajor: true },
    { deg: 45, label: '+45°', isMajor: false },
    { deg: 30, label: '+30°', isMajor: true },
    { deg: 15, label: '+15°', isMajor: false },
    { deg: 0, label: '0° (Horizon)', isMajor: true, isHorizon: true },
    { deg: -15, label: '-15°', isMajor: false },
    { deg: -30, label: '-30°', isMajor: true },
    { deg: -45, label: '-45°', isMajor: false },
    { deg: -60, label: '-60°', isMajor: true },
    { deg: -75, label: '-75°', isMajor: false },
    { deg: -90, label: '-90° (Nadir)', isMajor: true },
  ];

  /**
   * JavaScript Canvas Text-Drawing Functions for Sky Observatory Component
   * 1. Override Canvas Font Variable: screen width > 1024px forces ctx.font = "11px sans-serif" (removing all 'bold' syntax).
   * 2. Fix Overlapping Label Collisions:
   *    - Stars/Planets with Azimuth < 180° drawn to the left of coordinate points (ctx.textAlign = 'right')
   *    - Stars/Planets with Azimuth >= 180° drawn to the right of coordinate points (ctx.textAlign = 'left')
   * 3. Add Coordinate Padding: fixed 8-pixel horizontal spacer padding between marker and text string.
   */
  const getCanvasFontInternal = useCallback((): string => {
    return getCanvasFont();
  }, []);

  // Dynamic label positioning helper for stars (displaces text based on Azimuth with 8px fixed padding and vertical offset)
  const getStarLabelPosition = useCallback((azimuth: number, radius: number, verticalShift = 0) => {
    const isLeft = azimuth < 180;
    return {
      x: isLeft ? -(radius + 8) : (radius + 8),
      y: verticalShift !== 0 ? 3.5 + verticalShift : 3.5,
      textAnchor: isLeft ? ('end' as const) : ('start' as const),
      textAlign: isLeft ? ('right' as const) : ('left' as const),
    };
  }, []);

  // Dynamic label positioning helper for planets (displaces text based on Azimuth with 8px fixed padding)
  const getPlanetLabelPosition = useCallback((azimuth: number, radius: number) => {
    const isLeft = azimuth < 180;
    return {
      x: isLeft ? -(radius + 8) : (radius + 8),
      y: 3.5,
      textAnchor: isLeft ? ('end' as const) : ('start' as const),
      textAlign: isLeft ? ('right' as const) : ('left' as const),
    };
  }, []);

  // Vertical overlap collision separation for stars in both Circular Polar and Equirectangular views
  const starCollisionMap = useMemo(() => {
    const map = new Map<string, { yOffset: number; dominantBaseline: 'auto' | 'hanging' }>();
    const visible = ephemeris.stars.filter((s) => !(projectionMode === 'polar' && s.altitude < 0));
    const projected = visible.map((star) => {
      const pt = projectCoord(star.azimuth, star.altitude);
      const isLeft = star.azimuth < 180;
      return { id: star.id, pt, isLeft };
    });

    for (let i = 0; i < projected.length; i++) {
      for (let j = i + 1; j < projected.length; j++) {
        const a = projected[i];
        const b = projected[j];
        const sameHorizontalSide = a.isLeft === b.isLeft && Math.abs(a.pt.x - b.pt.x) < 45;
        const verticalDist = Math.abs(a.pt.y - b.pt.y);

        if (sameHorizontalSide && verticalDist <= 12) {
          if (a.pt.y < b.pt.y) {
            map.set(a.id, { yOffset: -10, dominantBaseline: 'auto' });
            map.set(b.id, { yOffset: 10, dominantBaseline: 'hanging' });
          } else {
            map.set(b.id, { yOffset: -10, dominantBaseline: 'auto' });
            map.set(a.id, { yOffset: 10, dominantBaseline: 'hanging' });
          }
        }
      }
    }
    return map;
  }, [ephemeris.stars, projectionMode, projectCoord]);

  return (
    <div
      ref={containerRef}
      className={`fullscreen-module-card skymap-fullscreen w-full bg-black rounded-2xl border border-slate-800 p-3 sm:p-5 shadow-2xl relative select-none transition-all ${
        isFullscreen
          ? 'fullscreen-module-active !fixed !inset-0 !z-[99999] !rounded-none !p-2 sm:!p-4 !h-screen !w-screen flex flex-col justify-between overflow-y-auto bg-black'
          : ''
      }`}
    >
      {/* Unified Component Header: Sky Observatory */}
      <div className="flex flex-col gap-2.5 mb-3 text-xs border-b border-slate-800/80 pb-3">
        {/* Top Header Row: Unified Title + View Switcher + PROMINENT FULLSCREEN BUTTON PINNED TO TOP RIGHT */}
        <div className="flex items-center justify-between gap-2.5 w-full">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
            <div className="flex items-center gap-2 shrink-0">
              <div className="p-1.5 rounded-lg bg-sky-950/90 border border-sky-500/50 text-sky-400 shadow-xs">
                <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <span className="font-bold text-white tracking-wide text-sm sm:text-base block leading-tight">
                  Sky Observatory
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono hidden xs:inline block">
                  {projectionMode === 'orrery'
                    ? orreryGroup === 'inner'
                      ? 'Heliocentric Orrery · Inner Planets (≤ 1.85 AU)'
                      : 'Heliocentric Orrery · Outer Planets (≤ 33.5 AU, Pluto Excluded)'
                    : projectionMode === 'polar'
                    ? 'All-Sky Zenithal Polar Dome'
                    : 'Cylindrical 360° Equirectangular'}
                </span>
                {/* Inner Planet Alignment Engine Notification Tag */}
                {projectionMode === 'orrery' && orreryEphemeris.alignments.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-semibold flex items-center gap-1 shadow-xs animate-pulse">
                      <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                      <span>{orreryEphemeris.alignments[0].label}</span>
                      <span className="text-amber-200/70 text-[9px] hidden sm:inline">({orreryEphemeris.alignments[0].description})</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* View Mode Toggle: Equirectangular vs Circular Polar vs Orrery */}
            <div className="flex items-center rounded-lg bg-slate-900/90 p-0.5 border border-slate-700/80 font-mono shadow-inner">
              <button
                type="button"
                onClick={() => setProjectionMode('equirectangular')}
                className={`px-2 sm:px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                  projectionMode === 'equirectangular'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Equirectangular 360° x 180° cylindrical projection"
              >
                Equirectangular
              </button>
              <button
                type="button"
                onClick={() => setProjectionMode('polar')}
                className={`px-2 sm:px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                  projectionMode === 'polar'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Circular Polar Zenithal All-Sky projection (0° Horizon to 90° Zenith)"
              >
                Circular Polar
              </button>
              <button
                type="button"
                onClick={() => setProjectionMode('orrery')}
                className={`px-2 sm:px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                  projectionMode === 'orrery'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Top-down heliocentric Keplerian planetary Orrery view"
              >
                <Orbit className="w-3.5 h-3.5" />
                <span>Orrery</span>
              </button>
            </div>

            {/* Sub-toggle for Orrery view: Inner Planets vs Outer Planets (Pluto excluded) */}
            {projectionMode === 'orrery' && (
              <div className="flex items-center rounded-lg bg-slate-950 p-0.5 border border-amber-500/50 font-mono shadow-xs">
                <button
                  type="button"
                  onClick={() => setOrreryGroup('inner')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                    orreryGroup === 'inner'
                      ? 'bg-amber-500 text-black shadow-xs font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Inner Planets: Sun, Mercury, Venus, Earth, Mars"
                >
                  Inner Planets
                </button>
                <button
                  type="button"
                  onClick={() => setOrreryGroup('outer')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                    orreryGroup === 'outer'
                      ? 'bg-amber-500 text-black shadow-xs font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Outer Planets: Sun, Jupiter, Saturn, Uranus, Neptune (Pluto excluded)"
                >
                  Outer Planets
                </button>
              </div>
            )}
          </div>

          {/* Individual Module Fullscreen Toggle Button directly in the Upper Right Corner */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Sky Observatory Fullscreen (Esc)' : 'Maximize Sky Observatory to Fullscreen'}
            aria-label={isFullscreen ? 'Exit Sky Observatory Fullscreen' : 'Maximize Sky Observatory to Fullscreen'}
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

        {/* Sub-Header Row: Feature Toggles, Atmosphere Badge, and GPS Location */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
          {/* Feature Toggle Switches: Observatory Layer Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 bg-slate-900/95 border border-slate-800 rounded-lg px-2 sm:px-2.5 py-1 text-[11px] font-mono shadow-xs">
            <label className="flex items-center gap-1 cursor-pointer hover:text-white transition select-none">
              <input
                type="checkbox"
                checked={showPaths}
                onChange={(e) => setShowPaths(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-amber-500 bg-slate-950 border-slate-700 cursor-pointer"
              />
              <span className={`skymap-control-label ${showPaths ? 'text-amber-300 font-medium' : 'text-slate-500'}`}>
                {projectionMode === 'orrery' ? 'Orbits' : 'Paths'}
              </span>
            </label>

            <span className="text-slate-700">|</span>

            <label className="flex items-center gap-1 cursor-pointer hover:text-white transition select-none">
              <input
                type="checkbox"
                checked={showStars}
                onChange={(e) => setShowStars(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-cyan-400 bg-slate-950 border-slate-700 cursor-pointer"
              />
              <span className={`skymap-control-label ${showStars ? 'text-cyan-300 font-medium' : 'text-slate-500'}`}>
                {projectionMode === 'orrery' ? 'Labels' : 'Stars'}
              </span>
            </label>

            <span className="text-slate-700">|</span>

            <label className="flex items-center gap-1 cursor-pointer hover:text-white transition select-none">
              <input
                type="checkbox"
                checked={showPlanets}
                onChange={(e) => setShowPlanets(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-rose-400 bg-slate-950 border-slate-700 cursor-pointer"
              />
              <span className={`skymap-control-label ${showPlanets ? 'text-rose-300 font-medium' : 'text-slate-500'}`}>Planets</span>
            </label>

            <span className="text-slate-700">|</span>

            <label className="flex items-center gap-1 cursor-pointer hover:text-white transition select-none">
              <input
                type="checkbox"
                checked={showGridLines}
                onChange={(e) => setShowGridLines(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-sky-400 bg-slate-950 border-slate-700 cursor-pointer"
              />
              <span className={`skymap-control-label ${showGridLines ? 'text-sky-300 font-medium' : 'text-slate-500'}`}>
                {projectionMode === 'orrery' ? 'Scales' : 'Grid Lines'}
              </span>
            </label>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Dynamic Orbital Header Metrics in Orrery mode */}
            {projectionMode === 'orrery' && (
              <div className="skymap-orrery-metrics flex items-center gap-2 sm:gap-2.5 bg-slate-900/90 border border-slate-800 rounded-lg px-2 sm:px-2.5 py-1 text-[11px] font-mono shadow-xs font-normal">
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">Earth-Sun Distance:</span>
                  <span className="text-amber-300 font-normal">{orreryEphemeris.earthSunDistanceAU.toFixed(4)} AU</span>
                </div>
                <span className="text-slate-700">·</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">Equation of Time (EoT):</span>
                  <span className="text-cyan-300 font-normal">{orreryEphemeris.equationOfTimeFormatted}</span>
                </div>
              </div>
            )}

            {/* Active Atmosphere or Orrery Status Badge */}
            {projectionMode === 'orrery' ? (
              <div className="px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold flex items-center gap-1.5 bg-amber-950/70 text-amber-300 border-amber-600/50">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="uppercase">{orreryGroup} Solar System</span>
              </div>
            ) : (
              <div className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold flex items-center gap-1.5 ${skyTheme.badgeBg}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                <span className="uppercase">{skyTheme.mode} Atmosphere</span>
              </div>
            )}

            {/* GPS / Interactive Location Tag */}
            <div className="flex items-center gap-1.5 font-mono text-[10.5px]">
              <span className={isCustomCoordinates ? 'text-amber-300 font-semibold' : 'text-slate-400'}>
                {Math.abs(latitude).toFixed(2)}°{latitude >= 0 ? 'N' : 'S'}, {Math.abs(longitude).toFixed(2)}°{longitude >= 0 ? 'E' : 'W'}
                {isCustomCoordinates ? ' (Interactive Horizon)' : isLiveGps ? ' (GPS)' : ''}
              </span>
              {isCustomCoordinates && onResetGps && (
                <button
                  onClick={onResetGps}
                  className="px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-600/80 text-[10px] text-amber-300 hover:text-white flex items-center gap-1 font-mono active:scale-95 cursor-pointer font-bold transition shadow-xs"
                  title="Snap coordinates back to Morden live GPS baseline"
                >
                  <RotateCcw className="w-2.5 h-2.5 text-amber-400" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Sky Observatory Canvas / SVG Viewport */}
      {/* Dynamic resizing listener bounds: scales and stretches cleanly across landscape and portrait orientations */}
      <div
        ref={viewportRef}
        className={`skymap-viewport relative w-full overflow-hidden bg-[#020617] rounded-xl border border-slate-900 shadow-inner select-none transition-all ${
          isFullscreen
            ? 'flex-1 min-h-[50vh] sm:min-h-[60vh] h-full'
            : isMobile && !isLandscape && (projectionMode === 'polar' || projectionMode === 'orrery')
            ? 'aspect-square min-h-[320px] max-h-[75vh]'
            : isMobileLandscape
            ? 'aspect-[1000/540] max-h-[78vh]'
            : 'aspect-[1000/540] min-h-[340px] sm:min-h-[440px]'
        }`}
      >
        <svg
          ref={svgRef}
          viewBox={activeViewBox.str}
          className="absolute inset-0 w-full h-full object-contain cursor-crosshair"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerLeave}
        >
          <defs>
            {/* Equirectangular Sky Hemisphere Clip: Exactly above 0° Horizon */}
            <clipPath id="sky-hemisphere-clip">
              <rect x={paddingLeft} y={paddingTop} width={plotWidth} height={plotHeight / 2} />
            </clipPath>

            {/* Equirectangular Nadir/Ground Hemisphere Clip: Exactly below 0° Horizon */}
            <clipPath id="nadir-hemisphere-clip">
              <rect x={paddingLeft} y={horizonY} width={plotWidth} height={plotHeight / 2} />
            </clipPath>

            {/* Equirectangular Entire Plot Grid Clip */}
            <clipPath id="plot-area-clip">
              <rect x={paddingLeft} y={paddingTop} width={plotWidth} height={plotHeight} />
            </clipPath>

            {/* Circular Polar Horizon Clip: Exactly within 0° Horizon Circle */}
            <clipPath id="polar-horizon-clip">
              <circle cx={polarCenter.x} cy={polarCenter.y} r={polarRadius} />
            </clipPath>

            {/* Top-down Orrery Circular Boundary Clip */}
            <clipPath id="orrery-clip">
              <circle cx={polarCenter.x} cy={polarCenter.y} r={orreryRadius + 24} />
            </clipPath>

            {/* Equirectangular Dynamic Sky Background Gradient */}
            <linearGradient id="sky-vertical-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={skyTheme.skyGradientTop} />
              <stop offset="100%" stopColor={skyTheme.skyGradientBottom} />
            </linearGradient>

            {/* Circular Polar Sky Dome Radial Gradient */}
            <radialGradient id="polar-sky-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={skyTheme.skyGradientTop} />
              <stop offset="70%" stopColor={skyTheme.skyGradientBottom} />
              <stop offset="100%" stopColor={skyTheme.skyGradientBottom} />
            </radialGradient>

            {/* Orrery Deep Cosmic Space Gradient */}
            <radialGradient id="orrery-space-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#030712" />
              <stop offset="65%" stopColor="#020617" />
              <stop offset="100%" stopColor="#000000" />
            </radialGradient>

            {/* Orrery Central Sun Coronal Flare Gradient */}
            <radialGradient id="orrery-sun-corona" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="20%" stopColor="#fef08a" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#f59e0b" stopOpacity="0.65" />
              <stop offset="75%" stopColor="#ea580c" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#7c2d12" stopOpacity="0" />
            </radialGradient>

            {/* Realistic Soft-Glowing Circular Light Dome Tracking Sun's Position with Multi-Stop Scattering */}
            <radialGradient
              id="sun-atmospheric-dome"
              cx={sunPos.x}
              cy={sunPos.y}
              r={skyTheme.domeRadius}
              gradientUnits="userSpaceOnUse"
            >
              {skyTheme.domeStops.map((stop, i) => (
                <stop
                  key={`dome-stop-${i}`}
                  offset={stop.offset}
                  stopColor={stop.color}
                  stopOpacity={stop.opacity}
                />
              ))}
            </radialGradient>

            {/* Sun Glow Filter */}
            <filter id="sun-marker-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Star Sparkle Glow Filter */}
            <filter id="star-sparkle-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Horizon Glow Filter */}
            <filter id="horizon-glow" x="-10%" y="-100%" width="120%" height="300%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ======================================================== */}
          {/* VIEW MODE A: EQUIRECTANGULAR 360° x 180° PROJECTION      */}
          {/* ======================================================== */}
          {projectionMode === 'equirectangular' && (
            <>
              {/* 1. LAYER: UPPER SKY HEMISPHERE (Above 0° Horizon) with Auto-Dimming Atmospheric Dome */}
              <g clipPath="url(#sky-hemisphere-clip)">
                {/* Auto-Dimming Sky Background */}
                <rect
                  x={paddingLeft}
                  y={paddingTop}
                  width={plotWidth}
                  height={plotHeight / 2}
                  fill="url(#sky-vertical-gradient)"
                />

                {/* Soft-Glowing Circular Light Dome Centered at Sun */}
                <circle
                  cx={sunPos.x}
                  cy={sunPos.y}
                  r={skyTheme.domeRadius}
                  fill="url(#sun-atmospheric-dome)"
                />

                {/* Ambient Twilight Horizon Rolloff Sheen */}
                {ephemeris.sun.altitude < 10 && (
                  <rect
                    x={paddingLeft}
                    y={horizonY - 30}
                    width={plotWidth}
                    height={30}
                    fill="url(#sky-vertical-gradient)"
                    opacity="0.3"
                  />
                )}
              </g>

              {/* 2. LAYER: LOWER GROUND / NADIR HEMISPHERE (Below 0° Horizon) with Sharp High-Contrast Dark Theme */}
              <g clipPath="url(#nadir-hemisphere-clip)">
                {/* Deep High-Contrast Obsidian Ground Matrix */}
                <rect
                  x={paddingLeft}
                  y={horizonY}
                  width={plotWidth}
                  height={plotHeight / 2}
                  fill="#020617"
                />

                {/* Subtle Nadir Crosshatch / Space Grid Backdrop */}
                <rect
                  x={paddingLeft}
                  y={horizonY}
                  width={plotWidth}
                  height={plotHeight / 2}
                  fill="#030712"
                  fillOpacity="0.85"
                />

                {/* Faint Nadir Core Indicator at -90° */}
                <circle
                  cx={paddingLeft + plotWidth / 2}
                  cy={paddingTop + plotHeight}
                  r={120}
                  fill="#0f172a"
                  fillOpacity="0.2"
                />
              </g>

              {/* 3. LAYER: ELEGANT THIN GRID MATRIX (Altitude -90° to +90° & Azimuth 0° to 360°) */}
              {showGridLines && (
                <g clipPath="url(#plot-area-clip)">
                  {/* Vertical Azimuth Grid Lines: crisp 1px with 38% opacity */}
                  {azimuthTicks.map((tick) => {
                    const x = paddingLeft + (tick.deg / 360) * plotWidth;
                    const isCardinal = tick.deg % 90 === 0;
                    return (
                      <line
                        key={`az-line-${tick.deg}`}
                        x1={x}
                        y1={paddingTop}
                        x2={x}
                        y2={paddingTop + plotHeight}
                        stroke={isCardinal ? '#38bdf8' : '#64748b'}
                        strokeWidth="1"
                        strokeOpacity="0.38"
                        strokeDasharray={isCardinal ? undefined : '2 3'}
                        className="skymap-grid-line skymap-azimuth-spoke"
                      />
                    );
                  })}

                  {/* Horizontal Altitude Grid Lines: crisp 1px with 38% opacity */}
                  {altitudeTicks.map((tick) => {
                    if (tick.isHorizon) return null; // Horizon baseline drawn separately with high prominence
                    const y = paddingTop + ((90 - tick.deg) / 180) * plotHeight;
                    return (
                      <line
                        key={`alt-line-${tick.deg}`}
                        x1={paddingLeft}
                        y1={y}
                        x2={paddingLeft + plotWidth}
                        y2={y}
                        stroke={tick.deg > 0 ? '#38bdf8' : '#475569'}
                        strokeWidth="1"
                        strokeOpacity="0.38"
                        strokeDasharray={tick.isMajor ? undefined : '3 3'}
                        className="skymap-grid-line skymap-altitude-ring"
                      />
                    );
                  })}
                </g>
              )}

              {/* 4. LAYER: SHARP HORIZONTAL HORIZON BASELINE SPLIT AT EXACTLY 0° ALTITUDE */}
              <g>
                {/* Glowing Accent Baseline */}
                <line
                  x1={paddingLeft}
                  y1={horizonY}
                  x2={paddingLeft + plotWidth}
                  y2={horizonY}
                  stroke="#0284c7"
                  strokeWidth="3.5"
                  strokeOpacity="0.65"
                  filter="url(#horizon-glow)"
                />
                {/* Crisp High-Contrast Core Divider */}
                <line
                  x1={paddingLeft}
                  y1={horizonY}
                  x2={paddingLeft + plotWidth}
                  y2={horizonY}
                  stroke="#38bdf8"
                  strokeWidth="1.6"
                  strokeOpacity="0.95"
                />

                {/* Horizon Cardinal Direction Notches along 0° line */}
                {azimuthTicks.map((tick) => {
                  const x = paddingLeft + (tick.deg / 360) * plotWidth;
                  const isMajor = tick.deg % 90 === 0;
                  return (
                    <g key={`horizon-notch-${tick.deg}`} transform={`translate(${x}, ${horizonY})`}>
                      <line
                        x1="0"
                        y1={isMajor ? -6 : -3}
                        x2="0"
                        y2={isMajor ? 6 : 3}
                        stroke="#38bdf8"
                        strokeWidth={isMajor ? 1.5 : 1}
                      />
                      {isMajor && (
                        <circle cx="0" cy="0" r="2.5" fill="#38bdf8" />
                      )}
                    </g>
                  );
                })}

                {/* 0° Horizon Baseline Pill Badge */}
                <g transform={`translate(${paddingLeft + 10}, ${horizonY - (isMobileLandscape && isFullscreen ? 14 : 11)})`}>
                  <rect
                    x="0"
                    y="0"
                    width={isMobileLandscape && isFullscreen ? "148" : isDesktop ? "128" : "124"}
                    height={isMobileLandscape && isFullscreen ? "20" : "16"}
                    rx="3"
                    fill="#020617"
                    fillOpacity="0.88"
                    stroke="#38bdf8"
                    strokeWidth="0.8"
                  />
                  <text
                    x="6"
                    y={isMobileLandscape && isFullscreen ? "14" : "11"}
                    fill="#38bdf8"
                    fontSize={isMobileLandscape && isFullscreen ? "14" : isDesktop ? "11" : "9"}
                    fontFamily="monospace"
                    fontWeight={isMobileLandscape && isFullscreen ? "bold" : isDesktop ? "400" : "bold"}
                    letterSpacing="0.05em"
                    className="skymap-horizon-badge-text select-none pointer-events-none"
                  >
                    0° TRUE HORIZON
                  </text>
                </g>

                {/* +6° Golden Hour Shaded Band (0° to +6° Altitude) */}
                <rect
                  x={paddingLeft}
                  y={paddingTop + ((90 - 6) / 180) * plotHeight}
                  width={plotWidth}
                  height={(6 / 180) * plotHeight}
                  fill="#f59e0b"
                  fillOpacity="0.14"
                  className="skymap-golden-hour-band select-none pointer-events-none"
                />

                {/* +6° Golden Hour Thin Dashed Reference Line */}
                <line
                  x1={paddingLeft}
                  y1={paddingTop + ((90 - 6) / 180) * plotHeight}
                  x2={paddingLeft + plotWidth}
                  y2={paddingTop + ((90 - 6) / 180) * plotHeight}
                  stroke="#f59e0b"
                  strokeWidth="1.2"
                  strokeDasharray="4 3"
                  strokeOpacity="0.85"
                  className="skymap-golden-hour-line select-none pointer-events-none"
                />

                {/* +6° Golden Hour Label */}
                <g transform={`translate(${paddingLeft + plotWidth - (isMobileLandscape && isFullscreen ? 165 : 138)}, ${paddingTop + ((90 - 6) / 180) * plotHeight - 13})`}>
                  <rect
                    x="0"
                    y="0"
                    width={isMobileLandscape && isFullscreen ? "152" : "128"}
                    height="14"
                    rx="3"
                    fill="#020617"
                    fillOpacity="0.88"
                    stroke="#f59e0b"
                    strokeWidth="0.8"
                  />
                  <text
                    x={isMobileLandscape && isFullscreen ? "76" : "64"}
                    y="10"
                    textAnchor="middle"
                    fill="#fbbf24"
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                    letterSpacing="0.04em"
                    className="skymap-golden-hour-badge select-none pointer-events-none"
                  >
                    +6° GOLDEN HOUR
                  </text>
                </g>
              </g>

              {/* 5. LAYER: DOTTED PATHS (Strictly above 0° True Horizon) */}
              {showPaths && (
                <g clipPath="url(#sky-hemisphere-clip)">
                  {/* Sun 24-Hour Diurnal Trajectory: Gold inside 0°–6° Golden Hour band, orange above */}
                  {equirectangularSunSegments.map((seg, idx) => (
                    <path
                      key={`sun-traj-${idx}`}
                      d={seg.path}
                      fill="none"
                      stroke={seg.isGolden ? '#facc15' : '#f59e0b'}
                      strokeWidth={seg.isGolden ? '2' : '1.2'}
                      strokeDasharray={seg.isGolden ? '3 2' : '4 4'}
                      strokeOpacity={seg.isGolden ? '0.95' : '0.75'}
                      strokeLinecap="round"
                      className="skymap-path-sun"
                    />
                  ))}

                  {/* Moon 24-Hour Diurnal Trajectory: Crisp White Dotted Arc above 0° True Horizon */}
                  {ephemeris.moonTrajectory.map((seg, idx) => (
                    <path
                      key={`moon-traj-${idx}`}
                      d={seg.svgPath}
                      fill="none"
                      stroke="#f8fafc"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      strokeOpacity="0.65"
                      strokeLinecap="round"
                      className="skymap-path-moon"
                    />
                  ))}

                  {/* Dynamic Planet Paths: Rendered when BOTH showPaths and showPlanets are enabled */}
                  {showPlanets &&
                    ephemeris.planetTrajectories?.map((ptraj) =>
                      ptraj.segments.map((seg, sIdx) => (
                        <path
                          key={`planet-traj-${ptraj.id}-${sIdx}`}
                          d={seg.svgPath}
                          fill="none"
                          stroke={ptraj.color}
                          strokeWidth="1"
                          strokeDasharray="3 3"
                          strokeOpacity="0.20"
                          strokeLinecap="round"
                          className="skymap-path-planet"
                        />
                      ))
                    )}
                </g>
              )}
            </>
          )}

          {/* ======================================================== */}
          {/* VIEW MODE B: CIRCULAR POLAR ALL-SKY PROJECTION           */}
          {/* ======================================================== */}
          {projectionMode === 'polar' && (
            <>
              {/* 1. LAYER: HORIZON-BOUNDED CIRCULAR SKY DOME with Auto-Dimming Atmospheric Dome */}
              <g clipPath="url(#polar-horizon-clip)">
                {/* Auto-Dimming Circular Sky Dome Base */}
                <circle
                  cx={polarCenter.x}
                  cy={polarCenter.y}
                  r={polarRadius}
                  fill="url(#polar-sky-gradient)"
                />

                {/* Soft-Glowing Light Dome Centered at Sun's Polar Position */}
                <circle
                  cx={sunPos.x}
                  cy={sunPos.y}
                  r={skyTheme.domeRadius}
                  fill="url(#sun-atmospheric-dome)"
                />

                {/* Ambient Twilight Horizon Rolloff Sheen */}
                {ephemeris.sun.altitude < 10 && (
                  <circle
                    cx={polarCenter.x}
                    cy={polarCenter.y}
                    r={polarRadius - 8}
                    fill="none"
                    stroke={skyTheme.skyGradientBottom}
                    strokeWidth="18"
                    opacity="0.35"
                  />
                )}
              </g>

              {/* 3. LAYER: CONCENTRIC ALTITUDE RINGS & RADIAL AZIMUTH SPOKES (+30°, +60°, 90° Zenith) */}
              {showGridLines && (
                <g clipPath="url(#polar-horizon-clip)">
                  {/* +60° Altitude Concentric Ring: crisp 1px circular grid line with 38% opacity */}
                  <circle
                    cx={polarCenter.x}
                    cy={polarCenter.y}
                    r={polarRadius * (30 / 90)}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="1"
                    strokeOpacity="0.38"
                    className="skymap-grid-line skymap-altitude-ring"
                  />

                  {/* +30° Altitude Concentric Ring: crisp 1px circular grid line with 38% opacity */}
                  <circle
                    cx={polarCenter.x}
                    cy={polarCenter.y}
                    r={polarRadius * (60 / 90)}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="1"
                    strokeOpacity="0.38"
                    className="skymap-grid-line skymap-altitude-ring"
                  />

                  {/* Polar Azimuth Spokes: straight radial grid lines extending from absolute center Zenith (90° Altitude) to 10-degree perimeter tick markers */}
                  {Array.from({ length: 36 }, (_, i) => i * 10).map((deg) => {
                    const rad = deg * (Math.PI / 180);
                    const isCardinal = deg % 90 === 0;
                    const is30 = deg % 30 === 0;
                    const x2 = polarCenter.x + polarRadius * Math.sin(rad);
                    const y2 = polarCenter.y - polarRadius * Math.cos(rad);
                    return (
                      <line
                        key={`polar-spoke-${deg}`}
                        x1={polarCenter.x}
                        y1={polarCenter.y}
                        x2={x2}
                        y2={y2}
                        stroke={isCardinal ? '#38bdf8' : is30 ? '#38bdf8' : '#64748b'}
                        strokeWidth="1"
                        strokeOpacity="0.38"
                        strokeDasharray={isCardinal ? undefined : is30 ? '3 3' : '1 3'}
                        className="skymap-grid-line skymap-azimuth-spoke"
                      />
                    );
                  })}

                  {/* Zenith 90° Center Crosshair & Core Dot: crisp 1px with 38% opacity */}
                  <circle cx={polarCenter.x} cy={polarCenter.y} r="1.5" fill="#38bdf8" fillOpacity="0.7" />
                  <line
                    x1={polarCenter.x - 6}
                    y1={polarCenter.y}
                    x2={polarCenter.x + 6}
                    y2={polarCenter.y}
                    stroke="#38bdf8"
                    strokeWidth="1"
                    strokeOpacity="0.38"
                    className="skymap-grid-line"
                  />
                  <line
                    x1={polarCenter.x}
                    y1={polarCenter.y - 6}
                    x2={polarCenter.x}
                    y2={polarCenter.y + 6}
                    stroke="#38bdf8"
                    strokeWidth="1"
                    strokeOpacity="0.38"
                    className="skymap-grid-line"
                  />
                </g>
              )}

              {/* 4. LAYER: HORIZON-BOUNDED CIRCULAR MATRIX BOUNDARY & COMPASS CARDINALS */}
              <g>
                {/* Outer Glowing Accent Horizon Ring */}
                <circle
                  cx={polarCenter.x}
                  cy={polarCenter.y}
                  r={polarRadius}
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="3.5"
                  strokeOpacity="0.65"
                  filter="url(#horizon-glow)"
                />
                {/* Crisp High-Contrast Core Horizon Divider */}
                <circle
                  cx={polarCenter.x}
                  cy={polarCenter.y}
                  r={polarRadius}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.8"
                  strokeOpacity="0.95"
                />

                {/* High-Density 10-Degree Radials around 0° Horizon Perimeter (0° to 350°) */}
                {polarAzimuthScale.map((tick) => (
                  <g key={`polar-10deg-radial-${tick.deg}`}>
                    {/* Thinned dashed extension lines extending inward: crisp 1px with 38% opacity */}
                    <line
                      x1={tick.xExt}
                      y1={tick.yExt}
                      x2={tick.x1}
                      y2={tick.y1}
                      stroke="#38bdf8"
                      strokeWidth="1"
                      strokeDasharray="1 2"
                      strokeOpacity="0.38"
                      className="skymap-grid-line select-none pointer-events-none"
                    />
                    {/* Fine radial tick marker extending inward from 0° True Horizon perimeter ring */}
                    <line
                      x1={tick.x1}
                      y1={tick.y1}
                      x2={tick.x2}
                      y2={tick.y2}
                      stroke="#38bdf8"
                      strokeWidth="1"
                      strokeOpacity="0.38"
                      className="skymap-grid-line skymap-notch-line select-none pointer-events-none"
                    />
                  </g>
                ))}

                {/* Small Perimeter Azimuth Numbers: 8px font size, muted silver-gray (#9ca3af), un-bolded */}
                {polarAzimuthScale.map((tick) => (
                  <text
                    key={`polar-az-num-${tick.deg}`}
                    x={tick.xNum}
                    y={tick.yNum}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#9ca3af"
                    fontSize="8"
                    fontFamily="sans-serif"
                    fontWeight="normal"
                    className="skymap-azimuth-num select-none pointer-events-none opacity-85"
                  >
                    {tick.label}
                  </text>
                ))}

                {/* Perimeter Compass Cardinals (N, NE, E, SE, S, SW, W, NW) slightly larger at 11px, non-bold */}
                {polarCardinals.map((card) => (
                  <text
                    key={`polar-card-${card.az}`}
                    x={card.x}
                    y={card.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={card.isMajor ? '#38bdf8' : '#9ca3af'}
                    fontSize="11"
                    fontFamily="sans-serif"
                    fontWeight="normal"
                    className="skymap-cardinal-label select-none pointer-events-none"
                  >
                    {card.label}
                  </text>
                ))}

                {/* Interior Altitude Labels along North-South Meridian (scaled down to lightweight 9px non-bold style) */}
                {showGridLines && (
                  <>
                    <text
                      x={polarCenter.x + 5}
                      y={polarCenter.y - polarRadius * (30 / 90) - 3}
                      fill="#94a3b8"
                      fontSize="9"
                      fontFamily="sans-serif"
                      fontWeight="normal"
                      className="skymap-alt-label select-none pointer-events-none opacity-80"
                    >
                      +60°
                    </text>
                    <text
                      x={polarCenter.x + 5}
                      y={polarCenter.y - polarRadius * (60 / 90) - 3}
                      fill="#94a3b8"
                      fontSize="9"
                      fontFamily="sans-serif"
                      fontWeight="normal"
                      className="skymap-alt-label select-none pointer-events-none opacity-80"
                    >
                      +30°
                    </text>
                    <text
                      x={polarCenter.x}
                      y={polarCenter.y + 13}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="9"
                      fontFamily="sans-serif"
                      fontWeight="normal"
                      letterSpacing="0.05em"
                      className="skymap-alt-label select-none pointer-events-none opacity-80"
                    >
                      +90° ZENITH
                    </text>
                  </>
                )}

                {/* 0° Horizon Indicator Badge - Positioned subtly at bottom-right perimeter so North is completely unobstructed */}
                <g transform={`translate(${polarCenter.x + polarRadius * 0.56}, ${polarCenter.y + polarRadius * 0.74})`}>
                  <rect
                    x="0"
                    y="0"
                    width="104"
                    height="14"
                    rx="3"
                    fill="#020617"
                    fillOpacity="0.85"
                    stroke="#38bdf8"
                    strokeWidth="0.5"
                    strokeOpacity="0.35"
                  />
                  <text
                    x="52"
                    y="10"
                    textAnchor="middle"
                    fill="#38bdf8"
                    fontSize="8.5"
                    fontFamily="sans-serif"
                    fontWeight="normal"
                    letterSpacing="0.05em"
                    className="skymap-horizon-badge-text select-none pointer-events-none opacity-80"
                  >
                    0° TRUE HORIZON
                  </text>
                </g>

                {/* +6° Golden Hour Annular Shaded Ring (0° to +6° Altitude) */}
                <circle
                  cx={polarCenter.x}
                  cy={polarCenter.y}
                  r={(polarRadius + polarRadius * (84 / 90)) / 2}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth={polarRadius * (6 / 90)}
                  strokeOpacity="0.14"
                  className="skymap-golden-hour-polar-ring select-none pointer-events-none"
                />

                {/* +6° Golden Hour Dashed Concentric Reference Ring */}
                <circle
                  cx={polarCenter.x}
                  cy={polarCenter.y}
                  r={polarRadius * (84 / 90)}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="1.2"
                  strokeDasharray="4 3"
                  strokeOpacity="0.8"
                  className="skymap-golden-hour-polar-line select-none pointer-events-none"
                />

                {/* +6° Golden Hour Indicator Badge in Polar Mode */}
                <g transform={`translate(${polarCenter.x + polarRadius * 0.44}, ${polarCenter.y + polarRadius * 0.58})`}>
                  <rect
                    x="0"
                    y="0"
                    width="104"
                    height="14"
                    rx="3"
                    fill="#020617"
                    fillOpacity="0.88"
                    stroke="#f59e0b"
                    strokeWidth="0.6"
                    strokeOpacity="0.8"
                  />
                  <text
                    x="52"
                    y="10"
                    textAnchor="middle"
                    fill="#fbbf24"
                    fontSize="8"
                    fontFamily="monospace"
                    fontWeight="bold"
                    letterSpacing="0.04em"
                    className="select-none pointer-events-none"
                  >
                    +6° GOLDEN HOUR
                  </text>
                </g>
              </g>

              {/* 5. LAYER: DOTTED PATHS IN POLAR MODE (Strictly above 0° Horizon) */}
              {showPaths && (
                <g clipPath="url(#polar-horizon-clip)">
                  {/* Sun Diurnal Trajectory: Gold inside 0°–6° Golden Hour band, orange above */}
                  {polarSunTrajectory.map((seg, idx) => (
                    <path
                      key={`polar-sun-traj-${idx}`}
                      d={seg.path}
                      fill="none"
                      stroke={seg.isGolden ? '#facc15' : '#f59e0b'}
                      strokeWidth={seg.isGolden ? '2' : '1.2'}
                      strokeDasharray={seg.isGolden ? '3 2' : '4 4'}
                      strokeOpacity={seg.isGolden ? '0.95' : '0.75'}
                      strokeLinecap="round"
                      className="skymap-path-sun"
                    />
                  ))}

                  {/* Moon Diurnal Trajectory: Crisp White Dotted Arc above horizon */}
                  {polarMoonTrajectory.map((pathStr, idx) => (
                    <path
                      key={`polar-moon-traj-${idx}`}
                      d={pathStr}
                      fill="none"
                      stroke="#f8fafc"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      strokeOpacity="0.65"
                      strokeLinecap="round"
                      className="skymap-path-moon"
                    />
                  ))}

                  {/* Dynamic Planet Paths in Polar Mode: Rendered when BOTH showPaths and showPlanets are enabled */}
                  {showPlanets &&
                    polarPlanetTrajectories.map((ptraj) =>
                      ptraj.paths.map((pathStr, idx) => (
                        <path
                          key={`polar-planet-traj-${ptraj.id}-${idx}`}
                          d={pathStr}
                          fill="none"
                          stroke={ptraj.color}
                          strokeWidth="1"
                          strokeDasharray="3 3"
                          strokeOpacity="0.20"
                          strokeLinecap="round"
                          className="skymap-path-planet"
                        />
                      ))
                    )}
                </g>
              )}
            </>
          )}

          {/* ======================================================== */}
          {/* VIEW MODE C: TOP-DOWN ORRERY (HELIOCENTRIC PLANETARY SYSTEM) */}
          {/* ======================================================== */}
          {projectionMode === 'orrery' && (
            <g clipPath="url(#orrery-clip)">
              {/* Orrery Space Background Disc */}
              <circle
                cx={polarCenter.x}
                cy={polarCenter.y}
                r={orreryRadius + 22}
                fill="url(#orrery-space-gradient)"
                stroke="#1e293b"
                strokeWidth="1.5"
              />

              {/* Grid Lines & Scale Distance Rings */}
              {showGridLines && (
                <g>
                  {/* Cardinal / Ecliptic Longitude Reference Rays: crisp 1px with 38% opacity */}
                  {[0, 90, 180, 270].map((deg) => {
                    const rad = deg * (Math.PI / 180);
                    const rx = polarCenter.x + Math.cos(rad) * (orreryRadius + 14);
                    const ry = polarCenter.y - Math.sin(rad) * (orreryRadius + 14);
                    return (
                      <line
                        key={`orrery-ray-${deg}`}
                        x1={polarCenter.x}
                        y1={polarCenter.y}
                        x2={rx}
                        y2={ry}
                        stroke="#334155"
                        strokeWidth="1"
                        strokeDasharray="2 3"
                        strokeOpacity="0.38"
                        className="skymap-grid-line skymap-azimuth-spoke"
                      />
                    );
                  })}

                  {/* Vernal Equinox 0° Ecliptic Longitude Arrow Indicator */}
                  <line
                    x1={polarCenter.x}
                    y1={polarCenter.y}
                    x2={polarCenter.x + orreryRadius + 15}
                    y2={polarCenter.y}
                    stroke="#38bdf8"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    strokeOpacity="0.38"
                    className="skymap-grid-line"
                  />
                  <text
                    x={polarCenter.x + orreryRadius + 18}
                    y={polarCenter.y + 3.5}
                    fill="#38bdf8"
                    fontSize="11"
                    fontWeight="300"
                    className="skymap-orrery-scale-text font-mono select-none"
                  >
                    0° ♈
                  </text>

                  {/* Scale Concentric Distance Rings: Inner vs Outer (crisp 1px with 38% opacity) */}
                  {orreryGroup === 'inner' ? (
                    [0.5, 1.0, 1.5].map((au) => {
                      const pxPerAU = orreryRadius / 1.78;
                      const rPx = au * pxPerAU;
                      const isEarth = au === 1.0;
                      return (
                        <g key={`orrery-scale-ring-${au}`}>
                          <circle
                            cx={polarCenter.x}
                            cy={polarCenter.y}
                            r={rPx}
                            fill="none"
                            stroke={isEarth ? '#38bdf8' : '#334155'}
                            strokeWidth="1"
                            strokeDasharray={isEarth ? '4 3' : '2 3'}
                            strokeOpacity="0.38"
                            className="skymap-grid-line skymap-altitude-ring"
                          />
                          {/* AU reference label perfectly aligned directly on top of circular orbit path */}
                          <rect
                            x={polarCenter.x - (isEarth ? 42 : 24)}
                            y={polarCenter.y - rPx - 6}
                            width={isEarth ? 84 : 48}
                            height={12}
                            rx={3}
                            fill="#020617"
                            fillOpacity="0.85"
                          />
                          <text
                            x={polarCenter.x}
                            y={polarCenter.y - rPx + 3}
                            textAnchor="middle"
                            fill={isEarth ? '#38bdf8' : '#94a3b8'}
                            fontSize="9"
                            fontWeight="normal"
                            className="skymap-orrery-scale-text font-mono select-none opacity-90"
                          >
                            {au.toFixed(1)} AU{isEarth ? ' (1.0 AU Earth)' : ''}
                          </text>
                        </g>
                      );
                    })
                  ) : (
                    <>
                      {/* Inner Solar System Core Marker for Outer Mode */}
                      {(() => {
                        const pxPerAU = orreryRadius / 33.5;
                        const rPx = 1.78 * pxPerAU;
                        return (
                          <g>
                            <circle
                              cx={polarCenter.x}
                              cy={polarCenter.y}
                              r={rPx}
                              fill="#38bdf8"
                              fillOpacity="0.08"
                              stroke="#38bdf8"
                              strokeWidth="1"
                              strokeDasharray="2 2"
                              strokeOpacity="0.6"
                            />
                            <text
                              x={polarCenter.x + 6}
                              y={polarCenter.y - rPx - 3}
                              fill="#38bdf8"
                              fontSize="8"
                              fontWeight="600"
                              className="skymap-orrery-scale-text font-mono select-none opacity-90"
                            >
                              Inner System (&lt; 1.85 AU)
                            </text>
                          </g>
                        );
                      })()}

                      {/* Outer Rings: 5 AU, 10 AU, 15 AU, 20 AU, 30 AU */}
                      {[5, 10, 15, 20, 30].map((au) => {
                        const pxPerAU = orreryRadius / 33.5;
                        const rPx = au * pxPerAU;
                        return (
                          <g key={`orrery-outer-ring-${au}`}>
                            <circle
                              cx={polarCenter.x}
                              cy={polarCenter.y}
                              r={rPx}
                              fill="none"
                              stroke="#334155"
                              strokeWidth="1"
                              strokeDasharray="2 3"
                              strokeOpacity="0.38"
                              className="skymap-grid-line skymap-altitude-ring"
                            />
                            <text
                              x={polarCenter.x + 6}
                              y={polarCenter.y - rPx + 9}
                              fill="#64748b"
                              fontSize="11"
                              fontWeight="300"
                              className="skymap-orrery-scale-text font-mono select-none opacity-85"
                            >
                              {au} AU
                            </text>
                          </g>
                        );
                      })}
                    </>
                  )}
                </g>
              )}

              {/* Heliocentric Planetary Keplerian Orbits */}
              {showPaths && (
                <g>
                  {(orreryGroup === 'inner' ? orreryEphemeris.innerPlanets : orreryEphemeris.outerPlanets).map((planet) => (
                    <path
                      key={`orrery-orbit-${planet.id}`}
                      d={planet.orbitSvgPath}
                      fill="none"
                      stroke={planet.color}
                      strokeWidth="0.5"
                      strokeDasharray="3 3"
                      strokeOpacity="0.25"
                      className="skymap-path-line skymap-orbit-line"
                    />
                  ))}
                </g>
              )}

              {/* Central Sun Corona Flare & Glowing Sphere */}
              <circle
                cx={polarCenter.x}
                cy={polarCenter.y}
                r={28}
                fill="url(#orrery-sun-corona)"
                pointerEvents="none"
              />
              <circle
                cx={polarCenter.x}
                cy={polarCenter.y}
                r={7.5}
                fill="#fef08a"
                stroke="#f59e0b"
                strokeWidth="1.5"
                className="cursor-pointer"
                onClick={() => setSelectedOrreryPlanet(null)}
              />
              <text
                x={polarCenter.x}
                y={polarCenter.y + 19}
                textAnchor="middle"
                fill="#fef08a"
                fontSize="11"
                fontWeight="normal"
                className="skymap-orrery-label font-sans tracking-wider select-none"
              >
                SUN ☉
              </text>

              {/* Heliocentric Alignment Vector Line: Sun to Earth with 98.1° W Meridian Solar Noon Pointer */}
              {(() => {
                const earth = orreryEphemeris.innerPlanets.find((p) => p.id === 'earth');
                if (!earth) return null;

                const dx = earth.screenX - polarCenter.x;
                const dy = earth.screenY - polarCenter.y;
                const dist = Math.hypot(dx, dy);
                if (dist === 0) return null;
                const nx = dx / dist;
                const ny = dy / dist;

                const extensionLen = orreryGroup === 'inner' ? 28 : 14;
                const extX = earth.screenX + nx * extensionLen;
                const extY = earth.screenY + ny * extensionLen;

                return (
                  <g className="heliocentric-earth-vector select-none pointer-events-none">
                    {/* Ambient glow line under vector */}
                    <line
                      x1={polarCenter.x}
                      y1={polarCenter.y}
                      x2={earth.screenX}
                      y2={earth.screenY}
                      stroke="#fde047"
                      strokeWidth="1.5"
                      strokeOpacity="0.10"
                    />
                    {/* Thin, crisp 0.5px low-opacity vector line (ray of light) connecting Sun to Earth */}
                    <line
                      x1={polarCenter.x}
                      y1={polarCenter.y}
                      x2={earth.screenX}
                      y2={earth.screenY}
                      stroke="#fef08a"
                      strokeWidth="0.5"
                      strokeDasharray="4 3"
                      strokeOpacity="0.25"
                      className="skymap-path-line"
                    />

                    {/* Extended ray slightly beyond Earth's orbital path */}
                    <line
                      x1={earth.screenX}
                      y1={earth.screenY}
                      x2={extX}
                      y2={extY}
                      stroke="#38bdf8"
                      strokeWidth="0.5"
                      strokeDasharray="2 2"
                      strokeOpacity="0.25"
                      className="skymap-path-line"
                    />

                    {/* Tiny pointer indicator marking active 98.1° W longitude meridian line */}
                    <circle
                      cx={extX}
                      cy={extY}
                      r={isDesktop ? "2" : "3"}
                      fill="#38bdf8"
                      stroke="#0284c7"
                      strokeWidth={isDesktop ? "0.75" : "1"}
                    />
                    <circle
                      cx={extX}
                      cy={extY}
                      r={isDesktop ? "4.5" : "6"}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="0.6"
                      strokeOpacity="0.4"
                      strokeDasharray="2 2"
                    />

                    {/* Meridian pointer label */}
                    <text
                      x={extX + (nx >= 0 ? 6 : -6)}
                      y={extY + ny * 6 + 3}
                      textAnchor={nx >= 0 ? 'start' : 'end'}
                      fill="#38bdf8"
                      fontSize={isDesktop ? "11" : "8.5"}
                      fontWeight={isDesktop ? "400" : "600"}
                      className="skymap-orrery-scale-text font-mono"
                    >
                      98.1° W Meridian · Solar Noon Vector
                    </text>
                  </g>
                );
              })()}

              {/* Hover Radius or Alignment Ray Indicator */}
              {hoveredOrreryPlanet && (
                <line
                  x1={polarCenter.x}
                  y1={polarCenter.y}
                  x2={hoveredOrreryPlanet.screenX}
                  y2={hoveredOrreryPlanet.screenY}
                  stroke={hoveredOrreryPlanet.color}
                  strokeWidth="1"
                  strokeDasharray="2 2"
                  strokeOpacity="0.8"
                />
              )}

              {/* Planetary Bodies and Lightweight Silver Text Labels */}
              {showPlanets && (
                <g>
                  {(() => {
                    const activePlanets = orreryGroup === 'inner' ? orreryEphemeris.innerPlanets : orreryEphemeris.outerPlanets;
                    return activePlanets.map((planet) => {
                      const isSelected = selectedOrreryPlanet?.id === planet.id;
                      const isHovered = hoveredOrreryPlanet?.id === planet.id;
                      const labelLayout = getOrreryPlanetLabelLayout(planet, activePlanets, polarCenter);

                      return (
                        <g
                          key={`orrery-body-${planet.id}`}
                          className="cursor-pointer transition-transform"
                          onClick={() => setSelectedOrreryPlanet(planet)}
                        >
                          {/* Selected / Hover Ring */}
                          {(isSelected || isHovered) && (
                            <circle
                              cx={planet.screenX}
                              cy={planet.screenY}
                              r={planet.displayRadius + 6}
                              fill="none"
                              stroke={planet.color}
                              strokeWidth="1.2"
                              strokeDasharray="3 2"
                              className="animate-spin"
                            />
                          )}

                          {/* Ambient aura glow */}
                          <circle
                            cx={planet.screenX}
                            cy={planet.screenY}
                            r={planet.displayRadius + 4}
                            fill={planet.auraColor}
                            fillOpacity="0.30"
                          />

                          {/* Special Saturn Ring Graphics */}
                          {planet.id === 'saturn' && (
                            <>
                              <ellipse
                                cx={planet.screenX}
                                cy={planet.screenY}
                                rx={planet.displayRadius * 2.3}
                                ry={planet.displayRadius * 0.72}
                                fill="none"
                                stroke="#fde68a"
                                strokeWidth="2.2"
                                strokeOpacity="0.75"
                                transform={`rotate(-25 ${planet.screenX} ${planet.screenY})`}
                              />
                              <ellipse
                                cx={planet.screenX}
                                cy={planet.screenY}
                                rx={planet.displayRadius * 1.65}
                                ry={planet.displayRadius * 0.52}
                                fill="none"
                                stroke="#cbd5e1"
                                strokeWidth="1"
                                strokeOpacity="0.6"
                                transform={`rotate(-25 ${planet.screenX} ${planet.screenY})`}
                              />
                            </>
                          )}

                          {/* Planet Core Sphere */}
                          <circle
                            cx={planet.screenX}
                            cy={planet.screenY}
                            r={planet.displayRadius}
                            fill={planet.color}
                            stroke="#020617"
                            strokeWidth="0.8"
                          />

                          {/* Specular 3D Highlight for Sphere Realism */}
                          <circle
                            cx={planet.screenX - planet.displayRadius * 0.28}
                            cy={planet.screenY - planet.displayRadius * 0.28}
                            r={planet.displayRadius * 0.38}
                            fill="#ffffff"
                            fillOpacity="0.45"
                          />

                          {/* Clean Lightweight Un-Boxed Silver Text Label with Quadrant Placement & Collision Avoidance */}
                          {showStars && (
                            <g pointerEvents="none">
                              <text
                                x={labelLayout.x}
                                y={labelLayout.y}
                                textAnchor={labelLayout.textAnchor}
                                fill={LABEL_COLOR}
                                fontSize={isDesktop ? "9" : "14"}
                                fontWeight="normal"
                                className="skymap-orrery-label font-sans tracking-wide select-none"
                              >
                                {planet.name}{' '}
                                <tspan fill="#94a3b8" fontSize={isDesktop ? "9" : "14"} fontWeight="normal">
                                  ({planet.distanceAU.toFixed(2)} AU)
                                </tspan>
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    });
                  })()}
                </g>
              )}

              {/* Outer Perimeter Ring */}
              <circle
                cx={polarCenter.x}
                cy={polarCenter.y}
                r={orreryRadius + 22}
                fill="none"
                stroke="#334155"
                strokeWidth="1.2"
              />
            </g>
          )}

          {/* ======================================================== */}
          {/* CELESTIAL OBJECTS (SHARED ACROSS EQUIRECTANGULAR & POLAR) */}
          {/* ======================================================== */}
          {projectionMode !== 'orrery' && (
            <>
              {/* 6. LAYER: MAJOR STARS (Sirius, Betelgeuse, Rigel, Vega) */}
              {/* STRICTLY PLOTTED AS INDIVIDUAL POINT MARKERS WITH CLEAN UN-BOXED LABELS AND ZERO PATHS */}
              {showStars && (
                <g clipPath={projectionMode === 'polar' ? 'url(#polar-horizon-clip)' : 'url(#plot-area-clip)'}>
              {ephemeris.stars.map((star) => {
                // In polar mode, completely cull/hide any stars that drop below 0° Altitude
                if (projectionMode === 'polar' && star.altitude < 0) return null;

                const pt = projectCoord(star.azimuth, star.altitude);
                const isSelected = selectedPoint?.id === star.id;
                const mag = star.magnitude ?? 1.0;
                // Dynamic Magnitude Star Sizing: Brighter stars appear larger, scaled elegantly on desktop to prevent clustering overlap
                const starRadius = isDesktop
                  ? Math.max(1.0, Math.min(3.2, 2.4 - mag * 0.45))
                  : Math.max(1.0, Math.min(5.0, 3.5 - mag * 0.75));

                return (
                  <g
                    key={`star-${star.id}`}
                    transform={`translate(${pt.x}, ${pt.y})`}
                    className="cursor-pointer transition-transform hover:scale-125"
                    onClick={() => setSelectedPoint(star)}
                  >
                    {/* Subtle selection ring */}
                    {isSelected && (
                      <circle
                        cx="0"
                        cy="0"
                        r={starRadius + 8}
                        fill="none"
                        stroke={star.color}
                        strokeWidth="1"
                        strokeDasharray="2 2"
                        className="animate-spin"
                      />
                    )}

                    {/* Strictly ONE element: clean, solid, filled circular arc scaling to astronomical magnitude */}
                    <circle
                      cx="0"
                      cy="0"
                      r={starRadius}
                      fill={star.color}
                    />

                    {/* Clean, Un-Boxed Star Label with Azimuth Displaced 8px Padding & Vertical Collision Separation */}
                    {(() => {
                      const collision = starCollisionMap.get(star.id);
                      const vOffset = collision ? collision.yOffset : 0;
                      const pos = getStarLabelPosition(star.azimuth, starRadius, vOffset);
                      return (
                        <text
                          x={pos.x}
                          y={pos.y}
                          textAnchor={pos.textAnchor}
                          dominantBaseline={collision ? collision.dominantBaseline : undefined}
                          fill={LABEL_COLOR}
                          fontSize={isDesktop ? "9" : "14"}
                          fontFamily="sans-serif"
                          fontWeight="normal"
                          className="skymap-star-label select-none pointer-events-none"
                        >
                          {star.name}
                        </text>
                      );
                    })()}
                  </g>
                );
              })}
            </g>
          )}

          {/* 7. LAYER: VISIBLE PLANETS (Mars, Jupiter, Venus, Saturn) */}
          {/* STRICTLY PLOTTED AS INDIVIDUAL POINT MARKERS WITH CLEAN UN-BOXED LABELS AND ZERO PATHS */}
          {showPlanets && (
            <g clipPath={projectionMode === 'polar' ? 'url(#polar-horizon-clip)' : 'url(#plot-area-clip)'}>
              {ephemeris.planets.map((planet) => {
                // In polar mode, completely cull/hide any planets that drop below 0° Altitude
                if (projectionMode === 'polar' && planet.altitude < 0) return null;

                const pt = projectCoord(planet.azimuth, planet.altitude);
                const isSelected = selectedPoint?.id === planet.id;

                return (
                  <g
                    key={`planet-${planet.id}`}
                    transform={`translate(${pt.x}, ${pt.y})`}
                    className="cursor-pointer transition-transform hover:scale-125"
                    onClick={() => setSelectedPoint(planet)}
                  >
                    {/* Selection Ring */}
                    {isSelected && (
                      <circle
                        cx="0"
                        cy="0"
                        r={12}
                        fill="none"
                        stroke={planet.color}
                        strokeWidth="1"
                        strokeDasharray="2 2"
                        className="animate-spin"
                      />
                    )}

                    {/* Outer Planet Aura - Elegantly sized on desktop to avoid perimeter clustering */}
                    <circle
                      cx="0"
                      cy="0"
                      r={isDesktop ? 4.5 : 5.5}
                      fill={planet.color}
                      fillOpacity="0.25"
                    />
                    {/* Solid Planet Disc */}
                    <circle
                      cx="0"
                      cy="0"
                      r={isDesktop ? 2.5 : 3.5}
                      fill={planet.color}
                      stroke="#ffffff"
                      strokeWidth="0.75"
                    />

                    {/* Clean, Un-Boxed Planet Label with Azimuth Displaced 8px Padding */}
                    {(() => {
                      const planetRadius = isDesktop ? 2.5 : 3.5;
                      const pos = getPlanetLabelPosition(planet.azimuth, planetRadius);
                      return (
                        <text
                          x={pos.x}
                          y={pos.y}
                          textAnchor={pos.textAnchor}
                          fill={LABEL_COLOR}
                          fontSize={isDesktop ? "9" : "14"}
                          fontFamily="sans-serif"
                          fontWeight="normal"
                          className="skymap-planet-label select-none pointer-events-none"
                        >
                          {planet.name}
                        </text>
                      );
                    })()}
                  </g>
                );
              })}
            </g>
          )}

          {/* 8. LAYER: MOON CURRENT POSITION MARKER */}
          {!(projectionMode === 'polar' && ephemeris.moon.altitude < 0) && (
            <g
              transform={`translate(${moonPos.x}, ${moonPos.y})`}
              className="cursor-pointer transition-transform hover:scale-110"
              onClick={() => setSelectedPoint(ephemeris.moon)}
            >
              {/* Moon Glow Aura */}
              <circle
                cx="0"
                cy="0"
                r={14}
                fill="#e2e8f0"
                fillOpacity="0.2"
                className="animate-pulse"
              />
              {/* Moon Core */}
              <circle
                cx="0"
                cy="0"
                r={7}
                fill="#f8fafc"
                stroke="#94a3b8"
                strokeWidth="1.2"
              />
              {/* Moon Icon */}
              <text x="0" y="3.5" textAnchor="middle" fontSize="9" fill="#0f172a">
                🌙
              </text>

              {/* Clean, Un-Boxed Moon Label */}
              <text
                x={isMobileLandscape && isFullscreen ? 18 : 12}
                y="3"
                fill={LABEL_COLOR}
                fontSize={isDesktop ? '11' : isMobileLandscape && isFullscreen ? '14' : '8.5'}
                fontFamily="sans-serif"
                fontWeight={isDesktop ? 'normal' : isMobileLandscape && isFullscreen ? 'bold' : 'normal'}
                className="skymap-moon-label select-none pointer-events-none"
              >
                Moon ({Math.min(100, Math.max(0, Math.round(ephemeris.moon.illuminationFraction * 100)))}%)
              </text>
            </g>
          )}

          {/* 9. LAYER: SUN CURRENT POSITION MARKER */}
          {!(projectionMode === 'polar' && ephemeris.sun.altitude < 0) && (
            <g
              transform={`translate(${sunPos.x}, ${sunPos.y})`}
              className="cursor-pointer transition-transform hover:scale-110"
              onClick={() => setSelectedPoint(ephemeris.sun)}
            >
              {/* Outer Sunlight Ping Pulse */}
              <circle
                cx="0"
                cy="0"
                r={18}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="1.2"
                strokeOpacity="0.7"
                className="animate-ping"
              />
              {/* Sun Core Disc */}
              <circle
                cx="0"
                cy="0"
                r={9}
                fill="#f59e0b"
                stroke="#fef08a"
                strokeWidth="1.5"
                filter="url(#sun-marker-glow)"
              />
              {/* Sun Center Glyph */}
              <text x="0" y="4" textAnchor="middle" fontSize="11" fill="#000000">
                ☀️
              </text>

              {/* Clean, Un-Boxed Sun Label with Live Altitude */}
              <text
                x={isMobileLandscape && isFullscreen ? 18 : 14}
                y="3.5"
                fill="#fef08a"
                fontSize={isDesktop ? '11' : isMobileLandscape && isFullscreen ? '14' : '9'}
                fontFamily="sans-serif"
                fontWeight={isDesktop ? 'normal' : isMobileLandscape && isFullscreen ? 'bold' : 'normal'}
                className="skymap-sun-label select-none pointer-events-none"
              >
                Sun ({ephemeris.sun.altitude >= 0 ? '+' : ''}{ephemeris.sun.altitude.toFixed(1)}°)
              </text>
            </g>
          )}

          {/* 10. LAYER: AXIS LABELS & TICKS (RENDERED IN EQUIRECTANGULAR MODE) */}
          {projectionMode === 'equirectangular' && (
            <>
              {/* Vertical Altitude Labels on Left Edge */}
              {altitudeTicks.map((tick) => {
                const y = paddingTop + ((90 - tick.deg) / 180) * plotHeight;
                if (!tick.isMajor && tick.deg !== 0) return null;
                return (
                  <text
                    key={`alt-label-${tick.deg}`}
                    x={paddingLeft - 8}
                    y={y + 3.5}
                    textAnchor="end"
                    fill={tick.deg === 0 ? '#38bdf8' : tick.deg > 0 ? '#94a3b8' : '#64748b'}
                    fontSize={isDesktop ? '11' : isMobileLandscape && isFullscreen ? '14' : tick.deg === 0 ? '10' : '9'}
                    fontFamily="sans-serif"
                    fontWeight={isDesktop ? 'normal' : isMobileLandscape && isFullscreen ? 'bold' : tick.deg === 0 ? 'bold' : 'normal'}
                    className="skymap-axis-label"
                  >
                    {tick.deg > 0 ? `+${tick.deg}°` : `${tick.deg}°`}
                  </text>
                );
              })}

              {/* Horizontal Azimuth Labels on Bottom Edge */}
              {azimuthTicks.map((tick) => {
                const x = paddingLeft + (tick.deg / 360) * plotWidth;
                const isCardinal = tick.deg % 90 === 0;
                return (
                  <g key={`az-bottom-${tick.deg}`} transform={`translate(${x}, ${paddingTop + plotHeight + (isMobileLandscape && isFullscreen ? 18 : 14)})`}>
                    <text
                      x="0"
                      y="0"
                      textAnchor="middle"
                      fill={isCardinal ? '#38bdf8' : '#64748b'}
                      fontSize={isDesktop ? '11' : isMobileLandscape && isFullscreen ? '14' : isCardinal ? '10' : '8.5'}
                      fontFamily="sans-serif"
                      fontWeight={isDesktop ? 'normal' : isMobileLandscape && isFullscreen ? 'bold' : isCardinal ? 'bold' : 'normal'}
                      className="skymap-axis-label"
                    >
                      {tick.label}
                    </text>
                  </g>
                );
              })}

              {/* Axis Title Labels */}
              <text
                x={paddingLeft - (isMobileLandscape && isFullscreen ? 42 : 38)}
                y={horizonY}
                textAnchor="middle"
                transform={`rotate(-90, ${paddingLeft - (isMobileLandscape && isFullscreen ? 42 : 38)}, ${horizonY})`}
                fill="#64748b"
                fontSize={isDesktop ? '11' : isMobileLandscape && isFullscreen ? '14' : '9.5'}
                fontFamily="sans-serif"
                letterSpacing="0.1em"
                fontWeight={isDesktop ? 'normal' : 'bold'}
                className="skymap-axis-label"
              >
                ALTITUDE (ELEVATION)
              </text>

              <text
                x={paddingLeft + plotWidth / 2}
                y={height - (isMobileLandscape && isFullscreen ? 4 : 8)}
                textAnchor="middle"
                fill="#64748b"
                fontSize={isDesktop ? '11' : isMobileLandscape && isFullscreen ? '14' : '9.5'}
                fontFamily="sans-serif"
                letterSpacing="0.1em"
                fontWeight={isDesktop ? 'normal' : 'bold'}
                className="skymap-axis-label"
              >
                AZIMUTH BEARING (COMPASS DEGREES)
              </text>
            </>
          )}

          {/* Crosshair Probe Overlay when Hovered */}
          {hoveredCoords && (
            <g>
              {projectionMode === 'polar' ? (
                (() => {
                  const pt = projectCoord(hoveredCoords.azimuth, hoveredCoords.altitude);
                  const dist = Math.hypot(pt.x - polarCenter.x, pt.y - polarCenter.y);
                  return (
                    <>
                      {/* Radial spoke line from center to probed point */}
                      <line
                        x1={polarCenter.x}
                        y1={polarCenter.y}
                        x2={pt.x}
                        y2={pt.y}
                        stroke="#38bdf8"
                        strokeWidth="0.8"
                        strokeDasharray="2 2"
                        strokeOpacity="0.75"
                      />
                      {/* Concentric altitude probe ring */}
                      <circle
                        cx={polarCenter.x}
                        cy={polarCenter.y}
                        r={dist}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="0.8"
                        strokeDasharray="2 2"
                        strokeOpacity="0.5"
                      />
                      <circle cx={pt.x} cy={pt.y} r="3.5" fill="none" stroke="#38bdf8" strokeWidth="1.2" />
                    </>
                  );
                })()
              ) : (
                (() => {
                  const pt = projectCoord(hoveredCoords.azimuth, hoveredCoords.altitude);
                  return (
                    <>
                      <line
                        x1={pt.x}
                        y1={paddingTop}
                        x2={pt.x}
                        y2={paddingTop + plotHeight}
                        stroke="#38bdf8"
                        strokeWidth="0.8"
                        strokeDasharray="2 2"
                        strokeOpacity="0.75"
                      />
                      <line
                        x1={paddingLeft}
                        y1={pt.y}
                        x2={paddingLeft + plotWidth}
                        y2={pt.y}
                        stroke="#38bdf8"
                        strokeWidth="0.8"
                        strokeDasharray="2 2"
                        strokeOpacity="0.75"
                      />
                      <circle cx={pt.x} cy={pt.y} r="3" fill="none" stroke="#38bdf8" strokeWidth="1.2" />
                    </>
                  );
                })()
              )}
            </g>
          )}
        </>
      )}

      {/* Temporary Interactive Click-Ring Feedback Loop */}
      {clickRing && clickRing.active && (
        <circle
          cx={clickRing.anchorX}
          cy={clickRing.anchorY}
          r={clickRing.radius}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
          style={{
            opacity: clickRing.fading ? 0 : 0.4,
            transition: clickRing.fading ? 'opacity 300ms ease-out' : 'none',
          }}
          className="pointer-events-none select-none"
        />
      )}
    </svg>

        {/* Live Interactive Probe HUD Badge pinned at top-right inside map */}
        <div className="skymap-hud-text absolute top-2.5 right-3 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-3 shadow-xl">
          {projectionMode === 'orrery' ? (
            hoveredOrreryPlanet ? (
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                <span className="text-amber-300 font-bold">{hoveredOrreryPlanet.name}:</span>
                <span className="text-white font-bold">
                  {hoveredOrreryPlanet.distanceAU.toFixed(3)} AU ({hoveredOrreryPlanet.distanceMillionKm.toFixed(1)}M km)
                </span>
                <span className="text-slate-400">· λ {hoveredOrreryPlanet.heliocentricLongitudeDeg.toFixed(1)}°</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase bg-amber-950/80 text-amber-300 border border-amber-700/50">
                  v ≈ {hoveredOrreryPlanet.avgVelocityKmS} km/s
                </span>
              </div>
            ) : hoveredOrreryCoords ? (
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-slate-400">Orbit Probe:</span>
                <span className="text-white font-bold">r {hoveredOrreryCoords.rAU.toFixed(2)} AU</span>
                <span className="text-slate-400">· λ {hoveredOrreryCoords.lambdaDeg.toFixed(1)}°</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase bg-cyan-950/80 text-cyan-300 border border-cyan-700/50">
                  Heliocentric
                </span>
              </div>
            ) : selectedOrreryPlanet ? (
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span className="text-sky-300 font-bold">{selectedOrreryPlanet.name}:</span>
                <span className="text-slate-200">
                  {selectedOrreryPlanet.distanceAU.toFixed(3)} AU · Period {selectedOrreryPlanet.orbitalPeriodText}
                </span>
                <button
                  onClick={() => setSelectedOrreryPlanet(null)}
                  className="text-slate-500 hover:text-white ml-1 text-xs"
                  title="Clear selection"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-400 text-[10.5px]">
                <Orbit className="w-3.5 h-3.5 text-cyan-400" />
                <span>Hover or tap planets to probe heliocentric orbital distance (AU) & longitude</span>
              </div>
            )
          ) : hoveredCoords ? (
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-slate-400">Probe:</span>
              <span className="text-white font-bold">
                Az {hoveredCoords.azimuth.toFixed(1)}° · Alt {hoveredCoords.altitude >= 0 ? '+' : ''}{hoveredCoords.altitude.toFixed(1)}°
              </span>
              <span className={`text-[10px] px-1 py-0.2 rounded font-bold uppercase ${hoveredCoords.altitude >= 0 ? 'bg-sky-950 text-sky-300' : 'bg-slate-900 text-slate-400'}`}>
                {hoveredCoords.altitude >= 0 ? 'Sky' : 'Nadir'}
              </span>
            </div>
          ) : selectedPoint ? (
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span className="text-sky-300 font-bold">{selectedPoint.name}:</span>
              <span className="text-slate-200">{selectedPoint.extraInfo}</span>
              <button
                onClick={() => setSelectedPoint(null)}
                className="text-slate-500 hover:text-white ml-1 text-xs"
                title="Clear selection"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-400 text-[10.5px]">
              <Info className="w-3.5 h-3.5 text-sky-400" />
              <span>Hover or tap anywhere to inspect Azimuth & Altitude coordinates</span>
            </div>
          )}
        </div>
      </div>

      {/* Ephemeris Summary Telemetry Footer Strip */}
      <div className="skymap-telemetry-text mt-3 bg-slate-950/80 rounded-xl border border-slate-900 p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono">
        {projectionMode === 'orrery' ? (
          <>
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-slate-300">
              <div className="flex items-center gap-1.5">
                <Orbit className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-500">Planetary System:</span>
                <span className="text-cyan-300 font-bold">
                  {orreryGroup === 'inner' ? 'Inner (Mercury, Venus, Earth, Mars)' : 'Outer (Jupiter, Saturn, Uranus, Neptune)'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Active Scrub:</span>
                <span className="text-white font-bold">
                  {currentDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <Eye className="w-3 h-3 text-emerald-400" />
              <span>Keplerian Heliocentric Elements · Pluto Omitted</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-slate-300">
              <div className="flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-500">Sun:</span>
                <span className="text-amber-300 font-bold">
                  Alt {ephemeris.sun.altitude >= 0 ? '+' : ''}{ephemeris.sun.altitude.toFixed(1)}°, Az {ephemeris.sun.azimuth.toFixed(1)}°
                </span>
                {ephemeris.sun.altitude >= 0 && ephemeris.sun.altitude <= 6.0 && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-400 text-slate-950 border border-amber-300 shadow-xs">
                    Golden Hour (+6°)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-slate-500">Moon:</span>
                <span className="text-white font-bold">
                  {ephemeris.moon.phaseName} ({Math.min(100, Math.max(0, Math.round(ephemeris.moon.illuminationFraction * 100)))}%) · Alt {ephemeris.moon.altitude >= 0 ? '+' : ''}{ephemeris.moon.altitude.toFixed(1)}°
                </span>
              </div>

              <div className="hidden sm:flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-500">Visible Point Markers:</span>
                <span className="text-cyan-300 font-semibold">
                  Sirius, Betelgeuse, Rigel, Vega · Venus, Mars, Jupiter, Saturn
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <Eye className="w-3 h-3 text-emerald-400" />
              <span>Restraint: Dotted Arcs ONLY for Sun & Moon</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
