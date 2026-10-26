import { useState, useEffect, useCallback } from 'react';
import { getSystemTimeZoneOffsetHours } from '../utils/solarCalculator';

export interface GeoLocationState {
  latitude: number;
  longitude: number;
  accuracy: number | null; // in meters
  loading: boolean;
  error: string | null;
  utcOffsetHours: number;
  isLiveGps: boolean;
  timestamp: number | null;
}

// Initial coordinates if GPS permission is pending:
// Dynamically estimated from system timezone without any hardcoded fixed cities
function getInitialEstimatedCoords(): { lat: number; lon: number } {
  try {
    const liveOffsetHours = getSystemTimeZoneOffsetHours();
    // 15 degrees longitude per hour of UTC offset
    const lonEst = liveOffsetHours * 15;
    return { lat: 45.0, lon: lonEst };
  } catch {
    return { lat: 45.0, lon: -90.0 };
  }
}

export function useGeolocation() {
  const initial = getInitialEstimatedCoords();
  const [state, setState] = useState<GeoLocationState>(() => {
    const liveOffset = getSystemTimeZoneOffsetHours();
    const saved = localStorage.getItem('helioclock_last_coords');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.lat === 'number' && typeof parsed.lon === 'number') {
          return {
            latitude: parsed.lat,
            longitude: parsed.lon,
            accuracy: parsed.accuracy || null,
            loading: true,
            error: null,
            utcOffsetHours: liveOffset,
            isLiveGps: !!parsed.isLiveGps,
            timestamp: parsed.timestamp || null,
          };
        }
      } catch {
        // ignore
      }
    }
    return {
      latitude: initial.lat,
      longitude: initial.lon,
      accuracy: null,
      loading: true,
      error: null,
      utcOffsetHours: liveOffset,
      isLiveGps: false,
      timestamp: null,
    };
  });

  const updatePosition = useCallback((pos: GeolocationPosition) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    const accuracy = pos.coords.accuracy;
    const liveOffset = getSystemTimeZoneOffsetHours(pos.timestamp || Date.now());

    setState({
      latitude: lat,
      longitude: lon,
      accuracy,
      loading: false,
      error: null,
      utcOffsetHours: liveOffset,
      isLiveGps: true,
      timestamp: pos.timestamp,
    });

    try {
      localStorage.setItem(
        'helioclock_last_coords',
        JSON.stringify({
          lat,
          lon,
          accuracy,
          isLiveGps: true,
          timestamp: pos.timestamp,
        })
      );
    } catch {
      // ignore
    }
  }, []);

  const handleError = useCallback((err: GeolocationPositionError) => {
    console.warn('Geolocation sensor notification:', err.message);
    setState((prev) => ({
      ...prev,
      loading: false,
      error: err.code === 1 ? 'Location permission not yet granted. Using sensor estimation.' : err.message,
    }));
  }, []);

  const refreshGps = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Geolocation is not supported by your browser',
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      updatePosition,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, [updatePosition, handleError]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Geolocation not supported',
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      updatePosition,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );

    const watchId = navigator.geolocation.watchPosition(
      updatePosition,
      (err) => {
        console.warn('Geolocation continuous watch notification:', err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 30000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [updatePosition, handleError]);

  // Manual coordinate setter for location picker / travel simulation
  const setManualCoordinates = useCallback((lat: number, lon: number) => {
    const liveOffset = getSystemTimeZoneOffsetHours();
    setState({
      latitude: lat,
      longitude: lon,
      accuracy: null,
      loading: false,
      error: null,
      utcOffsetHours: liveOffset,
      isLiveGps: false,
      timestamp: Date.now(),
    });
  }, []);

  return {
    ...state,
    refreshGps,
    setManualCoordinates,
  };
}
