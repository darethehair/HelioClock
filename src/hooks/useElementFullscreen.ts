import { useState, useEffect, useCallback, RefObject } from 'react';

/**
 * Hook to manage element-level native fullscreen capabilities
 * Calls requestFullscreen() directly on the element ref rather than documentElement.
 */
export function useElementFullscreen(elementRef: RefObject<HTMLElement | null>) {
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [isFallbackFullscreen, setIsFallbackFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as any;
      const activeEl =
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement;
      const isCur = Boolean(elementRef.current && activeEl === elementRef.current);
      setIsNativeFullscreen(isCur);
      if (isCur) {
        setIsFallbackFullscreen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFallbackFullscreen) {
        setIsFallbackFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [elementRef, isFallbackFullscreen]);

  const toggleFullscreen = useCallback(
    async (e?: React.MouseEvent) => {
      if (e) {
        e.stopPropagation();
      }
      const el = elementRef.current as any;
      if (!el) return;

      const doc = document as any;
      const activeEl = doc.fullscreenElement || doc.webkitFullscreenElement;

      // If currently in native fullscreen or fallback fullscreen, exit
      if (activeEl === el || isNativeFullscreen) {
        try {
          if (doc.exitFullscreen) {
            await doc.exitFullscreen();
          } else if (doc.webkitExitFullscreen) {
            await doc.webkitExitFullscreen();
          } else if (doc.mozCancelFullScreen) {
            await doc.mozCancelFullScreen();
          } else if (doc.msExitFullscreen) {
            await doc.msExitFullscreen();
          }
        } catch {
          // ignore error
        }
        setIsNativeFullscreen(false);
        setIsFallbackFullscreen(false);
        return;
      }

      if (isFallbackFullscreen) {
        setIsFallbackFullscreen(false);
        return;
      }

      // Try native requestFullscreen first
      let nativeSucceeded = false;
      try {
        if (el.requestFullscreen) {
          await el.requestFullscreen();
          nativeSucceeded = true;
        } else if (el.webkitRequestFullscreen) {
          await el.webkitRequestFullscreen();
          nativeSucceeded = true;
        } else if (el.mozRequestFullScreen) {
          await el.mozRequestFullScreen();
          nativeSucceeded = true;
        } else if (el.msRequestFullscreen) {
          await el.msRequestFullscreen();
          nativeSucceeded = true;
        }
      } catch {
        nativeSucceeded = false;
      }

      // If native fullscreen was blocked, rejected, or unsupported (e.g. mobile Safari / iframe), engage seamless CSS fallback
      if (!nativeSucceeded) {
        setIsFallbackFullscreen(true);
      }
    },
    [elementRef, isNativeFullscreen, isFallbackFullscreen]
  );

  return { isFullscreen: isNativeFullscreen || isFallbackFullscreen, toggleFullscreen };
}
