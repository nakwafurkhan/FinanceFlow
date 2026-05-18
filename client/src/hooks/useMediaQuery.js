/**
 * hooks/useMediaQuery.js
 * --------------------------------------------
 * Re-renders on window media-query change.
 *
 * Example:  const isDesktop = useMediaQuery('(min-width: 768px)');
 */

import { useEffect, useState } from 'react';

export default function useMediaQuery(query) {
  const get = () =>
    typeof window !== 'undefined' && window.matchMedia(query).matches;

  const [matches, setMatches] = useState(get);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    // setMatches once on mount in case the query changed before effect ran
    setMatches(mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}
