import { supabase } from '../lib/supabase';
import { getCurrentUserId } from './authService';

export async function getOrCreateWallet() {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  const { data: existing } = await supabase.from('wallets').select('*').eq('user_id', userId).maybeSingle();
  if (existing) return existing;

  const { data, error } = await supabase.from('wallets').insert({ user_id: userId }).select('*').single();
  if (error) throw error;
  return data;
}

export async function fetchWalletBalance(): Promise<number> {
  const wallet = await getOrCreateWallet();
  return wallet.balance_pkr ?? 0;
}

export async function fetchWalletTransactions() {
  const wallet = await getOrCreateWallet();
  const { data, error } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('wallet_id', wallet.id)
    .order('created_at', { ascending: false })
    .limit(30);
  if (error) throw error;
  return data ?? [];
}

export async function topUpWallet(amount: number) {
  const wallet = await getOrCreateWallet();
  const newBalance = (wallet.balance_pkr ?? 0) + amount;
  const { error: wErr } = await supabase.from('wallets').update({ balance_pkr: newBalance }).eq('id', wallet.id);
  if (wErr) throw wErr;
  const { error: tErr } = await supabase.from('wallet_transactions').insert({
    wallet_id: wallet.id,
    type: 'topup',
    amount_pkr: amount,
    description: 'Wallet top-up',
  });
  if (tErr) throw tErr;
  return newBalance;
}
