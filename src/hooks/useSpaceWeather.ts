import { useState, useEffect, useCallback, useRef } from 'react';

export interface KpTrendPoint {
  timeTag: string;
  kp: number;
}

export interface SpaceWeatherRecord {
  kp: number;
  timeTag: string;
  stationCount?: number;
  recentSeries: KpTrendPoint[];
}

export interface SpaceWeatherState {
  kp: number | null;
  timeTag: string | null;
  stationCount: number | null;
  recentSeries: KpTrendPoint[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

const PRIMARY_URL = 'https://services.swpc.noaa.gov/products/planetary-k-index.json';
const FALLBACK_URL = 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json';
const CACHE_KEY = 'helioclock_space_weather_kp_v2';

/**
 * Parser for NOAA SWPC Planetary K-Index JSON payload.
 * Supports both array-of-objects:
 *   [{"time_tag":"2026-10-30T09:00:00","Kp":1.67,"station_count":8}, ...]
 * and array-of-arrays:
 *   [["time_tag", "Kp", "a_running", "station_count"], ["2026-10-30 09:00:00", "1.67", ...]]
 */
function parseNoaaKpData(data: unknown): SpaceWeatherRecord | null {
  if (!Array.isArray(data) || data.length === 0) return null;

  const validPoints: KpTrendPoint[] = [];
  let latestStationCount: number | undefined;

  // Case 1: Array of Arrays (first item is header row)
  if (Array.isArray(data[0])) {
    const headers = data[0].map((h: unknown) => String(h).trim().toLowerCase());
    const kpIdx = headers.findIndex((h: string) => h === 'kp' || h.includes('kp'));
    const timeIdx = headers.findIndex((h: string) => h.includes('time'));
    const stationIdx = headers.findIndex((h: string) => h.includes('station'));

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (Array.isArray(row)) {
        const rawKp = row[kpIdx >= 0 ? kpIdx : 1];
        const val = parseFloat(String(rawKp));
        const rawTime = String(row[timeIdx >= 0 ? timeIdx : 0] || '');
        if (!isNaN(val)) {
          validPoints.push({ kp: val, timeTag: rawTime });
          if (stationIdx >= 0) {
            const sc = parseInt(String(row[stationIdx]), 10);
            if (!isNaN(sc)) latestStationCount = sc;
          }
        }
      }
    }
  } else {
    // Case 2: Array of Objects
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (item && typeof item === 'object') {
        const rawKp =
          (item as Record<string, unknown>).Kp ??
          (item as Record<string, unknown>).kp ??
          (item as Record<string, unknown>).KP;
        const rawTime =
          (item as Record<string, unknown>).time_tag ??
          (item as Record<string, unknown>).timeTag ??
          (item as Record<string, unknown>).time;
        const rawStation =
          (item as Record<string, unknown>).station_count ??
          (item as Record<string, unknown>).stationCount;

        const val = parseFloat(String(rawKp));
        if (!isNaN(val)) {
          validPoints.push({ kp: val, timeTag: String(rawTime || '') });
          if (typeof rawStation === 'number') {
            latestStationCount = rawStation;
          }
        }
      }
    }
  }

  if (validPoints.length === 0) return null;

  const latest = validPoints[validPoints.length - 1];
  // Capture recent 8-10 points (last 24-30 hours of 3-hour Kp periods)
  const recentSeries = validPoints.slice(-8);

  return {
    kp: latest.kp,
    timeTag: latest.timeTag,
    stationCount: latestStationCount,
    recentSeries,
  };
}

export function useSpaceWeather(): SpaceWeatherState {
  const [kp, setKp] = useState<number | null>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (typeof parsed.kp === 'number') return parsed.kp;
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [timeTag, setTimeTag] = useState<string | null>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        return parsed.timeTag || null;
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [stationCount, setStationCount] = useState<number | null>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        return typeof parsed.stationCount === 'number' ? parsed.stationCount : null;
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [recentSeries, setRecentSeries] = useState<KpTrendPoint[]>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed.recentSeries)) return parsed.recentSeries;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const isFetchingRef = useRef(false);

  const fetchKp = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    let rawData: unknown = null;
    let fetchError: Error | null = null;

    // 1. Try Primary requested URL
    try {
      const res = await fetch(PRIMARY_URL, { cache: 'no-cache' });
      if (res.ok) {
        rawData = await res.json();
      } else {
        throw new Error(`Primary endpoint returned HTTP ${res.status}`);
      }
    } catch (e) {
      fetchError = e instanceof Error ? e : new Error(String(e));
    }

    // 2. If primary failed or returned 404, fallback to live NOAA SWPC endpoint
    if (!rawData) {
      try {
        const fallbackRes = await fetch(FALLBACK_URL, { cache: 'no-cache' });
        if (fallbackRes.ok) {
          rawData = await fallbackRes.json();
          fetchError = null;
        } else {
          throw new Error(`Fallback endpoint returned HTTP ${fallbackRes.status}`);
        }
      } catch (e) {
        fetchError = e instanceof Error ? e : new Error(String(e));
      }
    }

    if (rawData) {
      const parsed = parseNoaaKpData(rawData);
      if (parsed) {
        setKp(parsed.kp);
        setTimeTag(parsed.timeTag);
        setStationCount(parsed.stationCount ?? null);
        setRecentSeries(parsed.recentSeries);
        setLastUpdated(new Date());
        setError(null);

        try {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              kp: parsed.kp,
              timeTag: parsed.timeTag,
              stationCount: parsed.stationCount,
              recentSeries: parsed.recentSeries,
              savedAt: Date.now(),
            })
          );
        } catch {
          // ignore storage quota issues
        }
      } else {
        setError('Unexpected NOAA Kp response format');
      }
    } else {
      setError(fetchError?.message || 'Unable to load NOAA space weather data');
    }

    setLoading(false);
    isFetchingRef.current = false;
  }, []);

  useEffect(() => {
    fetchKp();

    // Auto-refresh every 15 minutes when online and active
    const interval = setInterval(() => {
      if (navigator.onLine) {
        fetchKp();
      }
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchKp]);

  return {
    kp,
    timeTag,
    stationCount,
    recentSeries,
    loading,
    error,
    lastUpdated,
    refresh: fetchKp,
  };
}
