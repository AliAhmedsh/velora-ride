import { supabase, type DbRide } from '../lib/supabase';
import type { Ride, RideLocation, RideStatus } from '../types/ride';
import type { BookingRequest } from '../types/booking';
import { APP_CONFIG } from '../config/app';
import { getCurrentUserId } from './authService';
import { getRideServiceMultiplier, getRideServiceType, isRideTypeAllowedForService } from '../data/rideServiceTypes';
import { calculateFare } from './fareEngine';

export function mapDbRideToRide(row: DbRide): Ride {
  return {
    id: row.id,
    riderName: row.rider_name,
    driverName: row.driver_name ?? undefined,
    driverRating: row.driver_rating ?? undefined,
    pickup: {
      address: row.pickup_address,
      latitude: row.pickup_lat,
      longitude: row.pickup_lng,
    },
    dropoff: {
      address: row.dropoff_address,
      latitude: row.dropoff_lat,
      longitude: row.dropoff_lng,
    },
    fare: row.customer_offer ?? row.fare,
    recommendedFare: row.recommended_fare ?? row.fare,
    customerOffer: row.customer_offer ?? row.fare,
    status: row.status as RideStatus,
    serviceType: (row.service_type as Ride['serviceType']) ?? 'local',
    scheduledAt: row.scheduled_at ?? undefined,
    originCity: row.origin_city ?? undefined,
    destinationCity: row.destination_city ?? undefined,
    fuelOption: row.fuel_option as Ride['fuelOption'],
    rentalDuration: row.rental_duration as Ride['rentalDuration'],
    vehicleCount: row.vehicle_count ?? undefined,
    distanceKm: row.distance_km ?? undefined,
    durationMin: row.duration_min ?? undefined,
    paymentMethod: row.payment_method as Ride['paymentMethod'],
    driverId: row.driver_id ?? undefined,
    womenOnly: row.women_only ?? undefined,
    acPreference: (row.ac_preference as Ride['acPreference']) ?? undefined,
    negotiationEnabled: row.negotiation_enabled ?? true,
    createdAt: row.created_at,
  };
}

export async function fetchCities() {
  const { data, error } = await supabase.from('cities').select('name').eq('is_active', true).order('name');
  if (error) throw error;
  return (data ?? []).map(c => c.name as string);
}

export async function fetchVehicleCategories() {
  const { data, error } = await supabase
    .from('vehicle_categories')
    .select('id, name, slug, base_multiplier')
    .eq('is_active', true)
    .order('sort_order');
  if (error) throw error;
  return data ?? [];
}

export async function fetchActiveRide(_isOnline = false): Promise<Ride | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('rides')
    .select('*')
    .eq('rider_id', userId)
    .in('status', ['searching', 'driver_assigned', 'driver_arriving', 'in_progress'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? mapDbRideToRide(data as DbRide) : null;
}

export async function fetchRideHistory(): Promise<Ride[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('rides')
    .select('*')
    .eq('rider_id', userId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data as DbRide[]).map(mapDbRideToRide);
}

async function resolveVehicleCategory(slug?: string) {
  if (!slug) return { id: undefined as string | undefined, multiplier: 1 };
  const localMultiplier = getRideServiceMultiplier(slug);
  const { data, error } = await supabase
    .from('vehicle_categories')
    .select('id, base_multiplier')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();
  if (error || !data) {
    return { id: undefined, multiplier: localMultiplier };
  }
  return { id: data.id as string, multiplier: Number(data.base_multiplier) || localMultiplier };
}

export async function createBooking(request: BookingRequest) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  if (request.customerOffer < request.recommendedFare) {
    throw new Error('Offer cannot be below recommended fare');
  }

  if (
    request.vehicleCategorySlug &&
    !isRideTypeAllowedForService(request.vehicleCategorySlug, request.serviceType)
  ) {
    throw new Error('This ride type is not available for inter-city trips. Choose Car or AC Car.');
  }

  const [{ id: vehicleCategoryId, multiplier: vehicleMultiplier }, profileResult] = await Promise.all([
    resolveVehicleCategory(request.vehicleCategorySlug),
    supabase.from('profiles').select('full_name').eq('id', userId).maybeSingle(),
  ]);

  const breakdown = calculateFare(request.pickup, request.dropoff, {
    serviceType: request.serviceType,
    rentalDuration: request.rentalDuration,
    vehicleCount: request.vehicleCount,
    vehicleMultiplier,
    stopCount: request.stops?.length ?? 0,
  });

  const riderName = profileResult.data?.full_name ?? APP_CONFIG.defaultName;
  const rideType = request.vehicleCategorySlug ? getRideServiceType(request.vehicleCategorySlug) : undefined;
  const requirements = [
    request.specialRequirements,
    rideType && !vehicleCategoryId ? `Ride type: ${rideType.name}` : undefined,
  ]
    .filter(Boolean)
    .join(' · ');

  const { data, error } = await supabase
    .from('rides')
    .insert({
      rider_id: userId,
      rider_name: riderName,
      service_type: request.serviceType,
      pickup_address: request.pickup.address,
      pickup_lat: request.pickup.latitude,
      pickup_lng: request.pickup.longitude,
      dropoff_address: request.dropoff.address,
      dropoff_lat: request.dropoff.latitude,
      dropoff_lng: request.dropoff.longitude,
      fare: request.customerOffer,
      recommended_fare: request.recommendedFare,
      customer_offer: request.customerOffer,
      scheduled_at: request.scheduledAt,
      origin_city: request.originCity,
      destination_city: request.destinationCity,
      fuel_option: request.fuelOption,
      rental_duration: request.rentalDuration,
      vehicle_count: request.vehicleCount ?? 1,
      vehicle_category_id: vehicleCategoryId,
      distance_km: breakdown.distanceKm,
      duration_min: breakdown.durationMin,
      payment_method: request.paymentMethod ?? 'cash',
      status: request.scheduledAt ? 'scheduled' : 'searching',
      special_requirements: requirements || undefined,
      women_only: request.womenOnly ?? false,
      ac_preference: request.acPreference ?? 'any',
      negotiation_enabled: request.negotiationEnabled ?? true,
      stops: request.stops ?? [],
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message || 'Could not save ride to database');
  }
  const ride = mapDbRideToRide(data as DbRide);

  if (request.paymentMethod === 'wallet') {
    try {
      const { payRideWithWallet } = await import('./paymentService');
      await payRideWithWallet(ride.id, request.customerOffer);
    } catch (walletError) {
      await supabase.from('rides').update({ status: 'cancelled' }).eq('id', ride.id);
      throw walletError;
    }
  }

  if (request.promoCode) {
    try {
      const { previewPromoCode, redeemPromoCode } = await import('./promoService');
      const applied = await previewPromoCode(request.promoCode, request.customerOffer);
      await redeemPromoCode(applied.promo.id, ride.id, applied.discountPkr);
    } catch {
      // promo redemption is best-effort; booking already succeeded
    }
  }

  return ride;
}

export async function fetchScheduledRides(): Promise<Ride[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];
  const { data, error } = await supabase
    .from('rides')
    .select('*')
    .eq('rider_id', userId)
    .eq('status', 'scheduled')
    .order('scheduled_at', { ascending: true });
  if (error) throw error;
  return (data as DbRide[]).map(mapDbRideToRide);
}

export async function cancelRideRequest(rideId: string) {
  const { data, error } = await supabase
    .from('rides')
    .update({ status: 'cancelled' })
    .eq('id', rideId)
    .select('*')
    .single();
  if (error) throw error;
  return mapDbRideToRide(data as DbRide);
}

export function subscribeToRides(onChange: () => void) {
  const channel = supabase
    .channel('velora-rides')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'rides' }, () => onChange())
    .subscribe();
  return () => supabase.removeChannel(channel);
}
