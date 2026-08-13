export type ServiceType = 'local' | 'city_to_city' | 'rental';
export type FuelOption = 'driver' | 'customer';
export type RentalDuration = '1_day' | '1_week' | '15_days' | '1_month' | 'custom';
export type DriverTier = 'standard' | 'silver' | 'gold' | 'platinum';
export type PaymentMethod = 'cash' | 'card' | 'wallet' | 'easypaisa' | 'jazzcash';
export type AcPreference = 'ac' | 'non_ac' | 'any';

export type BookingRequest = {
  serviceType: ServiceType;
  pickup: { address: string; latitude: number; longitude: number };
  dropoff: { address: string; latitude: number; longitude: number };
  stops?: { address: string; latitude: number; longitude: number }[];
  recommendedFare: number;
  customerOffer: number;
  scheduledAt?: string;
  originCity?: string;
  destinationCity?: string;
  fuelOption?: FuelOption;
  rentalDuration?: RentalDuration;
  vehicleCount?: number;
  vehicleCategorySlug?: string;
  specialRequirements?: string;
  paymentMethod?: PaymentMethod;
  womenOnly?: boolean;
  acPreference?: AcPreference;
  negotiationEnabled?: boolean;
  promoCode?: string;
};
