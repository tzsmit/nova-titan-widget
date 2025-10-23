/**
 * useMediaQuery Hook
 * Responsive media query hook for React components
 */

import { useState, useEffect } from 'react';

/**
 * Hook to track media query matches
 * @param query - CSS media query string (e.g., '(max-width: 768px)')
 * @returns boolean indicating if the media query matches
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Handle SSR where window is not available
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);

    // Define the event handler
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add event listener
    mediaQuery.addEventListener('change', handler);

    // Cleanup function
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]);

  return matches;
};

/**
 * Common breakpoint hooks for convenience
 */
export const useBreakpoints = () => {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isLarge = useMediaQuery('(min-width: 1280px)');
  const isXLarge = useMediaQuery('(min-width: 1536px)');

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLarge,
    isXLarge,
    // Composite breakpoints
    isMobileOrTablet: isMobile || isTablet,
    isTabletOrDesktop: isTablet || isDesktop,
  };
};