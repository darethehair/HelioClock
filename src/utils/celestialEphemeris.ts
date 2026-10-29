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
  points: { az: number; alt: number }[];
  svgPath: string;
}

export interface ConstellationLineSegment {
  constellation: string;
  svgPath: string;
}

export interface PlanetTrajectoryData {
  id: 'venus' | 'mars' | 'jupiter' | 'saturn';
  name: string;
  color: string;
  symbol: string;
  points: { az: number; alt: number }[];
  segments: TrajectorySegment[];
}

export interface CelestialEphemerisData {
  sun: CelestialPoint;
  moon: CelestialPoint & { phaseName: string; illuminationFraction: number };
  stars: CelestialPoint[];
  planets: CelestialPoint[];
  sunTrajectory: TrajectorySegment[];
  moonTrajectory: TrajectorySegment[];
  planetTrajectories: PlanetTrajectoryData[];
  constellationLines: ConstellationLineSegment[];
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
 * Major stars catalog with true astronomical apparent magnitude (J2000 RA & Dec)
 */
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

export const MAJOR_STARS: StarCatalogDef[] = [
  // Primary Bright Stars (Mag < 1.0)
  { id: 'sirius', name: 'Sirius', ra: 101.287, dec: -16.716, mag: -1.46, color: '#93c5fd', constellation: 'Canis Major', isAnchor: true },
  { id: 'canopus', name: 'Canopus', ra: 95.988, dec: -52.696, mag: -0.74, color: '#ffffff', constellation: 'Carina', isAnchor: true },
  { id: 'arcturus', name: 'Arcturus', ra: 213.915, dec: 19.182, mag: -0.05, color: '#fed7aa', constellation: 'Boötes', isAnchor: true },
  { id: 'vega', name: 'Vega', ra: 279.234, dec: 38.784, mag: 0.03, color: '#e0f2fe', constellation: 'Lyra', isAnchor: true },
  { id: 'capella', name: 'Capella', ra: 79.172, dec: 45.998, mag: 0.08, color: '#fef08a', constellation: 'Auriga', isAnchor: true },
  { id: 'rigel', name: 'Rigel', ra: 78.634, dec: -8.202, mag: 0.13, color: '#67e8f9', constellation: 'Orion', isAnchor: true },
  { id: 'procyon', name: 'Procyon', ra: 114.825, dec: 5.225, mag: 0.34, color: '#f8fafc', constellation: 'Canis Minor', isAnchor: true },
  { id: 'betelgeuse', name: 'Betelgeuse', ra: 88.793, dec: 7.407, mag: 0.50, color: '#fb923c', constellation: 'Orion', isAnchor: true },
  { id: 'altair', name: 'Altair', ra: 297.696, dec: 8.868, mag: 0.77, color: '#f1f5f9', constellation: 'Aquila', isAnchor: true },
  { id: 'aldebaran', name: 'Aldebaran', ra: 68.980, dec: 16.509, mag: 0.85, color: '#fb923c', constellation: 'Taurus', isAnchor: true },
  { id: 'spica', name: 'Spica', ra: 201.298, dec: -11.161, mag: 0.98, color: '#7dd3fc', constellation: 'Virgo', isAnchor: true },

  // Prominent Stars (1.0 < Mag < 2.0)
  { id: 'antares', name: 'Antares', ra: 247.352, dec: -26.432, mag: 1.06, color: '#f87171', constellation: 'Scorpius', isAnchor: true },
  { id: 'pollux', name: 'Pollux', ra: 116.329, dec: 28.026, mag: 1.14, color: '#fed7aa', constellation: 'Gemini', isAnchor: true },
  { id: 'deneb', name: 'Deneb', ra: 310.358, dec: 45.280, mag: 1.25, color: '#e0f2fe', constellation: 'Cygnus', isAnchor: true },
  { id: 'regulus', name: 'Regulus', ra: 152.093, dec: 11.967, mag: 1.36, color: '#93c5fd', constellation: 'Leo', isAnchor: true },
  { id: 'castor', name: 'Castor', ra: 113.650, dec: 31.888, mag: 1.58, color: '#e2e8f0', constellation: 'Gemini', isAnchor: true },
  { id: 'bellatrix', name: 'Bellatrix', ra: 81.283, dec: 6.350, mag: 1.64, color: '#93c5fd', constellation: 'Orion', isAnchor: true },
  { id: 'alnilam', name: 'Alnilam', ra: 84.053, dec: -1.202, mag: 1.69, color: '#93c5fd', constellation: 'Orion', isAnchor: true },
  { id: 'alioth', name: 'Alioth', ra: 193.507, dec: 55.960, mag: 1.77, color: '#f8fafc', constellation: 'Ursa Major', isAnchor: true },
  { id: 'dubhe', name: 'Dubhe', ra: 165.932, dec: 61.751, mag: 1.79, color: '#fde047', constellation: 'Ursa Major', isAnchor: true },
  { id: 'alkaid', name: 'Alkaid', ra: 206.885, dec: 49.313, mag: 1.86, color: '#93c5fd', constellation: 'Ursa Major', isAnchor: true },
  { id: 'polaris', name: 'Polaris', ra: 37.955, dec: 89.264, mag: 1.98, color: '#fef9c3', constellation: 'Ursa Minor', isAnchor: true },

  // Constellation Anchor & Fainter Stars (Mag 2.0 - 3.4)
  { id: 'saiph', name: 'Saiph', ra: 86.939, dec: -9.670, mag: 2.07, color: '#93c5fd', constellation: 'Orion', isAnchor: true },
  { id: 'mizar', name: 'Mizar', ra: 200.981, dec: 54.925, mag: 2.23, color: '#f8fafc', constellation: 'Ursa Major', isAnchor: true },
  { id: 'shedar', name: 'Shedar', ra: 10.127, dec: 56.537, mag: 2.24, color: '#fed7aa', constellation: 'Cassiopeia', isAnchor: true },
  { id: 'caph', name: 'Caph', ra: 2.295, dec: 59.150, mag: 2.28, color: '#f8fafc', constellation: 'Cassiopeia', isAnchor: true },
  { id: 'merak', name: 'Merak', ra: 165.460, dec: 56.382, mag: 2.37, color: '#f8fafc', constellation: 'Ursa Major', isAnchor: true },
  { id: 'phecda', name: 'Phecda', ra: 178.458, dec: 53.695, mag: 2.44, color: '#f8fafc', constellation: 'Ursa Major', isAnchor: true },
  { id: 'navi', name: 'Navi', ra: 14.177, dec: 60.717, mag: 2.47, color: '#7dd3fc', constellation: 'Cassiopeia', isAnchor: true },
  { id: 'ruchbah', name: 'Ruchbah', ra: 20.201, dec: 60.235, mag: 2.68, color: '#f8fafc', constellation: 'Cassiopeia', isAnchor: true },
  { id: 'megrez', name: 'Megrez', ra: 183.857, dec: 57.032, mag: 3.32, color: '#94a3b8', constellation: 'Ursa Major', isAnchor: true },
  { id: 'segin', name: 'Segin', ra: 26.654, dec: 63.670, mag: 3.37, color: '#93c5fd', constellation: 'Cassiopeia', isAnchor: true },
];

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
 * Low-precision planetary equatorial coordinates (Jean Meeus approximations)
 */
function getPlanetEquatorial(planet: 'mars' | 'jupiter' | 'venus' | 'saturn', jd: number): { ra: number; dec: number; mag: number } {
  const d = jd - 2451545.0;

  // Mean orbital longitudes & elements
  let L = 0;
  let a = 1.0;
  let mag = 0;

  switch (planet) {
    case 'venus':
      L = ((181.979 + 1.602130 * d) % 360 + 360) % 360;
      a = 0.7233;
      mag = -4.1;
      break;
    case 'mars':
      L = ((355.433 + 0.524033 * d) % 360 + 360) % 360;
      a = 1.5237;
      mag = 0.4;
      break;
    case 'jupiter':
      L = ((34.351 + 0.083085 * d) % 360 + 360) % 360;
      a = 5.2026;
      mag = -2.2;
      break;
    case 'saturn':
      L = ((50.077 + 0.033444 * d) % 360 + 360) % 360;
      a = 9.5547;
      mag = 0.6;
      break;
  }

  // Earth's heliocentric position
  const Ls = ((280.460 + 0.985647 * d) % 360 + 360) % 360;
  const xe = Math.cos(Ls * DEG2RAD);
  const ye = Math.sin(Ls * DEG2RAD);

  // Heliocentric planet coordinates (circular approximation)
  const xp = a * Math.cos(L * DEG2RAD);
  const yp = a * Math.sin(L * DEG2RAD);

  // Geocentric coordinates
  const xg = xp - xe;
  const yg = yp - ye;
  const geoLon = ((Math.atan2(yg, xg) * RAD2DEG) % 360 + 360) % 360;

  const e = 23.439 - 0.00000036 * d;
  const eRad = e * DEG2RAD;
  const geoLonRad = geoLon * DEG2RAD;

  const sinDec = Math.sin(eRad) * Math.sin(geoLonRad);
  const dec = Math.asin(sinDec) * RAD2DEG;
  const y = Math.cos(eRad) * Math.sin(geoLonRad);
  const x = Math.cos(geoLonRad);
  const ra = ((Math.atan2(y, x) * RAD2DEG) % 360 + 360) % 360;

  return { ra, dec, mag };
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
 * Builds trajectory SVG segments filtered strictly to visible arcs above the 0° True Horizon line (alt >= 0)
 */
export function buildAboveHorizonTrajectorySvgSegments(
  points: { az: number; alt: number }[],
  projectCoord: (az: number, alt: number) => { x: number; y: number }
): TrajectorySegment[] {
  if (points.length < 2) return [];

  const segments: TrajectorySegment[] = [];
  let currentSegment: { az: number; alt: number }[] = [];

  for (let i = 0; i < points.length; i++) {
    const curr = points[i];
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
      // Detect azimuth wrap-around (e.g. from 359° to 1° or vice versa)
      if (Math.abs(curr.az - prev.az) > 180) {
        if (currentSegment.length > 1) {
          segments.push({
            points: currentSegment,
            svgPath: formatSvgPath(currentSegment, projectCoord),
          });
        }
        currentSegment = [curr];
        continue;
      }
    }
    currentSegment.push(curr);
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
  points: { az: number; alt: number }[],
  projectCoord: (az: number, alt: number) => { x: number; y: number }
): string {
  if (points.length === 0) return '';
  const first = projectCoord(points[0].az, points[0].alt);
  let d = `M ${first.x.toFixed(2)} ${first.y.toFixed(2)}`;

  for (let i = 1; i < points.length; i++) {
    const pt = projectCoord(points[i].az, points[i].alt);
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
  projectCoord: (az: number, alt: number) => { x: number; y: number }
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

  // 2. Current Moon
  const moonEq = getMoonEquatorial(jd);
  const moonHoriz = equatorialToHorizontal(moonEq.ra, moonEq.dec, latitude, lst);
  const moon: CelestialPoint & { phaseName: string; illuminationFraction: number } = {
    id: 'moon',
    name: 'Moon',
    type: 'moon',
    azimuth: moonHoriz.azimuth,
    altitude: moonHoriz.altitude,
    color: '#e2e8f0',
    symbol: '🌙',
    phaseName: moonEq.phaseName,
    illuminationFraction: moonEq.illumination,
    extraInfo: `${moonEq.phaseName} (${Math.round(moonEq.illumination * 100)}%) · Alt ${moonHoriz.altitude >= 0 ? '+' : ''}${moonHoriz.altitude.toFixed(1)}°`,
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

  // 4. Visible Planets (Mars, Jupiter, Venus, Saturn) - STRICTLY INDIVIDUAL POINT MARKERS, ZERO PATHS
  const planetDefs: { id: 'venus' | 'mars' | 'jupiter' | 'saturn'; name: string; color: string; symbol: string }[] = [
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
      extraInfo: `Mag ${eq.mag.toFixed(1)} · Alt ${horiz.altitude >= 0 ? '+' : ''}${horiz.altitude.toFixed(1)}°`,
    };
  });

  // 5. Sun, Moon & Planet 24-Hour Diurnal Trajectory Arcs above 0° True Horizon
  const sunArcPoints: { az: number; alt: number }[] = [];
  const moonArcPoints: { az: number; alt: number }[] = [];
  const planetArcPoints: Record<'venus' | 'mars' | 'jupiter' | 'saturn', { az: number; alt: number }[]> = {
    venus: [],
    mars: [],
    jupiter: [],
    saturn: [],
  };

  const baseDay = new Date(date);
  baseDay.setHours(0, 0, 0, 0);
  const baseTime = baseDay.getTime();

  // Sample every 12 minutes (120 points over 24 hours) for a butter-smooth diurnal curve
  for (let i = 0; i <= 120; i++) {
    const sampleDate = new Date(baseTime + (i * 12) * 60 * 1000);
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

    // Visible Planets diurnal points (Venus, Mars, Jupiter, Saturn)
    for (const p of planetDefs) {
      const pEq = getPlanetEquatorial(p.id, sampleJd);
      const pHoriz = equatorialToHorizontal(pEq.ra, pEq.dec, latitude, sampleLst);
      planetArcPoints[p.id].push({
        az: pHoriz.azimuth,
        alt: pHoriz.altitude,
      });
    }
  }

  // Generate trajectory segments strictly for visible diurnal arcs above 0° True Horizon
  const sunTrajectory = buildAboveHorizonTrajectorySvgSegments(sunArcPoints, projectCoord);
  const moonTrajectory = buildAboveHorizonTrajectorySvgSegments(moonArcPoints, projectCoord);

  // Dynamic Planet Trajectories (Venus, Mars, Jupiter, Saturn)
  const planetTrajectories: PlanetTrajectoryData[] = planetDefs.map((p) => ({
    id: p.id,
    name: p.name,
    color: p.color,
    symbol: p.symbol,
    points: planetArcPoints[p.id],
    segments: buildAboveHorizonTrajectorySvgSegments(planetArcPoints[p.id], projectCoord),
  }));

  // 7. Constellation Stick-Figure Connection Lines
  const constellationLines: ConstellationLineSegment[] = [];
  const starMap = new Map<string, CelestialPoint>();
  stars.forEach((s) => starMap.set(s.id, s));

  for (const group of CONSTELLATION_LINES) {
    for (const [idA, idB] of group.pairs) {
      const starA = starMap.get(idA);
      const starB = starMap.get(idB);
      if (!starA || !starB) continue;

      // Avoid wrapping artifact if line spans across the 0°/360° meridian seam
      const azDiff = Math.abs(starA.azimuth - starB.azimuth);
      if (azDiff > 180) continue;

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
    constellationLines,
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
