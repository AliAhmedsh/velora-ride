import { useEffect, useState } from 'react';
import type { RideLocation } from '../types/ride';
import {
  buildDestinationCatalog,
  type DestinationCategoryId,
  type DestinationSection,
} from '../services/destinationCatalog';

export function useDestinationCatalog(pickup: RideLocation) {
  const [sections, setSections] = useState<DestinationSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<DestinationCategoryId>('nearby');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setActiveCategory('nearby');

    buildDestinationCatalog(pickup)
      .then(catalog => {
        if (!cancelled) setSections(catalog);
      })
      .catch(() => {
        if (!cancelled) setSections([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pickup.latitude, pickup.longitude]);

  const activeSection = sections.find(s => s.id === activeCategory) ?? sections[0];
  const categories = sections.map(s => ({ id: s.id, label: s.label }));

  return {
    sections,
    categories,
    activeCategory,
    setActiveCategory,
    activeItems: activeSection?.items ?? [],
    loading,
  };
}
