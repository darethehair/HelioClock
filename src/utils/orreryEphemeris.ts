/**
 * Heliocentric Keplerian Orbital Ephemeris Engine
 * Computes 2D top-down heliocentric coordinates (X, Y in Astronomical Units)
 * for the solar system planets based on standard Keplerian orbital elements (JPL/NASA J2000).
 * 
 * Accurately solves Kepler's equation E - e*sin(E) = M via Newton-Raphson iteration
 * for any simulated date scrubbed in the application.
 */

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

export interface PlanetOrbitalElements {
  id: string;
  name: string;
  symbol: string;
  group: 'inner' | 'outer';
  color: string;
  auraColor: string;
  displayRadius: number;
  semiMajorAxis: number; // a in AU
  eccentricity: number; // e
  inclination: number; // I in degrees
  meanLongitude0: number; // L0 in degrees at J2000.0
  meanLongitudeRate: number; // degrees per Julian century
  perihelion0: number; // varpi0 in degrees at J2000.0
  perihelionRate: number; // degrees per Julian century
  orbitalPeriodDays: number; // period in Earth days
  orbitalPeriodText: string;
  avgVelocityKmS: number;
}

export interface PlanetOrbitalState {
  id: string;
  name: string;
  symbol: string;
  group: 'inner' | 'outer';
  color: string;
  auraColor: string;
  displayRadius: number;
  semiMajorAxisAU: number;
  eccentricity: number;
  distanceAU: number; // current distance from Sun in AU
  distanceMillionKm: number; // current distance from Sun in million km
  heliocentricLongitudeDeg: number; // 0° to 360° from Vernal Equinox
  heliocentricX_AU: number; // X in AU (+X = Vernal Equinox direction)
  heliocentricY_AU: number; // Y in AU
  screenX: number; // SVG pixel X
  screenY: number; // SVG pixel Y
  orbitSvgPath: string; // SVG path string for the Keplerian orbital ellipse
  orbitalPeriodText: string;
  avgVelocityKmS: number;
}

export interface PlanetaryAlignment {
  id: string;
  type: 'conjunction' | 'opposition' | 'syzygy';
  planets: PlanetOrbitalState[];
  angularDeltaDeg: number;
  label: string;
  description: string;
}

export interface OrrerySystemState {
  currentDate: Date;
  julianDate: number;
  planets: PlanetOrbitalState[];
  innerPlanets: PlanetOrbitalState[];
  outerPlanets: PlanetOrbitalState[];
  sun: {
    name: string;
    screenX: number;
    screenY: number;
    radius: number;
  };
  earthSunDistanceAU: number;
  earthSunDistanceMillionKm: number;
  equationOfTimeMinutes: number;
  equationOfTimeFormatted: string;
  alignments: PlanetaryAlignment[];
}

/**
 * Standard Keplerian elements at J2000.0 (JD 2451545.0)
 * Note: Pluto is explicitly excluded per user specification.
 */
export const PLANET_ORBITAL_DEFINITIONS: PlanetOrbitalElements[] = [
  // --- INNER PLANETS ---
  {
    id: 'mercury',
    name: 'Mercury',
    symbol: '☿',
    group: 'inner',
    color: '#cbd5e1', // Slate / metallic silver
    auraColor: '#94a3b8',
    displayRadius: 4.5,
    semiMajorAxis: 0.387099,
    eccentricity: 0.205630,
    inclination: 7.005,
    meanLongitude0: 252.2509,
    meanLongitudeRate: 149472.6741,
    perihelion0: 77.4564,
    perihelionRate: 1.5564,
    orbitalPeriodDays: 87.97,
    orbitalPeriodText: '88.0 days',
    avgVelocityKmS: 47.4,
  },
  {
    id: 'venus',
    name: 'Venus',
    symbol: '♀',
    group: 'inner',
    color: '#fef08a', // Warm golden / pale amber
    auraColor: '#fde047',
    displayRadius: 6.2,
    semiMajorAxis: 0.723332,
    eccentricity: 0.006773,
    inclination: 3.3946,
    meanLongitude0: 181.9798,
    meanLongitudeRate: 58517.8157,
    perihelion0: 131.5637,
    perihelionRate: 1.4022,
    orbitalPeriodDays: 224.70,
    orbitalPeriodText: '224.7 days',
    avgVelocityKmS: 35.0,
  },
  {
    id: 'earth',
    name: 'Earth',
    symbol: '⊕',
    group: 'inner',
    color: '#38bdf8', // Vibrant ocean cyan-blue
    auraColor: '#0284c7',
    displayRadius: 6.5,
    semiMajorAxis: 1.000000,
    eccentricity: 0.016709,
    inclination: 0.0000,
    meanLongitude0: 100.4643,
    meanLongitudeRate: 35999.3724,
    perihelion0: 102.9377,
    perihelionRate: 1.0207,
    orbitalPeriodDays: 365.26,
    orbitalPeriodText: '365.25 days (1.00 yr)',
    avgVelocityKmS: 29.8,
  },
  {
    id: 'mars',
    name: 'Mars',
    symbol: '♂',
    group: 'inner',
    color: '#f87171', // Rust red
    auraColor: '#dc2626',
    displayRadius: 5.2,
    semiMajorAxis: 1.523662,
    eccentricity: 0.093412,
    inclination: 1.8497,
    meanLongitude0: 355.4533,
    meanLongitudeRate: 19140.2993,
    perihelion0: 336.0408,
    perihelionRate: 1.8410,
    orbitalPeriodDays: 686.98,
    orbitalPeriodText: '687 days (1.88 yr)',
    avgVelocityKmS: 24.1,
  },

  // --- OUTER PLANETS (EXCLUDING PLUTO) ---
  {
    id: 'jupiter',
    name: 'Jupiter',
    symbol: '♃',
    group: 'outer',
    color: '#fbbf24', // Warm banded amber
    auraColor: '#d97706',
    displayRadius: 10.0,
    semiMajorAxis: 5.203363,
    eccentricity: 0.048393,
    inclination: 1.3053,
    meanLongitude0: 34.4044,
    meanLongitudeRate: 3034.9057,
    perihelion0: 14.7539,
    perihelionRate: 1.6126,
    orbitalPeriodDays: 4332.59,
    orbitalPeriodText: '11.86 years',
    avgVelocityKmS: 13.1,
  },
  {
    id: 'saturn',
    name: 'Saturn',
    symbol: '♄',
    group: 'outer',
    color: '#fde68a', // Creamy pale gold with rings
    auraColor: '#ca8a04',
    displayRadius: 8.5,
    semiMajorAxis: 9.537070,
    eccentricity: 0.054151,
    inclination: 2.4845,
    meanLongitude0: 49.9443,
    meanLongitudeRate: 1222.1138,
    perihelion0: 92.4320,
    perihelionRate: 1.9584,
    orbitalPeriodDays: 10759.22,
    orbitalPeriodText: '29.46 years',
    avgVelocityKmS: 9.7,
  },
  {
    id: 'uranus',
    name: 'Uranus',
    symbol: '♅',
    group: 'outer',
    color: '#67e8f9', // Aquamarine / ice cyan
    auraColor: '#0891b2',
    displayRadius: 7.0,
    semiMajorAxis: 19.191264,
    eccentricity: 0.047168,
    inclination: 0.7699,
    meanLongitude0: 313.2322,
    meanLongitudeRate: 428.4670,
    perihelion0: 170.9642,
    perihelionRate: 1.3106,
    orbitalPeriodDays: 30685.4,
    orbitalPeriodText: '84.02 years',
    avgVelocityKmS: 6.8,
  },
  {
    id: 'neptune',
    name: 'Neptune',
    symbol: '♆',
    group: 'outer',
    color: '#60a5fa', // Deep cobalt / azure blue
    auraColor: '#2563eb',
    displayRadius: 7.0,
    semiMajorAxis: 30.068963,
    eccentricity: 0.008586,
    inclination: 1.7692,
    meanLongitude0: 304.8800,
    meanLongitudeRate: 218.4595,
    perihelion0: 44.9714,
    perihelionRate: 1.4502,
    orbitalPeriodDays: 60189.0,
    orbitalPeriodText: '164.79 years',
    avgVelocityKmS: 5.4,
  },
];

/**
 * Solve Kepler's Equation M = E - e*sin(E) using Newton-Raphson iteration
 */
function solveKepler(M: number, e: number): number {
  let E = M + e * Math.sin(M);
  for (let i = 0; i < 8; i++) {
    const delta = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= delta;
    if (Math.abs(delta) < 1e-9) break;
  }
  return E;
}

/**
 * Calculate the complete top-down Orrery planetary ephemeris for a given simulation Date.
 * 
 * @param date The simulated calendar Date
 * @param center SVG pixel center coordinates { x, y }
 * @param activeGroup 'inner' or 'outer'
 * @param maxRadiusPixels Visual radius of the circular canvas in SVG pixels
 */
export function calculateOrreryEphemeris(
  date: Date,
  center: { x: number; y: number },
  activeGroup: 'inner' | 'outer',
  maxRadiusPixels: number = 220
): OrrerySystemState {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525; // Julian centuries since J2000.0

  // Scaling boundaries for the active group
  // Inner planets: stretched to fill 85% of container space (Mars at 1.52 AU ~ 85.6% of boundary) -> 1.78 AU
  // Outer planets: max extent Neptune aphelion ~30.3 AU -> max scale 33.5 AU
  const maxScaleAU = activeGroup === 'inner' ? 1.78 : 33.5;
  const pxPerAU = maxRadiusPixels / maxScaleAU;

  const planets: PlanetOrbitalState[] = PLANET_ORBITAL_DEFINITIONS.map((def) => {
    // 1. Mean longitude & Perihelion longitude
    const L = ((def.meanLongitude0 + def.meanLongitudeRate * T) % 360 + 360) % 360;
    const varpi = ((def.perihelion0 + def.perihelionRate * T) % 360 + 360) % 360;

    // 2. Mean anomaly M in radians
    const M_deg = ((L - varpi) % 360 + 360) % 360;
    const M_rad = M_deg * DEG2RAD;

    // 3. Solve Kepler equation for Eccentric Anomaly E
    const E_rad = solveKepler(M_rad, def.eccentricity);

    // 4. True anomaly nu
    const sinNu = (Math.sqrt(1 - def.eccentricity * def.eccentricity) * Math.sin(E_rad)) / (1 - def.eccentricity * Math.cos(E_rad));
    const cosNu = (Math.cos(E_rad) - def.eccentricity) / (1 - def.eccentricity * Math.cos(E_rad));
    const nu_rad = Math.atan2(sinNu, cosNu);

    // 5. Heliocentric distance r (in AU)
    const r_AU = def.semiMajorAxis * (1 - def.eccentricity * Math.cos(E_rad));

    // 6. Heliocentric ecliptic longitude lambda
    const lambda_rad = (nu_rad + varpi * DEG2RAD) % (2 * Math.PI);
    const lambda_deg = ((lambda_rad * RAD2DEG) % 360 + 360) % 360;

    // 7. Heliocentric coordinates (AU)
    // +X points to Vernal Equinox (0° Ecliptic), +Y points to 90° Ecliptic
    const X_AU = r_AU * Math.cos(lambda_rad);
    const Y_AU = r_AU * Math.sin(lambda_rad);

    // 8. Screen mapping:
    // Center is (center.x, center.y). Screen Y goes downward, so screenY = center.y - Y_AU * pxPerAU
    const screenX = center.x + X_AU * pxPerAU;
    const screenY = center.y - Y_AU * pxPerAU;

    // 9. Generate SVG Keplerian Orbital Ellipse Path (sample 64 points)
    const ellipsePoints: { x: number; y: number }[] = [];
    const varpi_rad = varpi * DEG2RAD;
    const numSamples = 64;
    for (let i = 0; i <= numSamples; i++) {
      const stepNu = (i / numSamples) * 2 * Math.PI;
      // Keplerian polar equation of an ellipse relative to the focus (Sun):
      // r(nu) = a * (1 - e^2) / (1 + e * cos(nu))
      const sample_r = (def.semiMajorAxis * (1 - def.eccentricity * def.eccentricity)) / (1 + def.eccentricity * Math.cos(stepNu));
      const sample_lambda = stepNu + varpi_rad;
      const sample_x = center.x + sample_r * Math.cos(sample_lambda) * pxPerAU;
      const sample_y = center.y - sample_r * Math.sin(sample_lambda) * pxPerAU;
      ellipsePoints.push({ x: sample_x, y: sample_y });
    }
    const orbitSvgPath = 'M ' + ellipsePoints.map((pt) => `${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' L ') + ' Z';

    return {
      id: def.id,
      name: def.name,
      symbol: def.symbol,
      group: def.group,
      color: def.color,
      auraColor: def.auraColor,
      displayRadius: def.displayRadius,
      semiMajorAxisAU: def.semiMajorAxis,
      eccentricity: def.eccentricity,
      distanceAU: r_AU,
      distanceMillionKm: r_AU * 149.5978707,
      heliocentricLongitudeDeg: lambda_deg,
      heliocentricX_AU: X_AU,
      heliocentricY_AU: Y_AU,
      screenX,
      screenY,
      orbitSvgPath,
      orbitalPeriodText: def.orbitalPeriodText,
      avgVelocityKmS: def.avgVelocityKmS,
    };
  });

  const innerPlanets = planets.filter((p) => p.group === 'inner');
  const outerPlanets = planets.filter((p) => p.group === 'outer');

  // 10. Earth-Sun Distance dynamically computed from Keplerian orbital eccentricity
  const earthPlanet = planets.find((p) => p.id === 'earth');
  const earthSunDistanceAU = earthPlanet ? earthPlanet.distanceAU : 1.0;
  const earthSunDistanceMillionKm = earthSunDistanceAU * 149.5978707;

  // 11. Equation of Time (EoT) in minutes and seconds (Spencer / NOAA algorithm)
  // Computes the active variance between solar time (sundial) and uniform clock time
  const startOfYear = new Date(Date.UTC(date.getFullYear(), 0, 1));
  const dayOfYear = Math.max(1, Math.min(366, Math.floor((date.getTime() - startOfYear.getTime()) / 86400000) + 1));
  const gamma = (2 * Math.PI / 365.242) * (dayOfYear - 1);
  const eqTimeMin = 229.18 * (
    0.000075 +
    0.001868 * Math.cos(gamma) -
    0.032077 * Math.sin(gamma) -
    0.014615 * Math.cos(2 * gamma) -
    0.040849 * Math.sin(2 * gamma)
  );

  const absEoT = Math.abs(eqTimeMin);
  const eotMinutesPart = Math.floor(absEoT);
  const eotSecondsPart = Math.round((absEoT - eotMinutesPart) * 60);
  const eotSign = eqTimeMin >= 0 ? '+' : '-';
  const eotPace = eqTimeMin > 0.1 ? 'Sun fast' : eqTimeMin < -0.1 ? 'Sun slow' : 'clock sync';
  const equationOfTimeFormatted = `${eotSign}${eotMinutesPart}m ${eotSecondsPart.toString().padStart(2, '0')}s (${eotPace})`;

  // 12. Automated inner planet angular alignment detection (conjunctions & syzygies)
  const alignments = detectPlanetaryAlignments(innerPlanets);

  return {
    currentDate: date,
    julianDate: jd,
    planets,
    innerPlanets,
    outerPlanets,
    sun: {
      name: 'Sun (Sol)',
      screenX: center.x,
      screenY: center.y,
      radius: activeGroup === 'inner' ? 14 : 11,
    },
    earthSunDistanceAU,
    earthSunDistanceMillionKm,
    equationOfTimeMinutes: eqTimeMin,
    equationOfTimeFormatted,
    alignments,
  };
}

/**
 * Automated tracking listener for angular alignments of inner planets (Mercury, Venus, Earth, Mars).
 * Detects heliocentric conjunctions (same radial vector from Sun) and oppositions/syzygies
 * (planets positioned directly across the Sun in linear alignment within tolerance threshold).
 */
export function detectPlanetaryAlignments(
  innerPlanets: PlanetOrbitalState[],
  toleranceDeg: number = 4.2
): PlanetaryAlignment[] {
  const alignments: PlanetaryAlignment[] = [];
  const n = innerPlanets.length;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const p1 = innerPlanets[i];
      const p2 = innerPlanets[j];
      const l1 = p1.heliocentricLongitudeDeg;
      const l2 = p2.heliocentricLongitudeDeg;
      let diff = Math.abs(l1 - l2) % 360;
      if (diff > 180) diff = 360 - diff;

      // Heliocentric Conjunction (same side of Sun)
      if (diff <= toleranceDeg) {
        let label = `${p1.name}-${p2.name} Conjunction`;
        if (p1.id === 'earth' || p2.id === 'earth') {
          const other = p1.id === 'earth' ? p2 : p1;
          label = `${other.name}-Sun Conjunction Detected`;
        }
        alignments.push({
          id: `${p1.id}-${p2.id}-conjunction`,
          type: 'conjunction',
          planets: [p1, p2],
          angularDeltaDeg: diff,
          label,
          description: `Linear alignment with the Sun: Δλ = ${diff.toFixed(1)}°`,
        });
      }
      // Heliocentric Opposition / Syzygy (opposite sides of Sun)
      else if (Math.abs(diff - 180) <= toleranceDeg) {
        const oppOffset = Math.abs(diff - 180);
        let label = `${p1.name}-${p2.name} Syzygy`;
        if (p1.id === 'earth' || p2.id === 'earth') {
          const other = p1.id === 'earth' ? p2 : p1;
          if (other.id === 'mars') {
            label = 'Mars-Sun Opposition Detected';
          } else {
            label = `${other.name}-Sun Superior Conjunction Detected`;
          }
        }
        alignments.push({
          id: `${p1.id}-${p2.id}-opposition`,
          type: 'opposition',
          planets: [p1, p2],
          angularDeltaDeg: oppOffset,
          label,
          description: `Linear syzygy through Sun: 180° ± ${oppOffset.toFixed(1)}°`,
        });
      }
    }
  }

  return alignments.sort((a, b) => a.angularDeltaDeg - b.angularDeltaDeg);
}
