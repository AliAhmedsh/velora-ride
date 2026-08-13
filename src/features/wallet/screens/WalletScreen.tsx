import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { VeloraText } from '@components/atoms/VeloraText';
import { Button } from '@components/atoms/Button';
import { useTheme } from '@hooks/useTheme';
import { spacing, radius, shadow } from '@theme/spacing';
import { fetchWalletBalance, fetchWalletTransactions } from '../../../services/walletService';
import { topUpWalletWithStripe } from '../../../services/paymentService';
import { formatFare } from '../../../services/fareEngine';
import { STRIPE_PUBLISHABLE_KEY } from '@env';

export function WalletScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<
    Array<{ id: string; type: string; amount_pkr: number; description: string; created_at: string }>
  >([]);

  const load = async () => {
    const b = await fetchWalletBalance();
    const tx = await fetchWalletTransactions();
    setBalance(b);
    setTransactions(tx);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const handleStripeTopUp = async (amount: number) => {
    if (!STRIPE_PUBLISHABLE_KEY) {
      Alert.alert('Stripe not configured', 'Add STRIPE_PUBLISHABLE_KEY to .env');
      return;
    }
    setLoading(true);
    try {
      const newBalance = await topUpWalletWithStripe(amount);
      setBalance(newBalance);
      await load();
      Alert.alert('Success', `Wallet topped up. Balance: ${formatFare(newBalance)}`);
    } catch (e) {
      if (e && typeof e === 'object' && 'code' in e && e.code === 'Canceled') return;
      Alert.alert('Payment failed', e instanceof Error ? e.message : 'Try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
        style={[styles.hero, { paddingTop: insets.top + spacing.xl }]}>
        <VeloraText variant="caption" color={theme.colors.brown200}>Wallet balance</VeloraText>
        <VeloraText variant="hero" color={theme.colors.textOnPrimary} style={styles.balance}>
          {formatFare(balance)}
        </VeloraText>
      </LinearGradient>

      <View style={styles.content}>
        <Button
          label="Top up PKR 5,000 (Stripe)"
          fullWidth
          loading={loading}
          onPress={() => handleStripeTopUp(5000)}
        />
        <Button
          label="Top up PKR 10,000 (Stripe)"
          variant="outline"
          fullWidth
          loading={loading}
          onPress={() => handleStripeTopUp(10000)}
          style={styles.secondBtn}
        />

        <VeloraText variant="h3" style={styles.section}>Recent transactions</VeloraText>

        {transactions.length === 0 ? (
          <VeloraText variant="caption" color={theme.colors.textMuted}>No transactions yet</VeloraText>
        ) : (
          transactions.map(item => (
            <View
              key={item.id}
              style={[styles.row, shadow.sm, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <View>
                <VeloraText variant="bodyMedium">{item.description ?? item.type}</VeloraText>
                <VeloraText variant="caption" color={theme.colors.textSecondary}>
                  {new Date(item.created_at).toLocaleDateString()}
                </VeloraText>
              </View>
              <VeloraText variant="label" color={item.amount_pkr >= 0 ? theme.colors.success : theme.colors.text}>
                {item.amount_pkr >= 0 ? '+' : ''}{formatFare(item.amount_pkr)}
              </VeloraText>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxxl,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  balance: { marginTop: spacing.sm },
  content: { padding: spacing.xxl },
  secondBtn: { marginTop: spacing.md },
  section: { marginTop: spacing.xxl, marginBottom: spacing.lg },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
});
