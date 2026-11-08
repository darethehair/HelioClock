/**
 * Milky Way Celestial Band & Galactic Coordinates Geometry Engine
 * Transforms Galactic Coordinates (l, b) to Equatorial (RA, Dec) and Horizontal (Azimuth, Altitude)
 * Produces smooth layered diffuse paths, luminous star clouds, and the Great Rift dark lane.
 */

import { getLocalSiderealTime, equatorialToHorizontal } from './celestialEphemeris';

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

// IAU Standard J2000 Galactic Coordinate Constants
const ALPHA_NGP = 192.85948 * DEG2RAD; // RA of North Galactic Pole (Coma Berenices)
const DELTA_NGP = 27.12825 * DEG2RAD;  // Dec of North Galactic Pole
const L_NCP = 122.93192 * DEG2RAD;     // Galactic longitude of North Celestial Pole

/**
 * Transforms Galactic Coordinates (l, b in degrees) to Equatorial (RA, Dec in degrees)
 */
export function galacticToEquatorial(lDeg: number, bDeg: number): { ra: number; dec: number } {
  const l = lDeg * DEG2RAD;
  const b = bDeg * DEG2RAD;

  const sinB = Math.sin(b);
  const cosB = Math.cos(b);
  const sinDeltaG = Math.sin(DELTA_NGP);
  const cosDeltaG = Math.cos(DELTA_NGP);

  const sinDec = sinDeltaG * sinB + cosDeltaG * cosB * Math.cos(L_NCP - l);
  const decRad = Math.asin(Math.max(-1, Math.min(1, sinDec)));

  const y = cosB * Math.sin(L_NCP - l);
  const x = cosDeltaG * sinB - sinDeltaG * cosB * Math.cos(L_NCP - l);
  let raRad = ALPHA_NGP + Math.atan2(y, x);
  let raDeg = (raRad * RAD2DEG) % 360;
  if (raDeg < 0) raDeg += 360;

  return { ra: raDeg, dec: decRad * RAD2DEG };
}

/**
 * Returns half-width in degrees latitude for the outer diffuse Milky Way at Galactic Longitude l
 */
export function getMilkyWayHalfWidth(lDeg: number): number {
  const base = 8.5;
  // Galactic Center bulge (Sagittarius/Scorpius, l ~ 0)
  const lDistFromCenter = Math.abs(((lDeg + 180) % 360) - 180);
  const gcBulge = 7.5 * Math.exp(-Math.pow(lDistFromCenter / 36, 2));
  // Cygnus star cloud bulge (l ~ 78)
  const cygnusBulge = 4.5 * Math.exp(-Math.pow((lDeg - 78) / 24, 2));
  // Carina / Crux bulge (l ~ 292)
  const cruxBulge = 5.0 * Math.exp(-Math.pow((lDeg - 292) / 28, 2));
  return base + gcBulge + cygnusBulge + cruxBulge;
}

/**
 * Relative luminosity multiplier [0.45, 1.0] across Galactic Longitude
 */
export function getMilkyWayLuminosity(lDeg: number): number {
  const lDistFromCenter = Math.abs(((lDeg + 180) % 360) - 180);
  const gc = 0.50 * Math.exp(-Math.pow(lDistFromCenter / 40, 2));
  const cyg = 0.30 * Math.exp(-Math.pow((lDeg - 80) / 25, 2));
  const crux = 0.35 * Math.exp(-Math.pow((lDeg - 290) / 30, 2));
  return Math.min(1.0, 0.45 + gc + cyg + crux);
}

export interface MilkyWayQuad {
  svgPath: string;
  fill: string;
  opacity: number;
}

export interface MilkyWayCloudHighlight {
  id: string;
  name: string;
  azimuth: number;
  altitude: number;
  radiusX: number;
  radiusY: number;
  rotationDeg: number;
  color: string;
}

export interface MilkyWayRenderData {
  outerBandQuads: MilkyWayQuad[];
  innerCoreQuads: MilkyWayQuad[];
  darkRiftQuads: MilkyWayQuad[];
  cloudHighlights: MilkyWayCloudHighlight[];
}

/**
 * Generates render data for the Milky Way band, core, dark rift, and cloud highlights
 */
export function calculateMilkyWayRenderData(
  date: Date,
  latitude: number,
  longitude: number,
  projectCoord: (az: number, alt: number, relAzOverride?: number) => { x: number; y: number },
  isPolar: boolean,
  centerAzimuth = 180,
  plotWidth = 1000
): MilkyWayRenderData {
  const lst = getLocalSiderealTime(date, longitude);
  const step = 4; // 90 segments around 360° Galactic circle

  const outerBandQuads: MilkyWayQuad[] = [];
  const innerCoreQuads: MilkyWayQuad[] = [];
  const darkRiftQuads: MilkyWayQuad[] = [];
  const cloudHighlights: MilkyWayCloudHighlight[] = [];

  const leftEdgeAz = centerAzimuth - 180;

  // Helper to convert Galactic (l, b) directly to Horizontal (az, alt, relAz)
  const galToHoriz = (l: number, b: number) => {
    const eq = galacticToEquatorial(l, b);
    const horiz = equatorialToHorizontal(eq.ra, eq.dec, latitude, lst);
    const relAz = ((horiz.azimuth - leftEdgeAz) % 360 + 360) % 360;
    return { az: horiz.azimuth, alt: horiz.altitude, relAz };
  };

  // Helper to build SVG quadrilateral path from 4 corner points
  const buildQuadPath = (
    p0: { az: number; alt: number; relAz: number },
    p1: { az: number; alt: number; relAz: number },
    p2: { az: number; alt: number; relAz: number },
    p3: { az: number; alt: number; relAz: number }
  ): string[] => {
    if (isPolar) {
      const pt0 = projectCoord(p0.az, p0.alt);
      const pt1 = projectCoord(p1.az, p1.alt);
      const pt2 = projectCoord(p2.az, p2.alt);
      const pt3 = projectCoord(p3.az, p3.alt);
      return [`M ${pt0.x.toFixed(1)} ${pt0.y.toFixed(1)} L ${pt1.x.toFixed(1)} ${pt1.y.toFixed(1)} L ${pt2.x.toFixed(1)} ${pt2.y.toFixed(1)} L ${pt3.x.toFixed(1)} ${pt3.y.toFixed(1)} Z`];
    }

    // Equirectangular Seam Handling:
    // If the quad crosses the azimuth seam (span > 180°), split/shift points so no streaks appear
    const rels = [p0.relAz, p1.relAz, p2.relAz, p3.relAz];
    const maxRel = Math.max(...rels);
    const minRel = Math.min(...rels);

    if (maxRel - minRel <= 180) {
      // Normal quad within screen bounds
      const pt0 = projectCoord(p0.az, p0.alt, p0.relAz);
      const pt1 = projectCoord(p1.az, p1.alt, p1.relAz);
      const pt2 = projectCoord(p2.az, p2.alt, p2.relAz);
      const pt3 = projectCoord(p3.az, p3.alt, p3.relAz);
      return [`M ${pt0.x.toFixed(1)} ${pt0.y.toFixed(1)} L ${pt1.x.toFixed(1)} ${pt1.y.toFixed(1)} L ${pt2.x.toFixed(1)} ${pt2.y.toFixed(1)} L ${pt3.x.toFixed(1)} ${pt3.y.toFixed(1)} Z`];
    }

    // Crossed seam: Generate two clean halves (left-wrapped and right-wrapped)
    const shiftRight = (rel: number) => (rel < 180 ? rel + 360 : rel);
    const shiftLeft = (rel: number) => (rel > 180 ? rel - 360 : rel);

    const r0 = shiftRight(p0.relAz);
    const r1 = shiftRight(p1.relAz);
    const r2 = shiftRight(p2.relAz);
    const r3 = shiftRight(p3.relAz);

    const pt0R = projectCoord(p0.az, p0.alt, r0);
    const pt1R = projectCoord(p1.az, p1.alt, r1);
    const pt2R = projectCoord(p2.az, p2.alt, r2);
    const pt3R = projectCoord(p3.az, p3.alt, r3);
    const pathR = `M ${pt0R.x.toFixed(1)} ${pt0R.y.toFixed(1)} L ${pt1R.x.toFixed(1)} ${pt1R.y.toFixed(1)} L ${pt2R.x.toFixed(1)} ${pt2R.y.toFixed(1)} L ${pt3R.x.toFixed(1)} ${pt3R.y.toFixed(1)} Z`;

    const l0 = shiftLeft(p0.relAz);
    const l1 = shiftLeft(p1.relAz);
    const l2 = shiftLeft(p2.relAz);
    const l3 = shiftLeft(p3.relAz);

    const pt0L = projectCoord(p0.az, p0.alt, l0);
    const pt1L = projectCoord(p1.az, p1.alt, l1);
    const pt2L = projectCoord(p2.az, p2.alt, l2);
    const pt3L = projectCoord(p3.az, p3.alt, l3);
    const pathL = `M ${pt0L.x.toFixed(1)} ${pt0L.y.toFixed(1)} L ${pt1L.x.toFixed(1)} ${pt1L.y.toFixed(1)} L ${pt2L.x.toFixed(1)} ${pt2L.y.toFixed(1)} L ${pt3L.x.toFixed(1)} ${pt3L.y.toFixed(1)} Z`;

    return [pathR, pathL];
  };

  // 1. Generate Outer Diffuse Band & Inner Core Quads along Galactic Circle
  for (let l = 0; l < 360; l += step) {
    const lA = l;
    const lB = l + step;

    const wA = getMilkyWayHalfWidth(lA);
    const wB = getMilkyWayHalfWidth(lB);
    const lum = getMilkyWayLuminosity((lA + lB) / 2);

    // --- Outer Diffuse Layer ---
    const out0 = galToHoriz(lA, wA);
    const out1 = galToHoriz(lB, wB);
    const out2 = galToHoriz(lB, -wB);
    const out3 = galToHoriz(lA, -wA);

    const outerPaths = buildQuadPath(out0, out1, out2, out3);
    for (const p of outerPaths) {
      outerBandQuads.push({
        svgPath: p,
        fill: 'rgba(139, 92, 246, 0.08)', // subtle cosmic violet glow
        opacity: Math.min(1.0, 0.65 + lum * 0.35),
      });
    }

    // --- Inner Luminous Core Layer ---
    const coreWA = wA * 0.48;
    const coreWB = wB * 0.48;
    const core0 = galToHoriz(lA, coreWA);
    const core1 = galToHoriz(lB, coreWB);
    const core2 = galToHoriz(lB, -coreWB);
    const core3 = galToHoriz(lA, -coreWA);

    const corePaths = buildQuadPath(core0, core1, core2, core3);
    for (const p of corePaths) {
      innerCoreQuads.push({
        svgPath: p,
        fill: 'rgba(235, 238, 255, 0.11)', // luminous silvery star cloud
        opacity: Math.min(1.0, 0.5 + lum * 0.5),
      });
    }

    // --- Great Rift Dark Nebula Layer (Cygnus down through Aquila to Sagittarius) ---
    // The Great Rift splits the Milky Way from l ~ 25° to l ~ 88° and l ~ 340° to 15°
    const isRiftZone = (lA >= 24 && lA <= 88) || (lA >= 340 || lA <= 15);
    if (isRiftZone) {
      const riftTop = 2.2;
      const riftBot = -1.8;
      const r0 = galToHoriz(lA, riftTop);
      const r1 = galToHoriz(lB, riftTop);
      const r2 = galToHoriz(lB, riftBot);
      const r3 = galToHoriz(lA, riftBot);

      const riftPaths = buildQuadPath(r0, r1, r2, r3);
      for (const p of riftPaths) {
        darkRiftQuads.push({
          svgPath: p,
          fill: 'rgba(2, 6, 23, 0.42)', // deep dark absorption lane
          opacity: 0.9,
        });
      }
    }
  }

  // 2. Specific Major Star Cloud Highlights (Galactic Center, Cygnus, Carina)
  const clouds = [
    { id: 'galactic-center', name: 'Galactic Center (Sgr A*)', l: 0, b: 0, rx: 18, ry: 9, color: 'rgba(255, 237, 213, 0.16)' },
    { id: 'cygnus-cloud', name: 'Cygnus Star Cloud', l: 76, b: 1, rx: 12, ry: 6, color: 'rgba(224, 231, 255, 0.14)' },
    { id: 'scutum-cloud', name: 'Scutum Star Cloud', l: 27, b: -1, rx: 9, ry: 5, color: 'rgba(254, 243, 199, 0.14)' },
    { id: 'carina-cloud', name: 'Carina / Crux Nebula', l: 290, b: -1, rx: 14, ry: 7, color: 'rgba(186, 230, 253, 0.14)' },
  ];

  for (const c of clouds) {
    const horiz = galToHoriz(c.l, c.b);
    // Estimate inclination in screen space by taking a delta along Galactic Equator
    const horizNext = galToHoriz(c.l + 2, c.b);
    const pt1 = projectCoord(horiz.az, horiz.alt, horiz.relAz);
    const pt2 = projectCoord(horizNext.az, horizNext.alt, horizNext.relAz);
    const dx = pt2.x - pt1.x;
    const dy = pt2.y - pt1.y;
    const angleDeg = Math.atan2(dy, dx) * RAD2DEG;

    cloudHighlights.push({
      id: c.id,
      name: c.name,
      azimuth: horiz.az,
      altitude: horiz.alt,
      radiusX: c.rx,
      radiusY: c.ry,
      rotationDeg: angleDeg,
      color: c.color,
    });
  }

  return {
    outerBandQuads,
    innerCoreQuads,
    darkRiftQuads,
    cloudHighlights,
  };
}
