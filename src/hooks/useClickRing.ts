import { useState, useRef, useCallback } from 'react';

export interface ClickRingData {
  active: boolean;
  anchorX: number;
  anchorY: number;
  radius: number;
  fading: boolean;
}

/**
 * Temporary Interactive Click-Ring Feedback Loop Hook
 * - On pointer down: instantly spawns a thin golden circle (2px stroke, 40% opacity)
 * - On pointer move/drag: smoothly scales radius outwards/inwards to track anchor-to-cursor distance
 * - On pointer up/end: smoothly fades opacity down to 0% over 300ms window
 */
export function useClickRing() {
  const [clickRing, setClickRing] = useState<ClickRingData | null>(null);
  const fadeTimeoutRef = useRef<number | null>(null);

  const startRing = useCallback((x: number, y: number) => {
    if (fadeTimeoutRef.current) {
      window.clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }
    setClickRing({
      active: true,
      anchorX: x,
      anchorY: y,
      radius: 8,
      fading: false,
    });
  }, []);

  const updateRing = useCallback((x: number, y: number) => {
    setClickRing((prev) => {
      if (!prev || !prev.active || prev.fading) return prev;
      const dist = Math.hypot(x - prev.anchorX, y - prev.anchorY);
      return {
        ...prev,
        radius: Math.max(8, dist),
      };
    });
  }, []);

  const endRing = useCallback(() => {
    setClickRing((prev) => {
      if (!prev || !prev.active) return null;
      return {
        ...prev,
        fading: true,
      };
    });

    if (fadeTimeoutRef.current) {
      window.clearTimeout(fadeTimeoutRef.current);
    }
    fadeTimeoutRef.current = window.setTimeout(() => {
      setClickRing(null);
      fadeTimeoutRef.current = null;
    }, 300);
  }, []);

  return {
    clickRing,
    startRing,
    updateRing,
    endRing,
  };
}
