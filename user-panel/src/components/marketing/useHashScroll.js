import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls to the element named in the URL hash once the page has mounted.
 * Needed because lazily-loaded pages may not exist yet when the layout's
 * own hash handler runs.
 */
export function useHashScroll() {
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return undefined;
    const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 80);
    return () => clearTimeout(t);
  }, [hash]);
}
