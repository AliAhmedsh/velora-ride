import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';
import { supabase } from '../lib/supabase';

export async function topUpWalletWithStripe(amountPkr: number): Promise<number> {
  const { data: intentData, error: intentError } = await supabase.functions.invoke('create-payment-intent', {
    body: { amountPkr },
  });

  if (intentError) throw intentError;
  const payload = intentData as { clientSecret?: string; paymentIntentId?: string; error?: string };
  if (payload.error || !payload.clientSecret || !payload.paymentIntentId) {
    throw new Error(payload.error ?? 'Could not start payment');
  }

  const { error: initError } = await initPaymentSheet({
    paymentIntentClientSecret: payload.clientSecret,
    merchantDisplayName: 'Velora',
    allowsDelayedPaymentMethods: false,
  });
  if (initError) throw initError;

  const { error: presentError } = await presentPaymentSheet();
  if (presentError) throw presentError;

  const { data: confirmData, error: confirmError } = await supabase.functions.invoke('confirm-wallet-topup', {
    body: { paymentIntentId: payload.paymentIntentId },
  });
  if (confirmError) throw confirmError;

  const confirm = confirmData as { balance?: number; error?: string };
  if (confirm.error) throw new Error(confirm.error);
  return confirm.balance ?? 0;
}

export async function payRideWithWallet(rideId: string, amountPkr: number) {
  const { data: session } = await supabase.auth.getSession();
  const userId = session.session?.user?.id;
  if (!userId) throw new Error('Not authenticated');

  const { data: wallet } = await supabase.from('wallets').select('id, balance_pkr').eq('user_id', userId).maybeSingle();
  if (!wallet || (wallet.balance_pkr ?? 0) < amountPkr) {
    throw new Error('Insufficient wallet balance');
  }

  const newBalance = (wallet.balance_pkr ?? 0) - amountPkr;
  await supabase.from('wallets').update({ balance_pkr: newBalance }).eq('id', wallet.id);
  await supabase.from('wallet_transactions').insert({
    wallet_id: wallet.id,
    ride_id: rideId,
    type: 'payment',
    amount_pkr: -amountPkr,
    description: `Ride payment ${rideId}`,
  });
  await supabase.from('rides').update({ payment_method: 'wallet' }).eq('id', rideId);
}
