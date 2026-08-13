import type { RideLocation } from '../types/ride';
import {
  PAKISTAN_LANDMARKS,
  PAKISTAN_CITIES,
  type LandmarkCategory,
  type DestinationOption,
} from '../data/pakistanLandmarks';

export type { LandmarkCategory, DestinationOption };

export const ISLAMABAD_CENTER: RideLocation = {
  latitude: 33.6844,
  longitude: 73.0479,
  address: 'Islamabad City Center',
};

export const PAKISTAN_BOUNDS = {
  minLat: 23.5,
  maxLat: 37.5,
  minLng: 60.5,
  maxLng: 77.5,
};

export const LOCAL_MAX_DISTANCE_KM = 80;

export function distanceKm(a: RideLocation, b: RideLocation): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function formatDistanceKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function isInPakistanServiceArea(latitude: number, longitude: number): boolean {
  return (
    latitude >= PAKISTAN_BOUNDS.minLat &&
    latitude <= PAKISTAN_BOUNDS.maxLat &&
    longitude >= PAKISTAN_BOUNDS.minLng &&
    longitude <= PAKISTAN_BOUNDS.maxLng
  );
}

export function normalizePickupLocation(location: RideLocation): RideLocation {
  if (isInPakistanServiceArea(location.latitude, location.longitude)) {
    return location;
  }

  return {
    latitude: ISLAMABAD_CENTER.latitude,
    longitude: ISLAMABAD_CENTER.longitude,
    address: 'Islamabad City Center',
  };
}

export function detectNearestCity(pickup: RideLocation): string {
  let nearest = PAKISTAN_CITIES[0];
  let minDist = distanceKm(pickup, nearest);

  for (const city of PAKISTAN_CITIES) {
    const dist = distanceKm(pickup, {
      latitude: city.latitude,
      longitude: city.longitude,
      address: city.name,
    });
    if (dist < minDist) {
      minDist = dist;
      nearest = city;
    }
  }

  return nearest.name;
}

export function getNearbyLandmarks(pickup: RideLocation, limit = 20): DestinationOption[] {
  return [...PAKISTAN_LANDMARKS]
    .sort((a, b) => distanceKm(pickup, a) - distanceKm(pickup, b))
    .slice(0, limit);
}

export function getLandmarksInCity(city: string, limit = 30): DestinationOption[] {
  return PAKISTAN_LANDMARKS.filter(l => l.city === city).slice(0, limit);
}

export function getLandmarksByCategory(
  category: LandmarkCategory,
  pickup: RideLocation,
  limit = 25,
): DestinationOption[] {
  return PAKISTAN_LANDMARKS
    .filter(l => l.category === category)
    .sort((a, b) => distanceKm(pickup, a) - distanceKm(pickup, b))
    .slice(0, limit);
}

export function searchLandmarks(query: string, pickup: RideLocation, limit = 20): DestinationOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return PAKISTAN_LANDMARKS
    .filter(l => l.address.toLowerCase().includes(q) || (l.city?.toLowerCase().includes(q) ?? false))
    .sort((a, b) => distanceKm(pickup, a) - distanceKm(pickup, b))
    .slice(0, limit);
}

export { PAKISTAN_LANDMARKS };

/** @deprecated */
export const PRESET_DESTINATIONS = PAKISTAN_LANDMARKS.slice(0, 8);

export function estimateFare(pickup: RideLocation, dropoff: RideLocation): number {
  return Math.round(500 + distanceKm(pickup, dropoff) * 180);
}

export function formatFare(amount: number): string {
  return `PKR ${amount.toLocaleString('en-PK')}`;
}
