import { supabase } from '../lib/supabase';

export type RideOffer = {
  id: string;
  rideId: string;
  driverId: string;
  driverName?: string;
  driverRating?: number;
  offeredFare: number;
  etaMinutes?: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'expired';
  createdAt: string;
};

type DbOfferRow = {
  id: string;
  ride_id: string;
  driver_id: string;
  offered_fare: number;
  eta_minutes: number | null;
  message: string | null;
  status: RideOffer['status'];
  created_at: string;
  profiles?: { full_name: string; rating: number } | null;
};

function mapOffer(row: DbOfferRow): RideOffer {
  return {
    id: row.id,
    rideId: row.ride_id,
    driverId: row.driver_id,
    driverName: row.profiles?.full_name,
    driverRating: row.profiles?.rating,
    offeredFare: row.offered_fare,
    etaMinutes: row.eta_minutes ?? undefined,
    message: row.message ?? undefined,
    status: row.status,
    createdAt: row.created_at,
  };
}

/** Fetch all driver offers/counter-bids for a ride the rider posted (InDriver-style negotiation). */
export async function fetchRideOffers(rideId: string): Promise<RideOffer[]> {
  const { data, error } = await supabase
    .from('ride_offers')
    .select('*, profiles:driver_id(full_name, rating)')
    .eq('ride_id', rideId)
    .eq('status', 'pending')
    .order('offered_fare', { ascending: true });

  if (error) throw error;
  return (data as unknown as DbOfferRow[]).map(mapOffer);
}

export function subscribeToRideOffers(rideId: string, onChange: () => void) {
  const channel = supabase
    .channel(`ride-offers-${rideId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'ride_offers', filter: `ride_id=eq.${rideId}` },
      () => onChange(),
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}

/** Rider accepts a driver's counter-offer: assigns the driver and confirms the fare. */
export async function acceptRideOffer(offer: RideOffer) {
  const { error: offerError } = await supabase
    .from('ride_offers')
    .update({ status: 'accepted' })
    .eq('id', offer.id);
  if (offerError) throw offerError;

  const { error: rejectOthersError } = await supabase
    .from('ride_offers')
    .update({ status: 'rejected' })
    .eq('ride_id', offer.rideId)
    .neq('id', offer.id);
  if (rejectOthersError) throw rejectOthersError;

  const { data, error } = await supabase
    .from('rides')
    .update({
      driver_id: offer.driverId,
      fare: offer.offeredFare,
      customer_offer: offer.offeredFare,
      status: 'driver_assigned',
      driver_name: offer.driverName ?? null,
      driver_rating: offer.driverRating ?? null,
    })
    .eq('id', offer.rideId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function rejectRideOffer(offerId: string) {
  const { error } = await supabase.from('ride_offers').update({ status: 'rejected' }).eq('id', offerId);
  if (error) throw error;
}
