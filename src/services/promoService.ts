import { supabase } from '../lib/supabase';
import { getCurrentUserId } from './authService';

export type PromoCode = {
  id: string;
  code: string;
  description?: string;
  discountType: 'percent' | 'flat';
  discountValue: number;
  maxDiscountPkr?: number;
  minFarePkr: number;
};

export type PromoApplication = {
  promo: PromoCode;
  discountPkr: number;
  finalFarePkr: number;
};

/** Validates a promo code against a fare amount and returns the computed discount (rider-side preview). */
export async function previewPromoCode(code: string, farePkr: number): Promise<PromoApplication> {
  const normalized = code.trim().toUpperCase();
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', normalized)
    .eq('is_active', true)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Invalid or expired promo code');

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    throw new Error('This promo code has expired');
  }
  if (farePkr < (data.min_fare_pkr ?? 0)) {
    throw new Error(`Minimum fare of PKR ${data.min_fare_pkr} required for this promo`);
  }

  const userId = await getCurrentUserId();
  if (userId) {
    const { count } = await supabase
      .from('promo_redemptions')
      .select('id', { count: 'exact', head: true })
      .eq('promo_id', data.id)
      .eq('user_id', userId);
    if ((count ?? 0) >= (data.per_user_limit ?? 1)) {
      throw new Error('You have already used this promo code');
    }
  }

  let discount =
    data.discount_type === 'percent' ? Math.round((farePkr * data.discount_value) / 100) : data.discount_value;
  if (data.max_discount_pkr) discount = Math.min(discount, data.max_discount_pkr);
  discount = Math.min(discount, farePkr);

  const promo: PromoCode = {
    id: data.id,
    code: data.code,
    description: data.description ?? undefined,
    discountType: data.discount_type,
    discountValue: data.discount_value,
    maxDiscountPkr: data.max_discount_pkr ?? undefined,
    minFarePkr: data.min_fare_pkr ?? 0,
  };

  return { promo, discountPkr: discount, finalFarePkr: Math.max(farePkr - discount, 0) };
}

export async function redeemPromoCode(promoId: string, rideId: string, discountPkr: number) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');
  const { error } = await supabase.from('promo_redemptions').insert({
    promo_id: promoId,
    user_id: userId,
    ride_id: rideId,
    discount_amount_pkr: discountPkr,
  });
  if (error) throw error;
}

export async function fetchMyReferralCode(): Promise<string | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;
  const { data, error } = await supabase.from('profiles').select('referral_code').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data?.referral_code ?? null;
}

export async function fetchMyReferrals() {
  const userId = await getCurrentUserId();
  if (!userId) return [];
  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('referrer_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
