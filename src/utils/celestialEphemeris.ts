/**
 * Real-Time Celestial Ephemeris Engine
 * Computes live horizontal coordinates (Azimuth & Altitude) for:
 * - The Sun and its 24-hour diurnal trajectory path
 * - The Moon and its 24-hour diurnal trajectory path
 * - Major visible stars (Sirius, Betelgeuse, Rigel, Vega) as distinct point markers
 * - Major visible planets (Mars, Jupiter, Venus, Saturn) as distinct point markers
 * 
 * Based on Jean Meeus "Astronomical Algorithms" and NOAA solar geometry.
 */

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

export interface CelestialPoint {
  id: string;
  name: string;
  type: 'sun' | 'moon' | 'star' | 'planet';
  azimuth: number; // 0° to 360° (measured from North clockwise)
  altitude: number; // -90° to +90°
  magnitude?: number;
  color: string;
  symbol?: string;
  extraInfo?: string;
  isConstellationAnchor?: boolean;
  constellation?: string;
}

export interface TrajectorySegment {
  points: { az: number; alt: number; relAz?: number }[];
  svgPath: string;
  isAboveHorizon?: boolean;
}

export interface ConstellationLineSegment {
  constellation: string;
  svgPath: string;
}

export type PlanetId = 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn';

export interface PlanetTrajectoryData {
  id: PlanetId;
  name: string;
  color: string;
  symbol: string;
  points: { az: number; alt: number }[];
  segments: TrajectorySegment[];
}

export interface CelestialEphemerisData {
  sun: CelestialPoint;
  moon: CelestialPoint & {
    phaseName: string;
    illuminationFraction: number;
    detailed?: DetailedMoonMetrics;
  };
  stars: CelestialPoint[];
  planets: CelestialPoint[];
  sunTrajectory: TrajectorySegment[];
  moonTrajectory: TrajectorySegment[];
  planetTrajectories: PlanetTrajectoryData[];
  eclipticSegments?: TrajectorySegment[];
  constellationLines: ConstellationLineSegment[];
  detailedMoon: DetailedMoonMetrics;
}

/**
 * Julian Date from JavaScript Date object
 */
export function getJulianDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

/**
 * Greenwich Mean Sidereal Time (GMST) in degrees [0, 360)
 */
export function getGMST(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - (T * T * T) / 38710000;
  gmst = ((gmst % 360) + 360) % 360;
  return gmst;
}

/**
 * Local Sidereal Time (LST) in degrees [0, 360)
 */
export function getLocalSiderealTime(date: Date, longitudeDeg: number): number {
  const jd = getJulianDate(date);
  const gmst = getGMST(jd);
  return ((gmst + longitudeDeg) % 360 + 360) % 360;
}

/**
 * Converts Equatorial Coordinates (Right Ascension, Declination)
 * to Horizontal Coordinates (Azimuth, Altitude)
 */
export function equatorialToHorizontal(
  raDeg: number,
  decDeg: number,
  latDeg: number,
  lstDeg: number
): { azimuth: number; altitude: number } {
  // Local Hour Angle
  let ha = lstDeg - raDeg;
  ha = ((ha % 360) + 360) % 360;

  const haRad = ha * DEG2RAD;
  const decRad = decDeg * DEG2RAD;
  const latRad = latDeg * DEG2RAD;

  // Altitude (Elevation)
  const sinAlt = Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad);
  const altRad = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
  const altitude = altRad * RAD2DEG;

  // Azimuth (from North clockwise)
  const cosAlt = Math.cos(altRad);
  let azimuth = 0;
  if (Math.abs(cosAlt) > 1e-6) {
    const cosAz = (Math.sin(decRad) - Math.sin(latRad) * sinAlt) / (Math.cos(latRad) * cosAlt);
    azimuth = Math.acos(Math.max(-1, Math.min(1, cosAz))) * RAD2DEG;
    if (Math.sin(haRad) > 0) {
      azimuth = 360 - azimuth;
    }
  }

  return { azimuth: ((azimuth % 360) + 360) % 360, altitude };
}

/**
 * Expanded stars catalog with true astronomical apparent magnitude (J2000 RA & Dec)
 */
import { EXPANDED_STAR_CATALOG } from '../data/starCatalog';

export interface StarCatalogDef {
  id: string;
  name: string;
  ra: number;
  dec: number;
  mag: number;
  color: string;
  constellation?: string;
  isAnchor?: boolean;
}

export const MAJOR_STARS: StarCatalogDef[] = EXPANDED_STAR_CATALOG;
export { EXPANDED_STAR_CATALOG };

export const CONSTELLATION_LINES: { constellation: string; pairs: [string, string][] }[] = [
  {
    constellation: 'Orion',
    pairs: [
      ['betelgeuse', 'bellatrix'],
      ['bellatrix', 'rigel'],
      ['rigel', 'saiph'],
      ['saiph', 'betelgeuse'],
      ['betelgeuse', 'alnilam'],
      ['rigel', 'alnilam'],
    ],
  },
  {
    constellation: 'Ursa Major (Big Dipper)',
    pairs: [
      ['dubhe', 'merak'],
      ['merak', 'phecda'],
      ['phecda', 'megrez'],
      ['megrez', 'dubhe'],
      ['megrez', 'alioth'],
      ['alioth', 'mizar'],
      ['mizar', 'alkaid'],
    ],
  },
  {
    constellation: 'Cassiopeia',
    pairs: [
      ['caph', 'shedar'],
      ['shedar', 'navi'],
      ['navi', 'ruchbah'],
      ['ruchbah', 'segin'],
    ],
  },
  {
    constellation: 'Summer Triangle',
    pairs: [
      ['vega', 'deneb'],
      ['deneb', 'altair'],
      ['altair', 'vega'],
    ],
  },
];

/**
 * Low-precision solar position (Jean Meeus)
 */
function getSunEquatorial(jd: number): { ra: number; dec: number } {
  const d = jd - 2451545.0;
  const g = ((357.529 + 0.98560028 * d) % 360 + 360) % 360;
  const q = ((280.459 + 0.98564736 * d) % 360 + 360) % 360;
  const L = ((q + 1.915 * Math.sin(g * DEG2RAD) + 0.020 * Math.sin(2 * g * DEG2RAD)) % 360 + 360) % 360;

  const e = 23.439 - 0.00000036 * d;
  const LRad = L * DEG2RAD;
  const eRad = e * DEG2RAD;

  const sinDec = Math.sin(eRad) * Math.sin(LRad);
  const dec = Math.asin(sinDec) * RAD2DEG;

  const y = Math.cos(eRad) * Math.sin(LRad);
  const x = Math.cos(LRad);
  const ra = ((Math.atan2(y, x) * RAD2DEG) % 360 + 360) % 360;

  return { ra, dec };
}

/**
 * Low-precision lunar position & illumination (Jean Meeus)
 */
function getMoonEquatorial(jd: number): { ra: number; dec: number; illumination: number; phaseName: string } {
  const d = jd - 2451545.0;

  // Moon's mean elements
  const L = ((218.316 + 13.176396 * d) % 360 + 360) % 360;
  const M = ((134.963 + 13.064993 * d) % 360 + 360) % 360;
  const F = ((93.272 + 13.229350 * d) % 360 + 360) % 360;

  // Sun's mean anomaly
  const Ms = ((357.529 + 0.985600 * d) % 360 + 360) % 360;
  // Sun's mean longitude
  const Ls = ((280.460 + 0.985647 * d) % 360 + 360) % 360;
  const D = ((L - Ls) % 360 + 360) % 360; // Elongation

  // Ecliptic longitude & latitude
  const lon = L +
    6.289 * Math.sin(M * DEG2RAD) +
    1.274 * Math.sin((2 * D - M) * DEG2RAD) +
    0.658 * Math.sin(2 * D * DEG2RAD) -
    0.214 * Math.sin(2 * M * DEG2RAD) -
    0.186 * Math.sin(Ms * DEG2RAD);

  const lat = 5.128 * Math.sin(F * DEG2RAD) +
    0.280 * Math.sin((M + F) * DEG2RAD) +
    0.277 * Math.sin((M - F) * DEG2RAD);

  const e = 23.439 - 0.00000036 * d;
  const lonRad = lon * DEG2RAD;
  const latRad = lat * DEG2RAD;
  const eRad = e * DEG2RAD;

  // Convert to Equatorial (RA, Dec)
  const sinDec = Math.sin(latRad) * Math.cos(eRad) + Math.cos(latRad) * Math.sin(eRad) * Math.sin(lonRad);
  const dec = Math.asin(Math.max(-1, Math.min(1, sinDec))) * RAD2DEG;

  const y = Math.cos(latRad) * Math.sin(lonRad) * Math.cos(eRad) - Math.sin(latRad) * Math.sin(eRad);
  const x = Math.cos(latRad) * Math.cos(lonRad);
  const ra = ((Math.atan2(y, x) * RAD2DEG) % 360 + 360) % 360;

  // Illumination fraction (phase)
  const phaseAngle = Math.abs(180 - D);
  let calculatedPercent = ((1 + Math.cos(phaseAngle * DEG2RAD)) / 2) * 100;
  calculatedPercent = Math.min(100, Math.max(0, calculatedPercent));
  const illumination = calculatedPercent / 100;

  let phaseName = 'New Moon';
  if (D < 22.5 || D >= 337.5) phaseName = 'New Moon';
  else if (D < 67.5) phaseName = 'Waxing Crescent';
  else if (D < 112.5) phaseName = 'First Quarter';
  else if (D < 157.5) phaseName = 'Waxing Gibbous';
  else if (D < 202.5) phaseName = 'Full Moon';
  else if (D < 247.5) phaseName = 'Waning Gibbous';
  else if (D < 292.5) phaseName = 'Third Quarter';
  else phaseName = 'Waning Crescent';

  return { ra, dec, illumination, phaseName };
}

/**
 * Standard NASA/JPL J2000.0 Keplerian Orbital Elements and Century Rates
 * for high-precision geocentric planetary positions.
 */
interface PlanetaryKeplerianParams {
  a0: number; aRate: number; // Semi-major axis (AU, AU/century)
  e0: number; eRate: number; // Eccentricity, 1/century
  I0: number; IRate: number; // Inclination (deg, deg/century)
  L0: number; LRate: number; // Mean longitude (deg, deg/century)
  varpi0: number; varpiRate: number; // Longitude of perihelion (deg, deg/century)
  node0: number; nodeRate: number; // Longitude of ascending node (deg, deg/century)
}

const PLANETARY_KEPLER_ELEMENTS: Record<PlanetId | 'earth', PlanetaryKeplerianParams> = {
  mercury: {
    a0: 0.38709927, aRate: 0.00000037,
    e0: 0.20563593, eRate: 0.00001906,
    I0: 7.004979, IRate: -0.005947,
    L0: 252.250323, LRate: 149472.674111,
    varpi0: 77.457796, varpiRate: 1.556478,
    node0: 48.330765, nodeRate: -0.125341,
  },
  venus: {
    a0: 0.72333566, aRate: 0.00000390,
    e0: 0.00677672, eRate: -0.00004107,
    I0: 3.394676, IRate: -0.000789,
    L0: 181.979099, LRate: 58517.815387,
    varpi0: 131.602467, varpiRate: 1.402229,
    node0: 76.679843, nodeRate: -0.277694,
  },
  earth: {
    a0: 1.00000261, aRate: 0.00000562,
    e0: 0.01671123, eRate: -0.00004392,
    I0: 0.000015, IRate: -0.012947,
    L0: 100.464572, LRate: 35999.372449,
    varpi0: 102.937682, varpiRate: 0.323274,
    node0: 0.0, nodeRate: 0.0,
  },
  mars: {
    a0: 1.52371034, aRate: 0.00001847,
    e0: 0.09339410, eRate: 0.00007882,
    I0: 1.849691, IRate: -0.008131,
    L0: 355.446562, LRate: 19140.302685,
    varpi0: 336.056370, varpiRate: 1.841045,
    node0: 49.559539, nodeRate: -0.292573,
  },
  jupiter: {
    a0: 5.20288700, aRate: -0.00011607,
    e0: 0.04838624, eRate: -0.00013253,
    I0: 1.304397, IRate: -0.001837,
    L0: 34.396440, LRate: 3034.746128,
    varpi0: 14.728479, varpiRate: 1.619969,
    node0: 100.473909, nodeRate: 0.204691,
  },
  saturn: {
    a0: 9.53667594, aRate: -0.00125060,
    e0: 0.05386179, eRate: -0.00050991,
    I0: 2.485992, IRate: 0.001936,
    L0: 49.954244, LRate: 1222.493622,
    varpi0: 92.598878, varpiRate: -0.418972,
    node0: 113.662424, nodeRate: -0.288678,
  },
};

/**
 * Computes 3D Heliocentric Ecliptic coordinates (X, Y, Z in AU) for any planet at Julian century T.
 */
function getHeliocentricKeplerian(planetKey: PlanetId | 'earth', T: number): { x: number; y: number; z: number; r: number } {
  const p = PLANETARY_KEPLER_ELEMENTS[planetKey];
  const a = p.a0 + p.aRate * T;
  const e = p.e0 + p.eRate * T;
  const I = (p.I0 + p.IRate * T) * DEG2RAD;
  const L = ((p.L0 + p.LRate * T) % 360 + 360) % 360;
  const varpi = ((p.varpi0 + p.varpiRate * T) % 360 + 360) % 360;
  const node = ((p.node0 + p.nodeRate * T) % 360 + 360) % 360;

  const omega = (varpi - node) * DEG2RAD; // Argument of perihelion
  const nodeRad = node * DEG2RAD;

  // Mean anomaly M
  const M_deg = ((L - varpi) % 360 + 360) % 360;
  const M_rad = M_deg * DEG2RAD;

  // Solve Kepler equation: M = E - e*sin(E) using Newton-Raphson iteration
  let E = M_rad + e * Math.sin(M_rad);
  for (let i = 0; i < 10; i++) {
    const dE = (E - e * Math.sin(E) - M_rad) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-10) break;
  }

  // True anomaly nu
  const sinNu = (Math.sqrt(Math.max(0, 1 - e * e)) * Math.sin(E)) / (1 - e * Math.cos(E));
  const cosNu = (Math.cos(E) - e) / (1 - e * Math.cos(E));
  const nu = Math.atan2(sinNu, cosNu);

  // Heliocentric radius r in AU
  const r = a * (1 - e * Math.cos(E));

  // Argument of latitude u = omega + nu
  const u = omega + nu;

  // 3D Heliocentric Ecliptic coordinates (AU)
  const x = r * (Math.cos(nodeRad) * Math.cos(u) - Math.sin(nodeRad) * Math.sin(u) * Math.cos(I));
  const y = r * (Math.sin(nodeRad) * Math.cos(u) + Math.cos(nodeRad) * Math.sin(u) * Math.cos(I));
  const z = r * (Math.sin(u) * Math.sin(I));

  return { x, y, z, r };
}

/**
 * Step 1 & Step 2: Accurate Geocentric Ecliptic-to-Equatorial Coordinate Transformation
 * Returns Right Ascension, Declination, apparent Visual Magnitude, distance (AU),
 * and Geocentric Ecliptic Latitude & Longitude.
 */
export function getPlanetEquatorial(
  planet: PlanetId,
  jd: number
): { ra: number; dec: number; mag: number; distanceAU: number; eclipticLat: number; eclipticLon: number } {
  const T = (jd - 2451545.0) / 36525; // Julian centuries since J2000.0
  const d = jd - 2451545.0;

  // Step 1: Heliocentric position of Planet (Xp, Yp, Zp) and Earth (Xe, Ye, Ze)
  const hp = getHeliocentricKeplerian(planet, T);
  const he = getHeliocentricKeplerian('earth', T);

  // Subtract Earth vector to get Geocentric coordinates: ΔX = Xp - Xe, ΔY = Yp - Ye, ΔZ = Zp - Ze
  const dx = hp.x - he.x;
  const dy = hp.y - he.y;
  const dz = hp.z - he.z;
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

  // Geocentric Ecliptic Coordinates (demonstrates planet lies within ±7° of the Ecliptic)
  const eclipticLon = ((Math.atan2(dy, dx) * RAD2DEG) % 360 + 360) % 360;
  const eclipticLat = Math.asin(Math.max(-1, Math.min(1, dz / dist))) * RAD2DEG;

  // Step 2: Convert Geocentric Ecliptic to Equatorial (RA, Dec) via true obliquity of the ecliptic
  const eps = (23.439291 - 0.00000036 * d) * DEG2RAD;
  const cosEps = Math.cos(eps);
  const sinEps = Math.sin(eps);

  // User specification:
  // tan(alpha) = (ΔY * cos(eps) - ΔZ * sin(eps)) / ΔX
  // sin(delta) = (ΔY * sin(eps) + ΔZ * cos(eps)) / sqrt(ΔX^2 + ΔY^2 + ΔZ^2)
  const xEq = dx;
  const yEq = dy * cosEps - dz * sinEps;
  const zEq = dy * sinEps + dz * cosEps;

  const ra = ((Math.atan2(yEq, xEq) * RAD2DEG) % 360 + 360) % 360;
  const dec = Math.asin(Math.max(-1, Math.min(1, zEq / dist))) * RAD2DEG;

  // Astronomical Visual Magnitude formula (Meeus / Astronomical Almanac)
  const rSun = hp.r;
  const rEarth = he.r;
  const cosPhase = Math.max(-1, Math.min(1, (rSun * rSun + dist * dist - rEarth * rEarth) / (2 * rSun * dist)));
  const phaseAngle = Math.acos(cosPhase) * RAD2DEG;

  let mag = 1.0;
  switch (planet) {
    case 'mercury':
      mag = -0.36 + 5 * Math.log10(rSun * dist) + 0.038 * phaseAngle - 0.000273 * phaseAngle * phaseAngle + 0.000002 * Math.pow(phaseAngle, 3);
      mag = Math.max(-2.0, Math.min(5.5, mag));
      break;
    case 'venus':
      mag = -4.34 + 5 * Math.log10(rSun * dist) + 0.0009 * phaseAngle + 0.000239 * phaseAngle * phaseAngle - 0.00000065 * Math.pow(phaseAngle, 3);
      mag = Math.max(-4.9, Math.min(-3.7, mag));
      break;
    case 'mars':
      mag = -1.52 + 5 * Math.log10(rSun * dist) + 0.016 * phaseAngle;
      mag = Math.max(-2.9, Math.min(1.8, mag));
      break;
    case 'jupiter':
      mag = -9.25 + 5 * Math.log10(rSun * dist) + 0.005 * phaseAngle;
      mag = Math.max(-2.9, Math.min(-1.6, mag));
      break;
    case 'saturn':
      mag = -8.88 + 5 * Math.log10(rSun * dist) + 0.044 * phaseAngle;
      mag = Math.max(-0.3, Math.min(1.5, mag));
      break;
  }

  return { ra, dec, mag, distanceAU: dist, eclipticLat, eclipticLon };
}

/**
 * Builds SVG path segments from an array of (azimuth, altitude) points.
 * Handles wrapping at Azimuth 0°/360° boundary so arcs don't cross the screen.
 */
function buildTrajectorySvgSegments(
  points: { az: number; alt: number }[],
  projectCoord: (az: number, alt: number) => { x: number; y: number }
): TrajectorySegment[] {
  if (points.length < 2) return [];

  const segments: TrajectorySegment[] = [];
  let currentSegment: { az: number; alt: number }[] = [points[0]];

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];

    // Detect azimuth wrap-around (e.g. from 359° to 1° or vice versa)
    if (Math.abs(curr.az - prev.az) > 180) {
      if (currentSegment.length > 1) {
        segments.push({
          points: currentSegment,
          svgPath: formatSvgPath(currentSegment, projectCoord),
        });
      }
      currentSegment = [curr];
    } else {
      currentSegment.push(curr);
    }
  }

  if (currentSegment.length > 1) {
    segments.push({
      points: currentSegment,
      svgPath: formatSvgPath(currentSegment, projectCoord),
    });
  }

  return segments;
}

/**
 * Builds full 24-hour diurnal trajectory SVG segments spanning above and below 0° Horizon.
 * 
 * Accurately:
 * 1. Handles Azimuth 0°/360° wrapping with edge interpolation so no horizontal streak artifacts occur.
 * 2. Splits segments precisely at 0° altitude with horizon crossing interpolation so that
 *    segments above horizon (alt >= 0) and below horizon (alt < 0) meet seamlessly at 0° altitude.
 * 3. Tags each segment with `isAboveHorizon: boolean`.
 */
export function buildFullDiurnalTrajectorySegments(
  points: { az: number; alt: number }[],
  projectCoord: (az: number, alt: number, relAzOverride?: number) => { x: number; y: number },
  centerAzimuth = 180
): TrajectorySegment[] {
  if (points.length < 2) return [];

  const leftEdgeAz = centerAzimuth - 180;
  const getRelAz = (az: number) => ((az - leftEdgeAz) % 360 + 360) % 360;

  // Step 1: Break raw points into continuous azimuth tracks by interpolating at boundary
  const continuousTracks: { az: number; alt: number; relAz?: number }[][] = [];
  const startRelAz = getRelAz(points[0].az);
  let currentTrack: { az: number; alt: number; relAz?: number }[] = [{ ...points[0], relAz: startRelAz }];

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const prevRelAz = getRelAz(prev.az);
    const currRelAz = getRelAz(curr.az);
    const relAzDiff = currRelAz - prevRelAz;

    if (Math.abs(relAzDiff) > 180) {
      // Azimuth wrap-around detected across screen boundary (relAz 360° / 0°)
      if (prevRelAz > 180 && currRelAz < 180) {
        // Moving rightward across 360° to 0°
        const unwrappedCurrAz = currRelAz + 360;
        const denominator = unwrappedCurrAz - prevRelAz;
        const t = Math.abs(denominator) > 1e-6 ? (360 - prevRelAz) / denominator : 0.5;
        const altEdge = prev.alt + t * (curr.alt - prev.alt);

        currentTrack.push({ az: (centerAzimuth + 180) % 360, alt: altEdge, relAz: 360 });
        if (currentTrack.length >= 2) {
          continuousTracks.push(currentTrack);
        }
        currentTrack = [
          { az: ((centerAzimuth - 180) % 360 + 360) % 360, alt: altEdge, relAz: 0 },
          { ...curr, relAz: currRelAz },
        ];
      } else if (prevRelAz < 180 && currRelAz > 180) {
        // Moving leftward across 0° to 360°
        const unwrappedPrevAz = prevRelAz + 360;
        const denominator = unwrappedPrevAz - currRelAz;
        const t = Math.abs(denominator) > 1e-6 ? (unwrappedPrevAz - 360) / denominator : 0.5;
        const altEdge = prev.alt + t * (curr.alt - prev.alt);

        currentTrack.push({ az: ((centerAzimuth - 180) % 360 + 360) % 360, alt: altEdge, relAz: 0 });
        if (currentTrack.length >= 2) {
          continuousTracks.push(currentTrack);
        }
        currentTrack = [
          { az: (centerAzimuth + 180) % 360, alt: altEdge, relAz: 360 },
          { ...curr, relAz: currRelAz },
        ];
      } else {
        if (currentTrack.length >= 2) {
          continuousTracks.push(currentTrack);
        }
        currentTrack = [{ ...curr, relAz: currRelAz }];
      }
    } else {
      currentTrack.push({ ...curr, relAz: currRelAz });
    }
  }

  if (currentTrack.length >= 2) {
    continuousTracks.push(currentTrack);
  }

  // Step 2: Split each continuous azimuth track at the 0° Altitude Horizon line
  const finalSegments: TrajectorySegment[] = [];

  for (const track of continuousTracks) {
    if (track.length < 2) continue;

    let segPoints: { az: number; alt: number; relAz?: number }[] = [track[0]];
    let isAbove = track[0].alt >= 0;

    for (let i = 1; i < track.length; i++) {
      const pPrev = track[i - 1];
      const pCurr = track[i];
      const prevAbove = pPrev.alt >= 0;
      const currAbove = pCurr.alt >= 0;

      if (prevAbove !== currAbove) {
        // Horizon crossing between pPrev and pCurr!
        const denominator = pCurr.alt - pPrev.alt;
        const tCross = Math.abs(denominator) > 1e-6 ? (0 - pPrev.alt) / denominator : 0.5;
        const azCross = pPrev.az + Math.max(0, Math.min(1, tCross)) * (pCurr.az - pPrev.az);
        let relAzCross: number | undefined = undefined;
        if (pPrev.relAz !== undefined && pCurr.relAz !== undefined) {
          relAzCross = pPrev.relAz + Math.max(0, Math.min(1, tCross)) * (pCurr.relAz - pPrev.relAz);
        }
        const pCross = { az: azCross, alt: 0, relAz: relAzCross };

        segPoints.push(pCross);
        if (segPoints.length >= 2) {
          finalSegments.push({
            points: segPoints,
            svgPath: formatSvgPath(segPoints, projectCoord),
            isAboveHorizon: isAbove,
          });
        }

        // Start new segment on other side of horizon
        isAbove = currAbove;
        segPoints = [pCross, pCurr];
      } else {
        segPoints.push(pCurr);
      }
    }

    if (segPoints.length >= 2) {
      finalSegments.push({
        points: segPoints,
        svgPath: formatSvgPath(segPoints, projectCoord),
        isAboveHorizon: isAbove,
      });
    }
  }

  return finalSegments;
}

/**
 * Builds trajectory SVG segments filtered strictly to visible arcs above the 0° True Horizon line (alt >= 0)
 */
export function buildAboveHorizonTrajectorySvgSegments(
  points: { az: number; alt: number }[],
  projectCoord: (az: number, alt: number, relAzOverride?: number) => { x: number; y: number },
  centerAzimuth = 180
): TrajectorySegment[] {
  if (points.length < 2) return [];

  const leftEdgeAz = centerAzimuth - 180;
  const getRelAz = (az: number) => ((az - leftEdgeAz) % 360 + 360) % 360;

  const segments: TrajectorySegment[] = [];
  let currentSegment: { az: number; alt: number; relAz?: number }[] = [];

  for (let i = 0; i < points.length; i++) {
    const curr = points[i];
    const currRelAz = getRelAz(curr.az);

    // Filter strictly to visible arc above 0° True Horizon
    if (curr.alt < 0) {
      if (currentSegment.length > 1) {
        segments.push({
          points: currentSegment,
          svgPath: formatSvgPath(currentSegment, projectCoord),
        });
      }
      currentSegment = [];
      continue;
    }

    if (currentSegment.length > 0) {
      const prev = currentSegment[currentSegment.length - 1];
      const prevRelAz = prev.relAz ?? getRelAz(prev.az);
      // Detect azimuth wrap-around
      if (Math.abs(currRelAz - prevRelAz) > 180) {
        if (currentSegment.length > 1) {
          segments.push({
            points: currentSegment,
            svgPath: formatSvgPath(currentSegment, projectCoord),
          });
        }
        currentSegment = [{ ...curr, relAz: currRelAz }];
        continue;
      }
    }
    currentSegment.push({ ...curr, relAz: currRelAz });
  }

  if (currentSegment.length > 1) {
    segments.push({
      points: currentSegment,
      svgPath: formatSvgPath(currentSegment, projectCoord),
    });
  }

  return segments;
}

function formatSvgPath(
  points: { az: number; alt: number; relAz?: number }[],
  projectCoord: (az: number, alt: number, relAzOverride?: number) => { x: number; y: number }
): string {
  if (points.length === 0) return '';
  const first = projectCoord(points[0].az, points[0].alt, points[0].relAz);
  let d = `M ${first.x.toFixed(2)} ${first.y.toFixed(2)}`;

  for (let i = 1; i < points.length; i++) {
    const pt = projectCoord(points[i].az, points[i].alt, points[i].relAz);
    d += ` L ${pt.x.toFixed(2)} ${pt.y.toFixed(2)}`;
  }
  return d;
}

/**
 * Calculates complete celestial ephemeris data for the current instant and today's diurnal arcs
 */
export function calculateCelestialEphemeris(
  date: Date,
  latitude: number,
  longitude: number,
  projectCoord: (az: number, alt: number, relAzOverride?: number) => { x: number; y: number },
  centerAzimuth = 180
): CelestialEphemerisData {
  const jd = getJulianDate(date);
  const lst = getLocalSiderealTime(date, longitude);

  // 1. Current Sun
  const sunEq = getSunEquatorial(jd);
  const sunHoriz = equatorialToHorizontal(sunEq.ra, sunEq.dec, latitude, lst);
  const sun: CelestialPoint = {
    id: 'sun',
    name: 'Sun',
    type: 'sun',
    azimuth: sunHoriz.azimuth,
    altitude: sunHoriz.altitude,
    color: '#fbbf24',
    symbol: '☀️',
    extraInfo: `Alt ${sunHoriz.altitude >= 0 ? '+' : ''}${sunHoriz.altitude.toFixed(1)}° · Az ${sunHoriz.azimuth.toFixed(1)}°`,
  };

  // 2. Current Moon with high-precision synodic metrics & topocentric angles
  const detailedMoon = calculateDetailedMoonPhase(date, latitude, longitude);
  const moon: CelestialPoint & {
    phaseName: string;
    illuminationFraction: number;
    detailed?: DetailedMoonMetrics;
  } = {
    id: 'moon',
    name: 'Moon',
    type: 'moon',
    azimuth: detailedMoon.moonAzimuth,
    altitude: detailedMoon.moonAltitude,
    color: '#e2e8f0',
    symbol: '🌙',
    phaseName: detailedMoon.phaseName,
    illuminationFraction: detailedMoon.illuminationFraction,
    detailed: detailedMoon,
    extraInfo: `${detailedMoon.phaseName} (${Math.round(detailedMoon.illuminationFraction * 100)}%) · Alt ${detailedMoon.moonAltitude >= 0 ? '+' : ''}${detailedMoon.moonAltitude.toFixed(1)}°`,
  };

  // 3. Stars Catalog with real apparent magnitudes and constellation metadata
  const stars: CelestialPoint[] = MAJOR_STARS.map((s) => {
    const horiz = equatorialToHorizontal(s.ra, s.dec, latitude, lst);
    return {
      id: s.id,
      name: s.name,
      type: 'star' as const,
      azimuth: horiz.azimuth,
      altitude: horiz.altitude,
      magnitude: s.mag,
      color: s.color,
      isConstellationAnchor: s.isAnchor,
      constellation: s.constellation,
      extraInfo: `Mag ${s.mag >= 0 ? '+' : ''}${s.mag.toFixed(2)} · Alt ${horiz.altitude >= 0 ? '+' : ''}${horiz.altitude.toFixed(1)}° · ${s.constellation || 'Navigation Star'}`,
    };
  });

  // 4. Visible Planets (Mercury, Venus, Mars, Jupiter, Saturn)
  const planetDefs: { id: PlanetId; name: string; color: string; symbol: string }[] = [
    { id: 'mercury', name: 'Mercury', color: '#cbd5e1', symbol: '☿' },
    { id: 'venus', name: 'Venus', color: '#fef08a', symbol: '♀' },
    { id: 'mars', name: 'Mars', color: '#f87171', symbol: '♂' },
    { id: 'jupiter', name: 'Jupiter', color: '#fed7aa', symbol: '♃' },
    { id: 'saturn', name: 'Saturn', color: '#fde68a', symbol: '♄' },
  ];

  const planets: CelestialPoint[] = planetDefs.map((p) => {
    const eq = getPlanetEquatorial(p.id, jd);
    const horiz = equatorialToHorizontal(eq.ra, eq.dec, latitude, lst);
    return {
      id: p.id,
      name: p.name,
      type: 'planet' as const,
      azimuth: horiz.azimuth,
      altitude: horiz.altitude,
      magnitude: eq.mag,
      color: p.color,
      symbol: p.symbol,
      extraInfo: `Mag ${eq.mag.toFixed(1)} · Dist ${eq.distanceAU.toFixed(2)} AU · EclLat ${eq.eclipticLat >= 0 ? '+' : ''}${eq.eclipticLat.toFixed(1)}° · Alt ${horiz.altitude >= 0 ? '+' : ''}${horiz.altitude.toFixed(1)}°`,
    };
  });

  // 5. Sun, Moon & Planet 24-Hour Diurnal Trajectory Arcs above 0° True Horizon
  const sunArcPoints: { az: number; alt: number }[] = [];
  const moonArcPoints: { az: number; alt: number }[] = [];
  const planetArcPoints: Record<PlanetId, { az: number; alt: number }[]> = {
    mercury: [],
    venus: [],
    mars: [],
    jupiter: [],
    saturn: [],
  };

  const baseDay = new Date(date);
  baseDay.setHours(0, 0, 0, 0);
  const baseTime = baseDay.getTime();

  // Sample every 6 minutes (240 points over 24 hours) for a butter-smooth diurnal curve
  for (let i = 0; i <= 240; i++) {
    const sampleDate = new Date(baseTime + (i * 6) * 60 * 1000);
    const sampleJd = getJulianDate(sampleDate);
    const sampleLst = getLocalSiderealTime(sampleDate, longitude);

    // Sun diurnal point
    const sampleSunEq = getSunEquatorial(sampleJd);
    const sampleSunHoriz = equatorialToHorizontal(sampleSunEq.ra, sampleSunEq.dec, latitude, sampleLst);
    sunArcPoints.push({
      az: sampleSunHoriz.azimuth,
      alt: sampleSunHoriz.altitude,
    });

    // Moon diurnal point
    const sampleMoonEq = getMoonEquatorial(sampleJd);
    const sampleMoonHoriz = equatorialToHorizontal(sampleMoonEq.ra, sampleMoonEq.dec, latitude, sampleLst);
    moonArcPoints.push({
      az: sampleMoonHoriz.azimuth,
      alt: sampleMoonHoriz.altitude,
    });

    // Visible Planets diurnal points (Mercury, Venus, Mars, Jupiter, Saturn)
    for (const p of planetDefs) {
      const pEq = getPlanetEquatorial(p.id, sampleJd);
      const pHoriz = equatorialToHorizontal(pEq.ra, pEq.dec, latitude, sampleLst);
      planetArcPoints[p.id].push({
        az: pHoriz.azimuth,
        alt: pHoriz.altitude,
      });
    }
  }

  // Generate full 24-hour diurnal trajectory segments (both above and below horizon)
  const sunTrajectory = buildFullDiurnalTrajectorySegments(sunArcPoints, projectCoord, centerAzimuth);
  const moonTrajectory = buildFullDiurnalTrajectorySegments(moonArcPoints, projectCoord, centerAzimuth);

  // Dynamic Planet Trajectories (Mercury, Venus, Mars, Jupiter, Saturn)
  const planetTrajectories: PlanetTrajectoryData[] = planetDefs.map((p) => ({
    id: p.id,
    name: p.name,
    color: p.color,
    symbol: p.symbol,
    points: planetArcPoints[p.id],
    segments: buildFullDiurnalTrajectorySegments(planetArcPoints[p.id], projectCoord, centerAzimuth),
  }));

  // 6. Instantaneous Ecliptic Plane Curve across the Sky (beta = 0, lambda from 0 to 360 deg)
  const eclipticArcPoints: { az: number; alt: number }[] = [];
  const epsRad = 23.4392911 * DEG2RAD;
  const sinEps = Math.sin(epsRad);
  const cosEps = Math.cos(epsRad);

  for (let lambdaDeg = 0; lambdaDeg <= 360; lambdaDeg += 1) {
    const lambdaRad = lambdaDeg * DEG2RAD;
    const sinLambda = Math.sin(lambdaRad);
    const cosLambda = Math.cos(lambdaRad);

    const raRad = Math.atan2(cosEps * sinLambda, cosLambda);
    const raDeg = ((raRad * RAD2DEG) % 360 + 360) % 360;
    const decRad = Math.asin(sinEps * sinLambda);
    const decDeg = decRad * RAD2DEG;

    const horiz = equatorialToHorizontal(raDeg, decDeg, latitude, lst);
    eclipticArcPoints.push({
      az: horiz.azimuth,
      alt: horiz.altitude,
    });
  }

  const eclipticSegments = buildFullDiurnalTrajectorySegments(eclipticArcPoints, projectCoord, centerAzimuth);

  // 7. Constellation Stick-Figure Connection Lines
  const constellationLines: ConstellationLineSegment[] = [];
  const starMap = new Map<string, CelestialPoint>();
  stars.forEach((s) => starMap.set(s.id, s));

  for (const group of CONSTELLATION_LINES) {
    for (const [idA, idB] of group.pairs) {
      const starA = starMap.get(idA);
      const starB = starMap.get(idB);
      if (!starA || !starB) continue;

      // Avoid wrapping artifact if line spans across the screen edge seam
      const relA = ((starA.azimuth - (centerAzimuth - 180)) % 360 + 360) % 360;
      const relB = ((starB.azimuth - (centerAzimuth - 180)) % 360 + 360) % 360;
      if (Math.abs(relA - relB) > 180) continue;

      const ptA = projectCoord(starA.azimuth, starA.altitude);
      const ptB = projectCoord(starB.azimuth, starB.altitude);
      const svgPath = `M ${ptA.x.toFixed(1)} ${ptA.y.toFixed(1)} L ${ptB.x.toFixed(1)} ${ptB.y.toFixed(1)}`;
      constellationLines.push({
        constellation: group.constellation,
        svgPath,
      });
    }
  }

  return {
    sun,
    moon,
    stars,
    planets,
    sunTrajectory,
    moonTrajectory,
    planetTrajectories,
    eclipticSegments,
    constellationLines,
    detailedMoon,
  };
}

export interface DetailedMoonMetrics {
  phaseName: string;
  illuminationPct: number;
  illuminationFraction: number;
  illumination: number; // True sunlit fraction [0, 1]
  lunarAgeDays: number;
  lunarAgeHours: number;
  lunarAgeMinutes: number;
  lunarAgeText: string;
  tiltAngleDeg: number; // Position angle of bright limb relative to local Zenith [0, 360)
  parallacticAngleDeg: number;
  equatorialPositionAngleDeg: number;
  moonAltitude: number;
  moonAzimuth: number;
  sunAltitude: number;
  sunAzimuth: number;
  isWaxing: boolean;
  elongationDeg: number;
  sunAngleFromZenithDeg: number; // Dynamic topocentric angle of the Sun relative to local Zenith (clockwise on sky view)
  poleAngleFromZenithDeg: number; // Dynamic topocentric angle of Lunar/Celestial North Pole relative to local Zenith
  cosElongation: number; // 3D cosine of elongation
}

/**
 * Calculates high-precision synodic moon metrics and the exact real-world
 * position angle of the Moon's bright limb relative to the observer's local zenith.
 * Based on Jean Meeus "Astronomical Algorithms" Chapter 48.
 */
export function calculateDetailedMoonPhase(
  date: Date,
  latDeg: number,
  lonDeg: number
): DetailedMoonMetrics {
  const jd = getJulianDate(date);
  const d = jd - 2451545.0;

  // 1. Sun's coordinates
  const Ls = ((280.460 + 0.9856474 * d) % 360 + 360) % 360;
  const Ms = ((357.528 + 0.9856003 * d) % 360 + 360) % 360;
  const lambdaSun = Ls + 1.915 * Math.sin(Ms * DEG2RAD) + 0.020 * Math.sin(2 * Ms * DEG2RAD);
  const epsilon = 23.439 - 0.00000036 * d;
  const epsRad = epsilon * DEG2RAD;
  const lambdaSunRad = lambdaSun * DEG2RAD;

  const sinDecSun = Math.sin(epsRad) * Math.sin(lambdaSunRad);
  const decSun = Math.asin(sinDecSun);
  const raSun = Math.atan2(Math.cos(epsRad) * Math.sin(lambdaSunRad), Math.cos(lambdaSunRad));
  const decSunDeg = decSun * RAD2DEG;
  const raSunDeg = ((raSun * RAD2DEG) % 360 + 360) % 360;

  // 2. Moon's coordinates with major perturbations
  const L = ((218.316 + 13.176396 * d) % 360 + 360) % 360;
  const M = ((134.963 + 13.064993 * d) % 360 + 360) % 360;
  const F = ((93.272 + 13.229350 * d) % 360 + 360) % 360;
  const D = ((L - Ls) % 360 + 360) % 360; // Elongation [0, 360)

  const lonMoon =
    L +
    6.289 * Math.sin(M * DEG2RAD) +
    1.274 * Math.sin((2 * D - M) * DEG2RAD) +
    0.658 * Math.sin(2 * D * DEG2RAD) -
    0.214 * Math.sin(2 * M * DEG2RAD) -
    0.186 * Math.sin(Ms * DEG2RAD);

  const latMoon =
    5.128 * Math.sin(F * DEG2RAD) +
    0.280 * Math.sin((M + F) * DEG2RAD) +
    0.277 * Math.sin((M - F) * DEG2RAD);

  const lonMoonRad = lonMoon * DEG2RAD;
  const latMoonRad = latMoon * DEG2RAD;

  const sinDecMoon =
    Math.sin(latMoonRad) * Math.cos(epsRad) +
    Math.cos(latMoonRad) * Math.sin(epsRad) * Math.sin(lonMoonRad);
  const decMoonRad = Math.asin(Math.max(-1, Math.min(1, sinDecMoon)));
  const decMoonDeg = decMoonRad * RAD2DEG;

  const yMoon =
    Math.cos(latMoonRad) * Math.sin(lonMoonRad) * Math.cos(epsRad) -
    Math.sin(latMoonRad) * Math.sin(epsRad);
  const xMoon = Math.cos(latMoonRad) * Math.cos(lonMoonRad);
  const raMoonRad = Math.atan2(yMoon, xMoon);
  const raMoonDeg = ((raMoonRad * RAD2DEG) % 360 + 360) % 360;

  // 3. Synodic Lunar Age
  const SYNODIC_MONTH = 29.53058867;
  const moonAge = (D / 360) * SYNODIC_MONTH;
  const lunarAgeDays = Math.floor(moonAge);
  const remHours = (moonAge - lunarAgeDays) * 24;
  const lunarAgeHours = Math.floor(remHours);
  const lunarAgeMinutes = Math.floor((remHours - lunarAgeHours) * 60);
  const lunarAgeText = `${lunarAgeDays}d ${lunarAgeHours}h ${lunarAgeMinutes}m`;

  // 4. Foolproof Illumination Math derived directly from working lunar age
  let calculatedPercent = ((1 - Math.cos((moonAge / 29.53) * 2 * Math.PI)) / 2) * 100;
  calculatedPercent = Math.min(100, Math.max(0, calculatedPercent));
  const illuminationPct = calculatedPercent;
  const illuminationFraction = calculatedPercent / 100;

  // 5. Phase Name
  let phaseName = 'New Moon';
  if (D < 22.5 || D >= 337.5) phaseName = 'New Moon';
  else if (D < 67.5) phaseName = 'Waxing Crescent';
  else if (D < 112.5) phaseName = 'First Quarter';
  else if (D < 157.5) phaseName = 'Waxing Gibbous';
  else if (D < 202.5) phaseName = 'Full Moon';
  else if (D < 247.5) phaseName = 'Waning Gibbous';
  else if (D < 292.5) phaseName = 'Third Quarter';
  else phaseName = 'Waning Crescent';

  const isWaxing = D < 180;

  // 6. Bright Limb Position Angle in Equatorial system (chi, Meeus Ch. 48)
  const dAlpha = (raSunDeg - raMoonDeg) * DEG2RAD;
  const yChi = Math.cos(decSun) * Math.sin(dAlpha);
  const xChi =
    Math.sin(decSun) * Math.cos(decMoonRad) -
    Math.cos(decSun) * Math.sin(decMoonRad) * Math.cos(dAlpha);
  let chi = Math.atan2(yChi, xChi) * RAD2DEG;
  chi = ((chi % 360) + 360) % 360;

  // 7. Parallactic angle q
  const lst = getLocalSiderealTime(date, lonDeg);
  let H = lst - raMoonDeg; // Hour angle
  H = ((H % 360) + 360) % 360;
  const hRad = H * DEG2RAD;
  const phiRad = latDeg * DEG2RAD;

  const yQ = Math.sin(hRad);
  const xQ = Math.tan(phiRad) * Math.cos(decMoonRad) - Math.sin(decMoonRad) * Math.cos(hRad);
  let q = Math.atan2(yQ, xQ) * RAD2DEG;
  q = ((q % 360) + 360) % 360;

  // 8. Bright Limb Position Angle relative to local Zenith:
  // theta = chi - q
  const tiltAngleDeg = ((chi - q) % 360 + 360) % 360;

  // 9. Horizontal coordinates (Altitude & Azimuth)
  const moonHoriz = equatorialToHorizontal(raMoonDeg, decMoonDeg, latDeg, lst);
  const sunHoriz = equatorialToHorizontal(raSunDeg, decSunDeg, latDeg, lst);

  // 10. True Topocentric 3D Sky-Plane Projection (Naked-Eye Perspective)
  const azMoonRad = moonHoriz.azimuth * DEG2RAD;
  const altMoonRad = moonHoriz.altitude * DEG2RAD;
  const azSunRad = sunHoriz.azimuth * DEG2RAD;
  const altSunRad = sunHoriz.altitude * DEG2RAD;

  // Topocentric unit vectors in local horizon coordinates (X=East, Y=North, Z=Zenith)
  const rm = [
    Math.cos(altMoonRad) * Math.sin(azMoonRad),
    Math.cos(altMoonRad) * Math.cos(azMoonRad),
    Math.sin(altMoonRad),
  ];

  const rs = [
    Math.cos(altSunRad) * Math.sin(azSunRad),
    Math.cos(altSunRad) * Math.cos(azSunRad),
    Math.sin(altSunRad),
  ];

  // Camera basis on the sky plane looking directly along line-of-sight rm:
  // Projection of local Zenith (0, 0, 1) onto plane perpendicular to rm
  const cosAlt = Math.max(1e-6, Math.cos(altMoonRad));
  const vUp = [
    -Math.sin(altMoonRad) * rm[0] / cosAlt,
    -Math.sin(altMoonRad) * rm[1] / cosAlt,
    cosAlt,
  ];

  // Observer's Right in the sky: vRight = rm x vUp
  const vRight = [
    rm[1] * vUp[2] - rm[2] * vUp[1],
    rm[2] * vUp[0] - rm[0] * vUp[2],
    rm[0] * vUp[1] - rm[1] * vUp[0],
  ];

  // Sun direction projected onto the observer's (Right, Up) field of view
  const sunX = rs[0] * vRight[0] + rs[1] * vRight[1] + rs[2] * vRight[2];
  const sunY = rs[0] * vUp[0] + rs[1] * vUp[1] + rs[2] * vUp[2];
  const sunAngleFromZenithDeg = ((Math.atan2(sunX, sunY) * RAD2DEG) % 360 + 360) % 360;

  // North Celestial Pole projected onto observer's (Right, Up) field of view
  // Vector to NCP in horizon coordinates: (0, cos(phi), sin(phi))
  const pNcp = [0, Math.cos(phiRad), Math.sin(phiRad)];
  const poleX = pNcp[0] * vRight[0] + pNcp[1] * vRight[1] + pNcp[2] * vRight[2];
  const poleY = pNcp[0] * vUp[0] + pNcp[1] * vUp[1] + pNcp[2] * vUp[2];
  const poleAngleFromZenithDeg = ((Math.atan2(poleX, poleY) * RAD2DEG) % 360 + 360) % 360;

  // True 3D cosine of elongation between Moon and Sun
  const cosElongation = rm[0] * rs[0] + rm[1] * rs[1] + rm[2] * rs[2];

  return {
    phaseName,
    illuminationPct,
    illuminationFraction,
    illumination: illuminationFraction,
    lunarAgeDays,
    lunarAgeHours,
    lunarAgeMinutes,
    lunarAgeText,
    tiltAngleDeg: sunAngleFromZenithDeg, // Dynamic topocentric bright limb angle relative to Zenith
    parallacticAngleDeg: q,
    equatorialPositionAngleDeg: chi,
    moonAltitude: moonHoriz.altitude,
    moonAzimuth: moonHoriz.azimuth,
    sunAltitude: sunHoriz.altitude,
    sunAzimuth: sunHoriz.azimuth,
    isWaxing,
    elongationDeg: D,
    sunAngleFromZenithDeg,
    poleAngleFromZenithDeg,
    cosElongation,
  };
}
