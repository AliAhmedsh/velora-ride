import type { RideLocation } from '../types/ride';
import {
  detectNearestCity,
  distanceKm,
  getLandmarksByCategory,
  getLandmarksInCity,
  getNearbyLandmarks,
  searchLandmarks,
  type DestinationOption,
} from '../utils/locations';
import { LANDMARK_CATEGORIES, type LandmarkCategory } from '../data/pakistanLandmarks';
import {
  fetchNearbyPlacesByTypes,
  searchPlaceAutocomplete,
  searchPlacesText,
  type NearbyPlace,
} from '../services/placesService';

export type DestinationCategoryId = 'nearby' | 'popular' | LandmarkCategory;

export type DestinationSection = {
  id: DestinationCategoryId;
  label: string;
  items: DestinationOption[];
};

function toDestination(place: NearbyPlace, prefix: string): DestinationOption {
  return {
    id: place.placeId ?? `${prefix}-${place.latitude}-${place.longitude}`,
    address: place.address,
    latitude: place.latitude,
    longitude: place.longitude,
    category: 'landmark',
    city: undefined,
  };
}

function dedupeOptions(items: DestinationOption[], limit = 50): DestinationOption[] {
  const seen = new Set<string>();
  const out: DestinationOption[] = [];

  for (const item of items) {
    const key = `${item.latitude.toFixed(4)},${item.longitude.toFixed(4)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
    if (out.length >= limit) break;
  }

  return out;
}

export async function buildDestinationCatalog(pickup: RideLocation): Promise<DestinationSection[]> {
  const city = detectNearestCity(pickup);
  let googleNearby: NearbyPlace[] = [];

  try {
    googleNearby = await fetchNearbyPlacesByTypes(pickup.latitude, pickup.longitude);
  } catch {
    googleNearby = [];
  }

  const nearbyLandmarks = getNearbyLandmarks(pickup, 25);
  const googleDestinations = googleNearby.map((p, i) => toDestination(p, `g${i}`));
  const nearbyItems = dedupeOptions([...googleDestinations, ...nearbyLandmarks], 35);

  const popularItems = dedupeOptions([
    ...getLandmarksInCity(city, 20),
    ...getNearbyLandmarks(pickup, 15),
  ], 25);

  const sections: DestinationSection[] = [
    { id: 'nearby', label: 'Nearby you', items: nearbyItems },
    { id: 'popular', label: `Popular in ${city}`, items: popularItems },
  ];

  for (const cat of LANDMARK_CATEGORIES) {
    sections.push({
      id: cat.id,
      label: cat.label,
      items: getLandmarksByCategory(cat.id, pickup, 20),
    });
  }

  return sections;
}

export async function searchDestinations(
  query: string,
  pickup: RideLocation,
): Promise<DestinationOption[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const local = searchLandmarks(trimmed, pickup, 15);
  let google: DestinationOption[] = [];

  try {
    const autocomplete = await searchPlaceAutocomplete(trimmed, pickup.latitude, pickup.longitude);
    google = autocomplete.map((p, i) => toDestination(p, `a${i}`));
  } catch {
    google = [];
  }

  if (google.length < 5) {
    try {
      const text = await searchPlacesText(trimmed, pickup.latitude, pickup.longitude);
      google = dedupeOptions([
        ...google,
        ...text.map((p, i) => toDestination(p, `t${i}`)),
      ], 15);
    } catch {
      // ignore
    }
  }

  return dedupeOptions([...google, ...local], 25);
}

export function getCategoryLabel(id: DestinationCategoryId): string {
  if (id === 'nearby') return 'Nearby';
  if (id === 'popular') return 'Popular';
  const found = LANDMARK_CATEGORIES.find(c => c.id === id);
  return found?.label ?? id;
}
