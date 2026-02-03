import { useState, useEffect } from 'react';

/**
 * Custom hook to detect screen size
 * @param {string} query - Media query string (e.g., '(min-width: 768px)')
 * @returns {boolean} Whether the media query matches
 */
export const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        // Check if window is defined (SSR safety)
        if (typeof window === 'undefined') {
            return;
        }

        const mediaQuery = window.matchMedia(query);

        // Set initial value
        setMatches(mediaQuery.matches);

        // Create event listener
        const handler = (event) => setMatches(event.matches);

        // Add listener
        mediaQuery.addEventListener('change', handler);

        // Cleanup
        return () => mediaQuery.removeEventListener('change', handler);
    }, [query]);

    return matches;
};
