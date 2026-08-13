import { supabase } from '../lib/supabase';
import { getCurrentUserId } from './authService';

export async function submitRating(
  rideId: string,
  revieweeId: string,
  scores: { score: number; cleanliness?: number; driving?: number; behaviour?: number; comment?: string },
) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');
  const { error } = await supabase.from('ratings').insert({
    ride_id: rideId,
    reviewer_id: userId,
    reviewee_id: revieweeId,
    score: scores.score,
    cleanliness: scores.cleanliness,
    driving: scores.driving,
    behaviour: scores.behaviour,
    comment: scores.comment,
  });
  if (error) throw error;
}
