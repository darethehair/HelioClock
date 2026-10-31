/**
 * Astronomical Solar Calculations Engine with Native Android Time Synchronization
 * Based on NOAA Solar Calculations & Jean Meeus "Astronomical Algorithms".
 * 
 * Computes:
 * - Solar declination, Equation of Time (EoT)
 * - Solar Peak (Transit / Solar Noon)
 * - Solar Nadir (Anti-Transit / Solar Midnight)
 * - Sunrise, Sunset, Civil, Nautical, and Astronomical Twilights
 * - Daylight length
 * - Instantaneous Sun elevation and azimuth
 * - Dynamic system timezone offset synchronizer: java.util.TimeZone.getDefault().getOffset(System.currentTimeMillis())
 */

export interface SolarDayData {
  dayOfYear: number; // 1 to 365
  date: Date;
  dateString: string;
  solarNoon: number; // Decimal hours (0-24)
  solarNadir: number; // Decimal hours (0-24)
  sunrise: number | null; // Decimal hours (null if polar day or night)
  sunset: number | null;
  civilDawn: number | null;
  civilDusk: number | null;
  nauticalDawn: number | null;
  nauticalDusk: number | null;
  astroDawn: number | null;
  astroDusk: number | null;
  daylightHours: number; // 0 to 24
  goldenHourMorningStart: number | null; // Sunrise
  goldenHourMorningEnd: number | null;   // Morning +6°
  goldenHourEveningStart: number | null; // Evening +6°
  goldenHourEveningEnd: number | null;   // Sunset
  declinationDeg: number;
  equationOfTimeMin: number;
  isPolarDay: boolean;
  isPolarNight: boolean;
}

export interface CurrentSolarPosition {
  elevationDeg: number;
  azimuthDeg: number;
  currentStandardHour: number; // Decimal hours in active local system time (0-24)
  solarNoon: number;
  solarNadir: number;
  sunrise: number | null;
  sunset: number | null;
  daylightHours: number;
  daylightProgress: number; // 0 to 1
  isDaytime: boolean;
  isGoldenHour: boolean; // Elevation between -0.8333° (or 0°) and +6.0°
  twilightState: 'night' | 'astronomical' | 'nautical' | 'civil' | 'daylight';
}

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

/**
 * Native Android Time Synchronization
 * Equivalent to Kotlin/Java:
 * java.util.TimeZone.getDefault().getOffset(System.currentTimeMillis())
 * 
 * In the JavaScript / Web environment on Android devices,
 * -new Date(epochMillis).getTimezoneOffset() * 60 * 1000
 * directly queries the host OS and returns the exact system timezone offset in milliseconds,
 * eliminating all hardcoded CST / UTC-6 assumptions.
 */
export function getSystemTimeZoneOffsetMs(epochMillis: number = Date.now()): number {
  return -new Date(epochMillis).getTimezoneOffset() * 60 * 1000;
}

/**
 * Returns dynamic system timezone offset in decimal hours.
 * Derived directly from java.util.TimeZone.getDefault().getOffset(System.currentTimeMillis())
 */
export function getSystemTimeZoneOffsetHours(epochMillis: number = Date.now()): number {
  return getSystemTimeZoneOffsetMs(epochMillis) / (3600 * 1000);
}

/**
 * Returns the system timezone identifier (e.g. 'America/Chicago', 'America/New_York')
 */
export function getSystemTimeZoneId(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'System Local';
  } catch {
    return 'System Local';
  }
}

/**
 * Formats dynamic UTC offset into clean notation, e.g.:
 * -6 -> "-6"
 * -5 -> "-5"
 * -7 -> "-7"
 * +2 -> "+2"
 * +5.5 -> "+5:30"
 * 0 -> "+0"
 */
export function formatUtcOffset(offsetHours: number): string {
  const sign = offsetHours >= 0 ? '+' : '-';
  const absHours = Math.abs(offsetHours);
  const h = Math.floor(absHours);
  const m = Math.round((absHours - h) * 60);
  if (m === 0) {
    return `${sign}${h}`;
  }
  return `${sign}${h}:${m.toString().padStart(2, '0')}`;
}

/**
 * Converts decimal hours (e.g. 6.75) to formatted HH:MM:SS or HH:MM
 */
export function formatHours(hours: number | null, includeSeconds = false): string {
  if (hours === null || isNaN(hours)) return '--:--';
  const totalSeconds = Math.round(((hours % 24 + 24) % 24) * 3600);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  if (includeSeconds) {
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }
  return `${pad(h)}:${pad(m)}`;
}

/**
 * Formats duration in hours (e.g. 11.45) to "11h 27m"
 */
export function formatDuration(hours: number): string {
  if (isNaN(hours) || hours < 0) return '0h 00m';
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

/**
 * Formats duration with seconds: "11h 27m 14s"
 */
export function formatDurationPrecise(hours: number): string {
  if (isNaN(hours) || hours < 0) return '0h 00m 00s';
  const totalSeconds = Math.round(hours * 3600);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
}

/**
 * Formats day-over-day daylight delta in seconds to clean user-facing string:
 * e.g., -214 -> "-3m 34s today"
 *       +135 -> "+2m 15s today"
 *          0 -> "0s today"
 */
export function formatDaylightDelta(deltaSeconds: number): string {
  if (isNaN(deltaSeconds)) return '0s today';
  const sign = deltaSeconds > 0 ? '+' : deltaSeconds < 0 ? '-' : '';
  const absSec = Math.abs(deltaSeconds);
  const m = Math.floor(absSec / 60);
  const s = absSec % 60;
  if (m === 0) {
    return `${sign || ''}${s}s today`;
  }
  return `${sign}${m}m ${s.toString().padStart(2, '0')}s today`;
}

/**
 * Calculates solar parameters for a specific day of the year (1-365)
 * using the dynamic live system timezone offset.
 */
export function calculateSolarDay(
  dayOfYear: number,
  latitude: number,
  longitude: number,
  utcOffsetHours: number,
  year = new Date().getFullYear()
): SolarDayData {
  // Fractional year in radians
  const gamma = (2 * Math.PI / 365) * (dayOfYear - 1);

  // Equation of Time in minutes (Spencer 1971 / NOAA)
  const eqTimeMin = 229.18 * (
    0.000075 +
    0.001868 * Math.cos(gamma) -
    0.032077 * Math.sin(gamma) -
    0.014615 * Math.cos(2 * gamma) -
    0.040849 * Math.sin(2 * gamma)
  );

  // Solar declination in radians
  const declRad = 0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  const declDeg = declRad * RAD2DEG;
  const latRad = latitude * DEG2RAD;

  // Solar Noon (Transit) dynamically scaled using the live system-provided offset:
  // Local Solar Noon = 12:00 - (lon / 15) - (EoT / 60) + utcOffsetHours
  const solarNoon = 12 - (longitude / 15) - (eqTimeMin / 60) + utcOffsetHours;
  // Normalize solarNoon between 0 and 24
  const normalizedNoon = ((solarNoon % 24) + 24) % 24;

  // Solar Nadir (Anti-Transit / Solar Midnight)
  const normalizedNadir = (normalizedNoon + 12) % 24;

  // Function to calculate rise and set time for a target solar altitude angle
  function calculateSunTimesForAltitude(targetAltDeg: number): { rise: number | null; set: number | null; durationHours: number } {
    const targetAltRad = targetAltDeg * DEG2RAD;
    const cosH0 = (Math.sin(targetAltRad) - Math.sin(latRad) * Math.sin(declRad)) /
                  (Math.cos(latRad) * Math.cos(declRad));

    if (cosH0 > 1) {
      // Sun never reaches this altitude (always below)
      return { rise: null, set: null, durationHours: 0 };
    }
    if (cosH0 < -1) {
      // Sun never sets below this altitude (always above)
      return { rise: null, set: null, durationHours: 24 };
    }

    const h0Rad = Math.acos(cosH0);
    const halfDurationHours = (h0Rad * RAD2DEG) / 15;

    let rise = normalizedNoon - halfDurationHours;
    let set = normalizedNoon + halfDurationHours;

    return {
      rise,
      set,
      durationHours: halfDurationHours * 2,
    };
  }

  // Official Sunrise/Sunset: altitude = -0.8333° (atmospheric refraction + solar disk radius)
  const daylight = calculateSunTimesForAltitude(-0.8333);
  // Civil Twilight: altitude = -6°
  const civil = calculateSunTimesForAltitude(-6.0);
  // Nautical Twilight: altitude = -12°
  const nautical = calculateSunTimesForAltitude(-12.0);
  // Astronomical Twilight: altitude = -18°
  const astro = calculateSunTimesForAltitude(-18.0);

  const isPolarDay = daylight.durationHours >= 24;
  const isPolarNight = daylight.durationHours <= 0;

  // Golden Hour Threshold: altitude = +6.0°
  const goldenHourThreshold = calculateSunTimesForAltitude(6.0);
  let ghMorningStart: number | null = daylight.rise;
  let ghMorningEnd: number | null = goldenHourThreshold.rise;
  let ghEveningStart: number | null = goldenHourThreshold.set;
  let ghEveningEnd: number | null = daylight.set;

  if (isPolarNight) {
    ghMorningStart = null;
    ghMorningEnd = null;
    ghEveningStart = null;
    ghEveningEnd = null;
  } else if (goldenHourThreshold.durationHours <= 0) {
    // Sun rises above horizon but never exceeds +6°: entire daylight is Golden Hour
    ghMorningStart = daylight.rise;
    ghMorningEnd = daylight.set !== null && daylight.rise !== null ? (daylight.rise + daylight.set) / 2 : normalizedNoon;
    ghEveningStart = ghMorningEnd;
    ghEveningEnd = daylight.set;
  } else if (goldenHourThreshold.durationHours >= 24) {
    // Sun never drops below +6° (continuous high sun)
    ghMorningStart = null;
    ghMorningEnd = null;
    ghEveningStart = null;
    ghEveningEnd = null;
  }

  // Construct readable date
  const dateObj = new Date(year, 0, dayOfYear);
  const dateString = dateObj.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return {
    dayOfYear,
    date: dateObj,
    dateString,
    solarNoon: normalizedNoon,
    solarNadir: normalizedNadir,
    sunrise: daylight.rise,
    sunset: daylight.set,
    civilDawn: civil.rise,
    civilDusk: civil.set,
    nauticalDawn: nautical.rise,
    nauticalDusk: nautical.set,
    astroDawn: astro.rise,
    astroDusk: astro.set,
    daylightHours: daylight.durationHours,
    goldenHourMorningStart: ghMorningStart,
    goldenHourMorningEnd: ghMorningEnd,
    goldenHourEveningStart: ghEveningStart,
    goldenHourEveningEnd: ghEveningEnd,
    declinationDeg: declDeg,
    equationOfTimeMin: eqTimeMin,
    isPolarDay,
    isPolarNight,
  };
}

/**
 * Calculates day-over-day daylight duration delta in seconds for a specific day.
 * Positive = gaining daylight, negative = losing daylight.
 */
export function calculateDaylightDeltaSeconds(
  dayOfYear: number,
  latitude: number,
  longitude: number,
  utcOffsetHours: number,
  year = new Date().getFullYear()
): number {
  const today = calculateSolarDay(dayOfYear, latitude, longitude, utcOffsetHours, year);
  const prevDay = dayOfYear > 1 ? dayOfYear - 1 : 365;
  const prevYear = dayOfYear > 1 ? year : year - 1;
  const yesterday = calculateSolarDay(prevDay, latitude, longitude, utcOffsetHours, prevYear);
  return Math.round((today.daylightHours - yesterday.daylightHours) * 3600);
}

/**
 * Computes the full 365-day ephemeris dynamically scaled with the system timezone offset.
 */
export function calculateYearEphemeris(
  latitude: number,
  longitude: number,
  utcOffsetHours: number,
  year = new Date().getFullYear()
): {
  days: SolarDayData[];
  minDaylight: number;
  maxDaylight: number;
  solsticeWinterDay: number;
  solsticeSummerDay: number;
} {
  const days: SolarDayData[] = [];
  let minDaylight = 24;
  let maxDaylight = 0;
  let solsticeWinterDay = 1;
  let solsticeSummerDay = 172;

  for (let d = 1; d <= 365; d++) {
    const data = calculateSolarDay(d, latitude, longitude, utcOffsetHours, year);
    days.push(data);

    if (data.daylightHours < minDaylight) {
      minDaylight = data.daylightHours;
      solsticeWinterDay = d;
    }
    if (data.daylightHours > maxDaylight) {
      maxDaylight = data.daylightHours;
      solsticeSummerDay = d;
    }
  }

  return {
    days,
    minDaylight,
    maxDaylight,
    solsticeWinterDay,
    solsticeSummerDay,
  };
}

/**
 * Calculate instantaneous Sun Elevation and Azimuth for real-time tracking
 * using live system-provided millisecond offset.
 */
export function calculateRealTimeSunPosition(
  date: Date,
  latitude: number,
  longitude: number,
  utcOffsetHours: number
): CurrentSolarPosition {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diffMs = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.min(365, Math.max(1, Math.floor(diffMs / (24 * 3600 * 1000)) + 1));

  // Current time in UTC decimal hours
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  // Current time in local system hours dynamically synchronized with system offset
  const currentStandardHour = ((utcHours + utcOffsetHours) % 24 + 24) % 24;

  const dayData = calculateSolarDay(dayOfYear, latitude, longitude, utcOffsetHours, date.getFullYear());

  // Solar Hour Angle in degrees
  // 15° per hour from solar noon
  let hourDiff = currentStandardHour - dayData.solarNoon;
  if (hourDiff > 12) hourDiff -= 24;
  if (hourDiff < -12) hourDiff += 24;
  const hourAngleRad = hourDiff * 15 * DEG2RAD;

  const latRad = latitude * DEG2RAD;
  const declRad = dayData.declinationDeg * DEG2RAD;

  // Solar Altitude (Elevation)
  const sinAlt = Math.sin(latRad) * Math.sin(declRad) +
                 Math.cos(latRad) * Math.cos(declRad) * Math.cos(hourAngleRad);
  const elevationRad = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
  const elevationDeg = elevationRad * RAD2DEG;

  // Solar Azimuth (measured from North clockwise: 0° N, 90° E, 180° S, 270° W)
  const cosAz = (Math.sin(declRad) - Math.sin(latRad) * Math.sin(elevationRad)) /
                (Math.cos(latRad) * Math.cos(elevationRad));
  const clampedCosAz = Math.max(-1, Math.min(1, cosAz));
  let azimuthDeg = Math.acos(clampedCosAz) * RAD2DEG;
  if (Math.sin(hourAngleRad) > 0) {
    azimuthDeg = 360 - azimuthDeg;
  }

  // Daylight progress
  let daylightProgress = 0;
  let isDaytime = false;
  if (dayData.sunrise !== null && dayData.sunset !== null) {
    if (currentStandardHour >= dayData.sunrise && currentStandardHour <= dayData.sunset) {
      isDaytime = true;
      daylightProgress = (currentStandardHour - dayData.sunrise) / Math.max(0.1, dayData.sunset - dayData.sunrise);
    }
  } else if (dayData.isPolarDay) {
    isDaytime = true;
    daylightProgress = currentStandardHour / 24;
  }

  // Twilight state
  let twilightState: 'night' | 'astronomical' | 'nautical' | 'civil' | 'daylight' = 'night';
  if (elevationDeg >= -0.8333) {
    twilightState = 'daylight';
  } else if (elevationDeg >= -6) {
    twilightState = 'civil';
  } else if (elevationDeg >= -12) {
    twilightState = 'nautical';
  } else if (elevationDeg >= -18) {
    twilightState = 'astronomical';
  } else {
    twilightState = 'night';
  }

  return {
    elevationDeg,
    azimuthDeg,
    currentStandardHour,
    solarNoon: dayData.solarNoon,
    solarNadir: dayData.solarNadir,
    sunrise: dayData.sunrise,
    sunset: dayData.sunset,
    daylightHours: dayData.daylightHours,
    daylightProgress: Math.max(0, Math.min(1, daylightProgress)),
    isDaytime,
    isGoldenHour: elevationDeg >= -0.8333 && elevationDeg <= 6.0,
    twilightState,
  };
}

export interface SubsolarPoint {
  latitude: number; // in degrees [-90, 90]
  longitude: number; // in degrees [-180, 180]
  antipodalLatitude: number;
  antipodalLongitude: number;
  declinationDeg: number;
  equationOfTimeMin: number;
}

/**
 * Calculates the exact instantaneous Subsolar Point (where the Sun is directly at the zenith, 90° altitude)
 * and its antipodal point for astronomical shadow projections.
 */
export function calculateSubsolarPoint(date: Date = new Date()): SubsolarPoint {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diffMs = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.min(365, Math.max(1, Math.floor(diffMs / (24 * 3600 * 1000)) + 1));

  // Current UTC decimal hours
  const utcDecimalHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;

  // Fractional year in radians
  const gamma = (2 * Math.PI / 365) * (dayOfYear - 1 + (utcDecimalHours - 12) / 24);

  // Equation of Time in minutes (Spencer 1971 / NOAA)
  const eqTimeMin = 229.18 * (
    0.000075 +
    0.001868 * Math.cos(gamma) -
    0.032077 * Math.sin(gamma) -
    0.014615 * Math.cos(2 * gamma) -
    0.040849 * Math.sin(2 * gamma)
  );

  // Solar declination in radians
  const declRad = 0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  const declinationDeg = declRad * (180 / Math.PI);

  // Subsolar longitude in degrees
  // At solar noon at Greenwich (12 - EoT/60 UTC), longitude is 0°
  let subsolarLon = (- (utcDecimalHours - 12) * 15 - eqTimeMin / 4);
  subsolarLon = ((subsolarLon % 360) + 540) % 360 - 180;

  const subsolarLat = declinationDeg;

  // Antipodal point (center of the night hemisphere)
  const antipodalLat = -subsolarLat;
  let antipodalLon = subsolarLon > 0 ? subsolarLon - 180 : subsolarLon + 180;

  return {
    latitude: subsolarLat,
    longitude: subsolarLon,
    antipodalLatitude: antipodalLat,
    antipodalLongitude: antipodalLon,
    declinationDeg,
    equationOfTimeMin: eqTimeMin,
  };
}
