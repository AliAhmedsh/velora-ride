import { supabase } from '../lib/supabase';
import { getCurrentUserId } from './authService';

export type SavedLocation = {
  id: string;
  label: string;
  address: string;
  latitude: number;
  longitude: number;
};

export async function fetchSavedLocations(): Promise<SavedLocation[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];
  const { data, error } = await supabase
    .from('saved_locations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as SavedLocation[];
}

export async function upsertSavedLocation(loc: Omit<SavedLocation, 'id'> & { id?: string }) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('saved_locations')
    .upsert({
      id: loc.id,
      user_id: userId,
      label: loc.label,
      address: loc.address,
      latitude: loc.latitude,
      longitude: loc.longitude,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as SavedLocation;
}

export async function updateProfile(updates: {
  full_name?: string;
  email?: string;
  emergency_contact?: string;
  language?: string;
  gender?: 'male' | 'female' | 'other' | 'unspecified';
  prefers_women_driver?: boolean;
  avatar_url?: string;
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');
  const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
  if (error) throw error;
}

export async function fetchProfile() {
  const userId = await getCurrentUserId();
  if (!userId) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data;
}
