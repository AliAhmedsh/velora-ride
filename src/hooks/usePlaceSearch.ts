import { useEffect, useState } from 'react';
import type { RideLocation } from '../types/ride';
import type { DestinationOption } from '../utils/locations';
import { searchDestinations } from '../services/destinationCatalog';

export function usePlaceSearch(query: string, pickup: RideLocation) {
  const [results, setResults] = useState<DestinationOption[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    let cancelled = false;
    setSearching(true);

    const timer = setTimeout(() => {
      searchDestinations(trimmed, pickup)
        .then(items => {
          if (!cancelled) setResults(items);
        })
        .catch(() => {
          if (!cancelled) setResults([]);
        })
        .finally(() => {
          if (!cancelled) setSearching(false);
        });
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, pickup.latitude, pickup.longitude]);

  return { results, searching };
}
