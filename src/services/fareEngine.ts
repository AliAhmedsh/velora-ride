import type { RideLocation } from '../types/ride';
import type { ServiceType } from '../types/booking';

export type FareBreakdown = {
  recommendedFare: number;
  distanceKm: number;
  durationMin: number;
  baseFare: number;
  distanceFare: number;
  surcharges: number;
  vehicleMultiplier: number;
  yearMultiplier: number;
  serviceMultiplier: number;
};

const SERVICE_MULTIPLIERS: Record<ServiceType, number> = {
  local: 1,
  city_to_city: 2.5,
  rental: 3,
};

const RENTAL_DURATION_MULTIPLIERS: Record<string, number> = {
  '1_day': 1,
  '1_week': 6,
  '15_days': 12,
  '1_month': 22,
  custom: 15,
};

export function haversineKm(a: RideLocation, b: RideLocation): number {
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

export function estimateDurationMin(distanceKm: number, serviceType: ServiceType): number {
  const speed = serviceType === 'city_to_city' ? 70 : 35;
  return Math.max(5, Math.round((distanceKm / speed) * 60));
}

export function calculateFare(
  pickup: RideLocation,
  dropoff: RideLocation,
  options: {
    serviceType: ServiceType;
    vehicleMultiplier?: number;
    yearMultiplier?: number;
    rentalDuration?: string;
    vehicleCount?: number;
    stopCount?: number;
  },
): FareBreakdown {
  const distanceKm = haversineKm(pickup, dropoff);
  const durationMin = estimateDurationMin(distanceKm, options.serviceType);
  const baseFare = options.serviceType === 'rental' ? 2000 : 500;
  const perKm = options.serviceType === 'city_to_city' ? 120 : 180;
  const distanceFare = Math.round(distanceKm * perKm);
  const stopSurcharge = (options.stopCount ?? 0) * 150;
  const vehicleMultiplier = options.vehicleMultiplier ?? 1;
  const yearMultiplier = options.yearMultiplier ?? 1;
  const serviceMultiplier = SERVICE_MULTIPLIERS[options.serviceType];
  const rentalMult =
    options.serviceType === 'rental'
      ? RENTAL_DURATION_MULTIPLIERS[options.rentalDuration ?? '1_day'] ?? 1
      : 1;
  const vehicleCount = options.vehicleCount ?? 1;

  const subtotal =
    (baseFare + distanceFare + stopSurcharge) *
    vehicleMultiplier *
    yearMultiplier *
    serviceMultiplier *
    rentalMult *
    vehicleCount;

  const recommendedFare = Math.max(500, Math.round(subtotal));

  return {
    recommendedFare,
    distanceKm: Math.round(distanceKm * 10) / 10,
    durationMin,
    baseFare,
    distanceFare,
    surcharges: stopSurcharge,
    vehicleMultiplier,
    yearMultiplier,
    serviceMultiplier,
  };
}

export function validateCustomerOffer(recommendedFare: number, customerOffer: number): boolean {
  return customerOffer >= recommendedFare;
}

export function getLocalRideDistanceError(
  pickup: RideLocation,
  dropoff: RideLocation,
  maxKm = 80,
): string | null {
  const distanceKm = haversineKm(pickup, dropoff);
  if (distanceKm > maxKm) {
    return `Local rides are limited to ${maxKm} km. Pick a nearer destination or use City to City.`;
  }
  return null;
}

export function formatFare(amount: number): string {
  return `PKR ${amount.toLocaleString('en-PK')}`;
}
