/**
 * Milky Way Celestial Band & Galactic Coordinates Geometry Engine
 * Transforms Galactic Coordinates (l, b) to Equatorial (RA, Dec) and Horizontal (Azimuth, Altitude)
 * Produces cartographic vector boundary outlines, galactic equator, Great Rift dust lane borders,
 * and conditional multi-layered diffuse shading fills.
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
 * Returns Northern (positive latitude) cartographic boundary of the Milky Way in degrees
 * Captures real astronomical lobes: Ophiuchus/Sagittarius high-latitude lobe (up to +28°),
 * Cygnus star clouds (+18°), Carina/Centaurus (+18°), and narrow anticenter (+9°).
 */
export function getMilkyWayNorthBoundary(lDeg: number): number {
  const normL = ((lDeg % 360) + 360) % 360;
  let b = 10.0;
  // Ophiuchus / Scorpius / Sagittarius Galactic Center high-latitude lobe (l ~ 335 to 25): expands up to 26°-28°
  const gcDist = Math.abs(((normL + 180) % 360) - 180);
  b += 16.5 * Math.exp(-Math.pow(gcDist / 32, 2));

  // Cygnus star cloud & Cepheus lobe (l ~ 76): expands to ~18°
  b += 7.5 * Math.exp(-Math.pow((normL - 76) / 22, 2));

  // Carina / Centaurus lobe (l ~ 295): expands to ~18°
  b += 7.5 * Math.exp(-Math.pow((normL - 295) / 26, 2));

  // Scutum / Aquila (l ~ 35): ~14.5°
  b += 4.0 * Math.exp(-Math.pow((normL - 35) / 16, 2));

  return Math.min(30, Math.max(7.5, b));
}

/**
 * Returns Southern (negative latitude) cartographic boundary of the Milky Way in degrees
 * Captures real astronomical lobes: Sagittarius/Corona Australis (down to -25°),
 * Carina/Crux/Coalsack (-20°), Centaurus/Lupus (-18°), and narrow anticenter (-8°).
 */
export function getMilkyWaySouthBoundary(lDeg: number): number {
  const normL = ((lDeg % 360) + 360) % 360;
  let b = -10.0;
  // Sagittarius / Corona Australis lobe (l ~ 355 to 15): expands to -22° to -25°
  const gcDist = Math.abs(((normL + 180) % 360) - 180);
  b -= 14.5 * Math.exp(-Math.pow(gcDist / 34, 2));

  // Carina / Crux / Coalsack / Centaurus (l ~ 292): expands to -18° to -21°
  b -= 9.0 * Math.exp(-Math.pow((normL - 292) / 25, 2));

  // Vela / Puppis (l ~ 255): expands to -15°
  b -= 4.5 * Math.exp(-Math.pow((normL - 255) / 20, 2));

  return Math.max(-30, Math.min(-7.5, b));
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

export interface MilkyWayOutlinePath {
  id: string;
  svgPath: string;
  type: 'outer-north' | 'outer-south' | 'galactic-equator' | 'rift-north' | 'rift-south' | 'coalsack';
  stroke: string;
  strokeWidth: number;
  strokeDasharray?: string;
  opacity: number;
}

export interface MilkyWayRenderData {
  boundaryClipPaths: string[];
  boundedShadingQuads: MilkyWayQuad[];
  outerBandQuads: MilkyWayQuad[]; // Backward-compatible alias
  innerCoreQuads: MilkyWayQuad[];
  darkRiftQuads: MilkyWayQuad[];
  outlinePaths: MilkyWayOutlinePath[];
}

/**
 * Builds seam-safe polyline SVG paths that handle 0°/360° azimuth screen crossings without streaks
 */
function buildSeamSafePolyline(
  points: { az: number; alt: number; relAz: number }[],
  projectCoord: (az: number, alt: number, relAzOverride?: number) => { x: number; y: number },
  isPolar: boolean
): string[] {
  if (points.length < 2) return [];

  if (isPolar) {
    const start = projectCoord(points[0].az, points[0].alt);
    let d = `M ${start.x.toFixed(1)} ${start.y.toFixed(1)}`;
    for (let i = 1; i < points.length; i++) {
      const pt = projectCoord(points[i].az, points[i].alt);
      d += ` L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
    }
    return [d];
  }

  // Equirectangular mode: Split at seam crossings (|relAz_1 - relAz_2| > 180)
  const paths: string[] = [];
  let currentSegment: { x: number; y: number }[] = [];

  for (let i = 0; i < points.length; i++) {
    const curr = points[i];
    if (i === 0) {
      currentSegment.push(projectCoord(curr.az, curr.alt, curr.relAz));
      continue;
    }

    const prev = points[i - 1];
    const diff = curr.relAz - prev.relAz;

    if (Math.abs(diff) > 180) {
      // Crossing occurred!
      const goesToRight = diff < -180;
      const t = goesToRight
        ? (360 - prev.relAz) / ((360 - prev.relAz) + curr.relAz)
        : prev.relAz / (prev.relAz + (360 - curr.relAz));

      const clampedT = Math.max(0, Math.min(1, t));
      const crossAlt = prev.alt + clampedT * (curr.alt - prev.alt);
      const crossAz = prev.az + clampedT * (curr.az - prev.az);

      const exitRelAz = goesToRight ? 360 : 0;
      const enterRelAz = goesToRight ? 0 : 360;

      const exitPt = projectCoord(crossAz, crossAlt, exitRelAz);
      const enterPt = projectCoord(crossAz, crossAlt, enterRelAz);

      currentSegment.push(exitPt);
      if (currentSegment.length >= 2) {
        paths.push('M ' + currentSegment.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L '));
      }

      currentSegment = [enterPt, projectCoord(curr.az, curr.alt, curr.relAz)];
    } else {
      currentSegment.push(projectCoord(curr.az, curr.alt, curr.relAz));
    }
  }

  if (currentSegment.length >= 2) {
    paths.push('M ' + currentSegment.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L '));
  }

  return paths;
}

/**
 * Generates render data for the Milky Way:
 * 1. Strict vector boundary clipping paths (b = ±10° to ±30° across galactic longitude l)
 * 2. Translucent white bounded interior shading (0.05 to 0.09 alpha depending on star clouds)
 * 3. Great Rift & Coalsack dark dust absorption lanes strictly inside the boundary
 * 4. Crisp cartographic vector boundary outlines (rgba(167, 139, 250, 0.40))
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
  // High-fidelity 2-degree step for seamless alignment with vector boundary strokes
  const step = 2.0; 

  const boundaryClipPaths: string[] = [];
  const boundedShadingQuads: MilkyWayQuad[] = [];
  const darkRiftQuads: MilkyWayQuad[] = [];
  const outlinePaths: MilkyWayOutlinePath[] = [];

  const leftEdgeAz = centerAzimuth - 180;

  // Helper to convert Galactic (l, b) directly to Horizontal (az, alt, relAz)
  const galToHoriz = (l: number, b: number) => {
    const eq = galacticToEquatorial(l, b);
    const horiz = equatorialToHorizontal(eq.ra, eq.dec, latitude, lst);
    const relAz = ((horiz.azimuth - leftEdgeAz) % 360 + 360) % 360;
    return { az: horiz.azimuth, alt: horiz.altitude, relAz };
  };

  // Helper to build SVG quadrilateral path from 4 corner points (handles seam wrapping cleanly)
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
      return [
        `M ${pt0.x.toFixed(1)} ${pt0.y.toFixed(1)} L ${pt1.x.toFixed(1)} ${pt1.y.toFixed(1)} L ${pt2.x.toFixed(1)} ${pt2.y.toFixed(1)} L ${pt3.x.toFixed(1)} ${pt3.y.toFixed(1)} Z`,
      ];
    }

    // Equirectangular Seam Handling
    const rels = [p0.relAz, p1.relAz, p2.relAz, p3.relAz];
    const maxRel = Math.max(...rels);
    const minRel = Math.min(...rels);

    if (maxRel - minRel <= 180) {
      const pt0 = projectCoord(p0.az, p0.alt, p0.relAz);
      const pt1 = projectCoord(p1.az, p1.alt, p1.relAz);
      const pt2 = projectCoord(p2.az, p2.alt, p2.relAz);
      const pt3 = projectCoord(p3.az, p3.alt, p3.relAz);
      return [
        `M ${pt0.x.toFixed(1)} ${pt0.y.toFixed(1)} L ${pt1.x.toFixed(1)} ${pt1.y.toFixed(1)} L ${pt2.x.toFixed(1)} ${pt2.y.toFixed(1)} L ${pt3.x.toFixed(1)} ${pt3.y.toFixed(1)} Z`,
      ];
    }

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

  // 1. Generate Bounded Shading Quads & Boundary Clip Paths strictly between North and South boundaries
  for (let l = 0; l < 360; l += step) {
    const lA = l;
    const lB = l + step;

    const northA = getMilkyWayNorthBoundary(lA);
    const northB = getMilkyWayNorthBoundary(lB);
    const southA = getMilkyWaySouthBoundary(lA);
    const southB = getMilkyWaySouthBoundary(lB);
    const lum = getMilkyWayLuminosity((lA + lB) / 2);

    const out0 = galToHoriz(lA, northA);
    const out1 = galToHoriz(lB, northB);
    const out2 = galToHoriz(lB, southB);
    const out3 = galToHoriz(lA, southA);

    const quadPaths = buildQuadPath(out0, out1, out2, out3);
    
    for (const p of quadPaths) {
      // Store in boundary clip paths
      boundaryClipPaths.push(p);

      // Translucent white bounded fill (soft subtle haze)
      boundedShadingQuads.push({
        svgPath: p,
        fill: 'rgba(255, 255, 255, 0.045)',
        opacity: 1.0,
      });
    }
  }

  // 3. CARTOGRAPHIC VECTOR BOUNDARY OUTLINES
  // High-resolution sampling (every 2 degrees) for crisp, smooth celestial curves

  // A. Outer Northern Galactic Boundary Line (+b)
  const northBoundaryPoints: { az: number; alt: number; relAz: number }[] = [];
  for (let l = 0; l <= 360; l += 2) {
    northBoundaryPoints.push(galToHoriz(l, getMilkyWayNorthBoundary(l)));
  }
  const northSvgPaths = buildSeamSafePolyline(northBoundaryPoints, projectCoord, isPolar);
  northSvgPaths.forEach((pathStr, idx) => {
    outlinePaths.push({
      id: `mw-outline-north-${idx}`,
      svgPath: pathStr,
      type: 'outer-north',
      stroke: 'rgba(167, 139, 250, 0.4)', // crisp, celestial border stroke
      strokeWidth: 1.1,
      opacity: 0.95,
    });
  });

  // B. Outer Southern Galactic Boundary Line (-b)
  const southBoundaryPoints: { az: number; alt: number; relAz: number }[] = [];
  for (let l = 0; l <= 360; l += 2) {
    southBoundaryPoints.push(galToHoriz(l, getMilkyWaySouthBoundary(l)));
  }
  const southSvgPaths = buildSeamSafePolyline(southBoundaryPoints, projectCoord, isPolar);
  southSvgPaths.forEach((pathStr, idx) => {
    outlinePaths.push({
      id: `mw-outline-south-${idx}`,
      svgPath: pathStr,
      type: 'outer-south',
      stroke: 'rgba(167, 139, 250, 0.4)',
      strokeWidth: 1.1,
      opacity: 0.95,
    });
  });

  // C. Galactic Equator Centerline (b = 0°)
  const equatorPoints: { az: number; alt: number; relAz: number }[] = [];
  for (let l = 0; l <= 360; l += 3) {
    equatorPoints.push(galToHoriz(l, 0));
  }
  const equatorSvgPaths = buildSeamSafePolyline(equatorPoints, projectCoord, isPolar);
  equatorSvgPaths.forEach((pathStr, idx) => {
    outlinePaths.push({
      id: `mw-equator-${idx}`,
      svgPath: pathStr,
      type: 'galactic-equator',
      stroke: 'rgba(167, 139, 250, 0.22)',
      strokeWidth: 0.8,
      strokeDasharray: '4 4',
      opacity: 0.8,
    });
  });

  // D. Great Rift Dust Lane Borders (Cygnus to Sagittarius)
  // Branch 1: Cygnus through Aquila to Scutum (l: 22° -> 88°)
  const riftNorthPts1: { az: number; alt: number; relAz: number }[] = [];
  const riftSouthPts1: { az: number; alt: number; relAz: number }[] = [];
  for (let l = 22; l <= 88; l += 2) {
    riftNorthPts1.push(galToHoriz(l, 3.2));
    riftSouthPts1.push(galToHoriz(l, -2.0));
  }
  buildSeamSafePolyline(riftNorthPts1, projectCoord, isPolar).forEach((pathStr, idx) => {
    outlinePaths.push({
      id: `mw-rift-n1-${idx}`,
      svgPath: pathStr,
      type: 'rift-north',
      stroke: 'rgba(196, 181, 253, 0.38)',
      strokeWidth: 0.95,
      strokeDasharray: '3 2',
      opacity: 0.85,
    });
  });
  buildSeamSafePolyline(riftSouthPts1, projectCoord, isPolar).forEach((pathStr, idx) => {
    outlinePaths.push({
      id: `mw-rift-s1-${idx}`,
      svgPath: pathStr,
      type: 'rift-south',
      stroke: 'rgba(196, 181, 253, 0.38)',
      strokeWidth: 0.95,
      strokeDasharray: '3 2',
      opacity: 0.85,
    });
  });

  // Branch 2: Sagittarius / Scorpius Galactic Center Rift (l: 338° -> 376° / 16°)
  const riftNorthPts2: { az: number; alt: number; relAz: number }[] = [];
  const riftSouthPts2: { az: number; alt: number; relAz: number }[] = [];
  for (let l = 338; l <= 376; l += 2) {
    const wrappedL = l >= 360 ? l - 360 : l;
    riftNorthPts2.push(galToHoriz(wrappedL, 3.5));
    riftSouthPts2.push(galToHoriz(wrappedL, -1.8));
  }
  buildSeamSafePolyline(riftNorthPts2, projectCoord, isPolar).forEach((pathStr, idx) => {
    outlinePaths.push({
      id: `mw-rift-n2-${idx}`,
      svgPath: pathStr,
      type: 'rift-north',
      stroke: 'rgba(196, 181, 253, 0.38)',
      strokeWidth: 0.95,
      strokeDasharray: '3 2',
      opacity: 0.85,
    });
  });
  buildSeamSafePolyline(riftSouthPts2, projectCoord, isPolar).forEach((pathStr, idx) => {
    outlinePaths.push({
      id: `mw-rift-s2-${idx}`,
      svgPath: pathStr,
      type: 'rift-south',
      stroke: 'rgba(196, 181, 253, 0.38)',
      strokeWidth: 0.95,
      strokeDasharray: '3 2',
      opacity: 0.85,
    });
  });

  // E. Coalsack Dark Nebula Contour (near Crux / Musca, l ~ 298° to 305°)
  const coalsackPts: { az: number; alt: number; relAz: number }[] = [
    galToHoriz(298, -5.0),
    galToHoriz(300, -4.0),
    galToHoriz(303, -4.5),
    galToHoriz(305, -6.0),
    galToHoriz(304, -8.0),
    galToHoriz(301, -7.5),
    galToHoriz(298.5, -6.5),
    galToHoriz(298, -5.0),
  ];
  buildSeamSafePolyline(coalsackPts, projectCoord, isPolar).forEach((pathStr, idx) => {
    outlinePaths.push({
      id: `mw-coalsack-${idx}`,
      svgPath: pathStr,
      type: 'coalsack',
      stroke: 'rgba(196, 181, 253, 0.40)',
      strokeWidth: 0.95,
      strokeDasharray: '3 2',
      opacity: 0.85,
    });
  });

  return {
    boundaryClipPaths,
    boundedShadingQuads,
    outerBandQuads: boundedShadingQuads,
    innerCoreQuads: [],
    darkRiftQuads,
    outlinePaths,
  };
}
