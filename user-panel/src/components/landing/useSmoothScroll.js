import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

/**
 * Inertial smooth scrolling for the landing page on devices with a fine
 * pointer. Touch devices keep native scrolling (iOS/Android momentum),
 * and reduced-motion users are never opted in.
 */
export function useSmoothScroll() {
  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduced) return undefined;
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95, anchors: { offset: -80 } });
    let id = requestAnimationFrame(function raf(t) {
      lenis.raf(t);
      id = requestAnimationFrame(raf);
    });
    return () => { cancelAnimationFrame(id); lenis.destroy(); };
  }, []);
}
