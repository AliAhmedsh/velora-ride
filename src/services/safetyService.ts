import { supabase } from '../lib/supabase';
import { getCurrentUserId } from './authService';

export async function triggerSos(rideId?: string, lat?: number, lng?: number) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');
  const { error } = await supabase.from('sos_events').insert({
    ride_id: rideId,
    user_id: userId,
    latitude: lat,
    longitude: lng,
  });
  if (error) throw error;
}
