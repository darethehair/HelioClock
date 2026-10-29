import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Moon, Maximize2, Minimize2, Compass } from 'lucide-react';
import { useElementFullscreen } from '../hooks/useElementFullscreen';
import { calculateDetailedMoonPhase, DetailedMoonMetrics } from '../utils/celestialEphemeris';
import moonTextureUrl from '../assets/images/moon_hd_texture_1793017525408.jpg';

interface MoonPhaseCardProps {
  currentDate: Date;
  latitude: number;
  longitude: number;
}

export const MoonPhaseCard: React.FC<MoonPhaseCardProps> = ({
  currentDate,
  latitude,
  longitude,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isFullscreen, toggleFullscreen } = useElementFullscreen(containerRef);
  const [textureLoaded, setTextureLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Aggressive geometric radius scaling in fullscreen mode (targeting 85vh to 90vh)
  const [fullscreenSize, setFullscreenSize] = useState(600);

  // Compute synodic ephemeris and bright limb tilt
  const metrics: DetailedMoonMetrics = useMemo(() => {
    return calculateDetailedMoonPhase(currentDate, latitude, longitude);
  }, [currentDate, latitude, longitude]);

  // True sunlit fraction percent with strict boundary clamp [0, 100]
  const illumination = metrics.illumination ?? metrics.illuminationFraction;
  let calculatedPercent = illumination * 100;
  calculatedPercent = Math.min(100, Math.max(0, calculatedPercent));
  const illuminationPercentText = `${calculatedPercent.toFixed(1)}%`;


  // Dynamically calculate maximized canvas bounds in fullscreen mode (85vh - 90vh)
  useEffect(() => {
    if (!isFullscreen) return;

    const updateMaximizedBounds = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Target 85vh to 88vh to absorb almost the entire vertical viewport area
      const targetH = Math.round(h * 0.87);
      const targetW = Math.round(w - 20);
      const calculatedSize = Math.max(240, Math.min(targetH, targetW));
      setFullscreenSize(calculatedSize);
    };

    updateMaximizedBounds();
    window.addEventListener('resize', updateMaximizedBounds);
    return () => window.removeEventListener('resize', updateMaximizedBounds);
  }, [isFullscreen]);

  // Load the HD lunar texture once
  useEffect(() => {
    const img = new Image();
    img.src = moonTextureUrl;
    img.onload = () => {
      imgRef.current = img;
      setTextureLoaded(true);
    };
    img.onerror = () => {
      console.warn('Moon texture failed to load, falling back to procedural sphere.');
      setTextureLoaded(true);
    };
  }, []);

  const displaySize = isFullscreen ? fullscreenSize : 96;

  // Draw the dynamically shaded, tilted lunar sphere
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 2;
    canvas.width = displaySize * dpr;
    canvas.height = displaySize * dpr;

    ctx.save();
    ctx.scale(dpr, dpr);

    const cx = displaySize / 2;
    const cy = displaySize / 2;
    const R = displaySize / 2 - 3;

    ctx.clearRect(0, 0, displaySize, displaySize);

    // 1. Clip to the circular lunar disk
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.clip();

    // 2. UNIFIED TOPOCENTRIC LUNAR COORDINATE SPACE
    // Origin is at lunar center (cx, cy).
    // Zenith (straight UP in observer's field of view) is at canvas -Y.
    ctx.save();
    ctx.translate(cx, cy);

    // A. Draw base lunar surface texture dynamically oriented by the topocentric pole vector
    // metrics.poleAngleFromZenithDeg is the true angle of the Lunar/Celestial North Pole
    // relative to the observer's local Zenith (clockwise from UP).
    // In the Southern Hemisphere, this automatically rotates the lunar disc upside down (~180°),
    // correctly matching naked-eye sky reality worldwide without static mirrors.
    ctx.save();
    ctx.rotate((metrics.poleAngleFromZenithDeg * Math.PI) / 180);
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      ctx.drawImage(imgRef.current, -R, -R, R * 2, R * 2);
    } else {
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-R, -R, R * 2, R * 2);
    }
    ctx.restore();

    // B. Lighting / Terminator Phase Angle Mask in the same topocentric observer space
    // metrics.sunAngleFromZenithDeg points directly toward the Sun in the observer's sky plane.
    // In canvas coordinates, Zenith is -90° (-Y), so canvas rotation is (sunAngleFromZenithDeg - 90)°.
    ctx.save();
    const sunRotRad = ((metrics.sunAngleFromZenithDeg - 90) * Math.PI) / 180;
    ctx.rotate(sunRotRad);

    // In this rotated coordinate system:
    // +X points directly toward the Sun (illuminated limb).
    // -X points away from the Sun (dark hemisphere).
    // Terminator curve equation: x_T(y) = r(y) * cos(Elongation)
    const cosD = metrics.cosElongation ?? Math.cos((metrics.elongationDeg * Math.PI) / 180);

    ctx.beginPath();
    // Start at top pole (0, -R)
    ctx.moveTo(0, -R);

    // Follow the outer dark rim (semi-circle on the -X side)
    ctx.arc(0, 0, R, -Math.PI / 2, Math.PI / 2, true);

    // Follow the elliptical terminator line back up from (0, +R) to (0, -R)
    const steps = 64;
    for (let i = steps; i >= 0; i--) {
      const t = (i / steps) * 2 - 1; // from +1 to -1
      const y = t * R;
      const r = Math.sqrt(Math.max(0, R * R - y * y));
      const x = r * cosD;
      ctx.lineTo(x, y);
    }
    ctx.closePath();

    // Fill the shadowed side with realistic deep shadow (subtle 7% earthshine visibility)
    ctx.fillStyle = 'rgba(6, 8, 16, 0.93)';
    ctx.fill();

    // Soft terminator diffusion stroke
    ctx.lineWidth = Math.max(1, R * 0.035);
    ctx.strokeStyle = 'rgba(6, 8, 16, 0.4)';
    ctx.stroke();

    // C. 3D Spherical Ambient & Limb Darkening Overlay oriented toward the Sun
    const sphereGrad = ctx.createRadialGradient(R * 0.25, -R * 0.1, R * 0.05, 0, 0, R);
    sphereGrad.addColorStop(0, 'rgba(255, 255, 255, 0.06)');
    sphereGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
    sphereGrad.addColorStop(1, 'rgba(2, 4, 10, 0.4)');
    ctx.fillStyle = sphereGrad;
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // Restore Sun rotation
    ctx.restore(); // Restore center translation
    ctx.restore(); // Restore circular clip

    // 5. Crisp outer atmospheric boundary ring
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = isFullscreen ? 'rgba(255, 255, 255, 0.25)' : 'rgba(51, 65, 85, 0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore(); // Restore DPR scale
  }, [metrics, displaySize, isFullscreen, textureLoaded]);

  return (
    <div
      ref={containerRef}
      className={`rounded-xl transition-all duration-300 relative group overflow-hidden ${
        isFullscreen
          ? 'moon-fullscreen-container !fixed !inset-0 !z-[99999] w-screen h-screen bg-slate-950 text-slate-100 flex flex-col justify-between items-center'
          : 'p-3.5 sm:p-4 bg-[#e0f2fe] border border-sky-300 shadow-sm hover:border-sky-400 flex flex-col justify-between h-full'
      }`}
    >
      {/* Top Header */}
      {isFullscreen ? (
        /* Floating Absolute Header: Keeps center screen uncompromised */
        <div className="absolute top-2 left-3 right-3 flex items-center justify-between z-30 pointer-events-none">
          <span className="flex items-center gap-1.5 font-bold text-indigo-400 text-xs sm:text-sm bg-slate-950/70 backdrop-blur-sm px-2.5 py-1 rounded-full border border-slate-800/80 shadow-md pointer-events-auto">
            <Moon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Moon Phase</span>
          </span>

          {/* Dedicated Individual Fullscreen Button: Consists ONLY of the two diagonal arrows */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title="Exit Fullscreen"
            aria-label="Exit Fullscreen"
            className="p-1.5 rounded-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 shadow-lg pointer-events-auto"
          >
            <Minimize2 className="w-4 h-4 text-slate-200 shrink-0" />
          </button>
        </div>
      ) : (
        /* Normal Card Header */
        <div className="w-full flex items-center justify-between text-xs mb-2 font-medium">
          <span className="flex items-center gap-1.5 font-bold text-indigo-900">
            <Moon className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Moon Phase</span>
          </span>

          <button
            type="button"
            onClick={toggleFullscreen}
            title="Expand Moon Fullscreen"
            aria-label="Expand Moon Fullscreen"
            className="p-1.5 rounded-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center text-slate-700 hover:text-slate-950 hover:bg-sky-200/70 border border-transparent hover:border-sky-300"
          >
            <Maximize2 className="w-4 h-4 text-slate-700 shrink-0" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {isFullscreen ? (
        <>
          {/* Center Screen: Maximized Moon Sphere bounds absorbing 85vh - 90vh */}
          <div className="moon-fullscreen-center flex-1 w-full flex flex-col items-center justify-center relative my-auto">
            <div className="relative flex items-center justify-center">
              <canvas
                ref={canvasRef}
                style={{ width: displaySize, height: displaySize }}
                className="rounded-full shadow-2xl block"
              />
              {/* Subtle Zenith indicator reference tag */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1 bg-slate-900/90 px-2 py-0.5 rounded-full border border-slate-800/80 shadow-md">
                <span className="text-amber-400 text-[8px]">▲</span> Zenith
              </div>
            </div>

            {/* Position Angle Bright Limb Tilt sitting closely right underneath Moon bottom edge */}
            <div className="mt-1.5 flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono text-slate-400">
              <Compass className="w-3 h-3 text-amber-400" />
              <span>
                Bright Limb Tilt: <span className="text-amber-300 font-normal">{metrics.tiltAngleDeg.toFixed(1)}°</span> relative to local Zenith
              </span>
            </div>
          </div>

          {/* Pinned Bottom Data Row: Ultra-clean 9px lightweight horizontal data text row */}
          <div className="moon-fullscreen-bottom-row w-full shrink-0 z-30">
            <div className="flex flex-wrap items-center justify-center gap-x-3.5 sm:gap-x-6 gap-y-1 text-[9px] font-mono font-normal tracking-wide text-slate-400">
              <div className="flex items-center gap-1">
                <span className="text-slate-500">Phase:</span>
                <span className="text-amber-200">{metrics.phaseName}</span>
              </div>
              <span className="text-slate-700 hidden sm:inline">·</span>
              <div className="flex items-center gap-1">
                <span className="text-slate-500">Age:</span>
                <span className="text-slate-200">{metrics.lunarAgeText}</span>
              </div>
              <span className="text-slate-700 hidden sm:inline">·</span>
              <div className="flex items-center gap-1">
                <span className="text-slate-500">Illum:</span>
                <span className="text-emerald-400">{illuminationPercentText}</span>
              </div>
              <span className="text-slate-700 hidden sm:inline">·</span>
              <div className="flex items-center gap-1">
                <span className="text-slate-500">Cycle:</span>
                <span className="text-indigo-300">{metrics.isWaxing ? 'Waxing' : 'Waning'}</span>
              </div>
              <span className="text-slate-700 hidden sm:inline">·</span>
              <div className="flex items-center gap-1">
                <span className="text-slate-500">Altitude:</span>
                <span className="text-slate-300">
                  {metrics.moonAltitude >= 0 ? `+${metrics.moonAltitude.toFixed(1)}°` : `${metrics.moonAltitude.toFixed(1)}°`}
                </span>
              </div>
              <span className="text-slate-700 hidden sm:inline">·</span>
              <div className="flex items-center gap-1">
                <span className="text-slate-500">Azimuth:</span>
                <span className="text-slate-300">{metrics.moonAzimuth.toFixed(0)}°</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Normal Card Layout inside Upper Dashboard */
        <div className="flex flex-col items-center justify-between flex-1 w-full space-y-2">
          {/* Centered Lunar Sphere with real-time photographic shading and tilt */}
          <div className="relative my-0.5 flex items-center justify-center">
            <canvas
              ref={canvasRef}
              style={{ width: 96, height: 96 }}
              className="rounded-full shadow-md block bg-black/40"
            />
          </div>

          {/* Synodic Lunar Metrics Text Readout */}
          <div className="w-full text-center space-y-1">
            <div className="text-xs sm:text-[13px] font-bold font-mono text-slate-950 tracking-tight">
              {metrics.phaseName}
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-700 px-0.5 font-medium">
              <span>Age:</span>
              <span className="font-bold text-slate-950">{metrics.lunarAgeText}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-700 px-0.5 font-medium">
              <span>Illum:</span>
              <span className="font-bold text-indigo-900">{illuminationPercentText}</span>
            </div>
          </div>
        </div>
      )}

      {/* Decorative ambient background accent glow */}
      {!isFullscreen && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/15 rounded-full blur-xl pointer-events-none" />
      )}
    </div>
  );
};
