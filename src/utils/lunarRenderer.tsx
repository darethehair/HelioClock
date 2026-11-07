/**
 * Accurate Lunar Phase & Horizon-Oriented Terminator Renderer
 * 
 * Implements mathematically rigorous lunar crescent and gibbous geometry
 * based on celestial ephemeris, observer topocentric coordinates, and Meeus Ch. 48.
 *
 * Parameters:
 * - phase: Astronomical phase angle in radians (0 = New Moon, pi/2 = First Quarter, pi = Full Moon)
 * - isWaxing: Boolean flag indicating if the phase is waxing (true) or waning (false)
 * - tiltAngle: Parallactic / horizon tilt angle (radians) representing the rotation of the lit crescent
 *              relative to the local horizon and Sun direction.
 */

import React from 'react';
import { DetailedMoonMetrics } from './celestialEphemeris';

export interface AccurateLunarParameters {
  /** Astronomical phase angle in radians: 0 = New Moon, pi/2 = First Quarter, pi = Full Moon */
  phase: number;
  /** Boolean flag indicating if the phase is waxing (true) or waning (false) */
  isWaxing: boolean;
  /** Parallactic / horizon tilt angle in radians relative to local horizon and Sun direction */
  tiltAngle: number;
  /** Illumination fraction [0, 1] */
  illuminationFraction: number;
  /** Descriptive phase name (e.g. 'Waxing Crescent', 'Full Moon') */
  phaseName: string;
}

/**
 * Derives accurate lunar render parameters from DetailedMoonMetrics,
 * matching the exact calculation used in the banner/dashboard card.
 */
export function computeLunarParameters(
  metrics: DetailedMoonMetrics,
  projectionMode?: 'equirectangular' | 'polar' | 'orrery',
  moonPos?: { x: number; y: number },
  polarCenter?: { x: number; y: number }
): AccurateLunarParameters {
  const D = ((metrics.elongationDeg % 360) + 360) % 360;
  const isWaxing = metrics.isWaxing ?? (D < 180);

  // Phase angle in radians: 0 = New Moon, pi/2 = First Quarter, pi = Full Moon
  const phaseDeg = isWaxing ? D : (360 - D);
  const phase = (phaseDeg * Math.PI) / 180;

  // Horizon tilt angle (radians)
  let tiltAngle: number;
  if (projectionMode === 'polar' && moonPos && polarCenter) {
    // In polar projection, Zenith is at polarCenter.
    // Screen vector from Moon to Zenith:
    const zenithAngle = Math.atan2(polarCenter.y - moonPos.y, polarCenter.x - moonPos.x);
    // sunAngleFromZenithDeg is measured clockwise from Zenith in observer's sky plane
    tiltAngle = zenithAngle + (metrics.sunAngleFromZenithDeg * Math.PI) / 180;
  } else {
    // Equirectangular / standard view: Zenith is straight UP (-Y in screen coordinates, i.e. -90°)
    // Canvas/SVG rotation that points +X toward the Sun:
    tiltAngle = ((metrics.sunAngleFromZenithDeg - 90) * Math.PI) / 180;
  }

  return {
    phase,
    isWaxing,
    tiltAngle,
    illuminationFraction: metrics.illuminationFraction,
    phaseName: metrics.phaseName,
  };
}

/**
 * Constructs the SVG path data `d` for the illuminated lunar surface.
 * 
 * 1. Outer illuminated limb: standard arc of radius R spanning from -pi/2 to pi/2 (through (+R, 0))
 * 2. Inner terminator curve: ellipse centered at (0, 0) with vertical radius R and
 *    horizontal radius |R * cos(phase)|.
 *    Direction flips based on whether cos(phase) is positive (crescent, bows +X) or negative (gibbous, bows -X).
 */
export function buildLunarLitPath(R: number, phase: number, isWaxing: boolean): string {
  const clampedPhase = Math.max(0, Math.min(Math.PI, phase));
  const cosP = Math.cos(clampedPhase);
  const rx = Math.abs(R * cosP);

  // New Moon: completely unlit
  if (clampedPhase < 0.02) {
    return '';
  }

  // Full Moon: full illuminated disc
  if (clampedPhase > Math.PI - 0.02) {
    return `M 0 ${-R} A ${R} ${R} 0 1 1 0 ${R} A ${R} ${R} 0 1 1 0 ${-R} Z`;
  }

  // Outer illuminated limb: standard arc of radius R spanning from -pi/2 to pi/2
  // Starts at (0, -R), goes clockwise (sweep 1) to (0, +R)
  const outerArc = `M 0 ${-R.toFixed(2)} A ${R.toFixed(2)} ${R.toFixed(2)} 0 0 1 0 ${R.toFixed(2)}`;

  // Inner terminator curve returning from (0, +R) to (0, -R)
  let innerTerminator: string;
  if (rx < 0.01) {
    // Exactly quarter moon: straight line through center
    innerTerminator = `L 0 ${-R.toFixed(2)}`;
  } else if (cosP > 0) {
    // Crescent: inner terminator bows toward +X (same side as outer limb), counterclockwise (sweep 0)
    innerTerminator = `A ${rx.toFixed(2)} ${R.toFixed(2)} 0 0 0 0 ${-R.toFixed(2)}`;
  } else {
    // Gibbous: inner terminator bows toward -X (opposite side from outer limb), clockwise (sweep 1)
    innerTerminator = `A ${rx.toFixed(2)} ${R.toFixed(2)} 0 0 1 0 ${-R.toFixed(2)}`;
  }

  return `${outerArc} ${innerTerminator} Z`;
}

/**
 * Draws the mathematically accurate lunar phase and terminator onto an HTML5 Canvas 2D context.
 */
export function drawAccurateMoonCanvas(
  ctx: CanvasRenderingContext2D,
  params: {
    cx: number;
    cy: number;
    radius: number;
    phase: number;
    isWaxing: boolean;
    tiltAngle: number;
    darkFill?: string;
    litFill?: string;
  }
): void {
  const {
    cx,
    cy,
    radius: R,
    phase,
    isWaxing,
    tiltAngle,
    darkFill = '#111827',
    litFill = '#FFF5EA',
  } = params;

  ctx.save();
  ctx.translate(cx, cy);

  // 1. Base Disc: unlit lunar disk with dark fill
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.fillStyle = darkFill;
  ctx.fill();

  // Subtle limb stroke for dark disk boundary
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
  ctx.lineWidth = Math.max(0.6, R * 0.05);
  ctx.stroke();

  // 2. Axis Rotation: rotate by tiltAngle so horns (cusps) tilt accurately toward horizon/Sun vector
  ctx.rotate(tiltAngle);

  const clampedPhase = Math.max(0, Math.min(Math.PI, phase));
  const cosP = Math.cos(clampedPhase);
  const rx = Math.abs(R * cosP);

  // New Moon: no lit surface to draw
  if (clampedPhase < 0.02) {
    ctx.restore();
    return;
  }

  // Full Moon: full bright circle
  if (clampedPhase > Math.PI - 0.02) {
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.fillStyle = litFill;
    ctx.fill();
    ctx.restore();
    return;
  }

  // 3. Limb & Terminator Geometry
  ctx.beginPath();
  // Outer illuminated limb: standard arc of radius R from -pi/2 to pi/2 (clockwise)
  ctx.arc(0, 0, R, -Math.PI / 2, Math.PI / 2, false);

  // Inner terminator curve: ellipse with vertical radius R and horizontal radius |R * cos(phase)|
  // From (0, R) back to (0, -R)
  // When crescent (cosP > 0), anticlockwise = true (bows toward +X)
  // When gibbous (cosP < 0), anticlockwise = false (bows toward -X)
  const isCrescent = cosP > 0;
  if (rx < 0.01) {
    ctx.lineTo(0, -R);
  } else {
    ctx.ellipse(0, 0, rx, R, 0, Math.PI / 2, -Math.PI / 2, isCrescent);
  }
  ctx.closePath();

  // 4. Lit surface fill
  ctx.fillStyle = litFill;
  ctx.fill();

  ctx.restore();
}

export interface AccurateMoonSvgProps {
  cx?: number;
  cy?: number;
  radius: number;
  phase: number;
  isWaxing: boolean;
  tiltAngle: number;
  darkFill?: string;
  litFill?: string;
  glow?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * React SVG Vector Component rendering mathematically accurate lunar phase & terminator.
 */
export const AccurateMoonSvg: React.FC<AccurateMoonSvgProps> = ({
  cx = 0,
  cy = 0,
  radius: R,
  phase,
  isWaxing,
  tiltAngle,
  darkFill = '#111827',
  litFill = '#FFF5EA',
  glow = true,
  onClick,
  className,
}) => {
  const rotDeg = (tiltAngle * 180) / Math.PI;
  const clampedPhase = Math.max(0, Math.min(Math.PI, phase));
  const litPathD = buildLunarLitPath(R, clampedPhase, isWaxing);
  const isFull = clampedPhase > Math.PI - 0.02;
  const isNew = clampedPhase < 0.02;
  const illumFraction = (1 - Math.cos(clampedPhase)) / 2;

  return (
    <g
      transform={`translate(${cx}, ${cy})`}
      onClick={onClick}
      className={className}
    >
      {/* Dynamic Lunar Aura Glow scaled by illumination */}
      {glow && illumFraction > 0.05 && (
        <circle
          cx="0"
          cy="0"
          r={R * 1.75}
          fill="#f8fafc"
          fillOpacity={0.12 * Math.max(0.2, illumFraction)}
          className="pointer-events-none animate-pulse"
        />
      )}

      {/* 1. Base Disc: unlit lunar disk with dark fill */}
      <circle
        cx="0"
        cy="0"
        r={R}
        fill={darkFill}
        stroke="#475569"
        strokeWidth={Math.max(0.6, R * 0.06)}
        strokeOpacity={0.4}
      />

      {/* Subtle inner dark disc crater/texture ambient shading */}
      <circle
        cx="0"
        cy="0"
        r={R * 0.95}
        fill="#0b0f19"
        fillOpacity={0.5}
      />

      {/* 2. Axis Rotation & Lit Surface Geometry */}
      {!isNew && (
        <g transform={`rotate(${rotDeg.toFixed(2)})`}>
          {isFull ? (
            <circle cx="0" cy="0" r={R} fill={litFill} />
          ) : (
            <path
              d={litPathD}
              fill={litFill}
              stroke={litFill}
              strokeWidth={0.3}
              strokeLinejoin="round"
            />
          )}

          {/* Realistic terminator soft gradient shadow line */}
          {!isFull && (
            <path
              d={litPathD}
              fill="none"
              stroke="#cbd5e1"
              strokeWidth={Math.max(0.4, R * 0.04)}
              strokeOpacity={0.3}
            />
          )}
        </g>
      )}

      {/* Crisp outer limb rim highlight */}
      <circle
        cx="0"
        cy="0"
        r={R}
        fill="none"
        stroke="#94a3b8"
        strokeWidth={Math.max(0.5, R * 0.05)}
        strokeOpacity={0.3}
        className="pointer-events-none"
      />
    </g>
  );
};
