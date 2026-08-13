import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { VeloraText } from '@components/atoms/VeloraText';
import { useTheme } from '@hooks/useTheme';
import { MainStackParamList } from '@navigation/types';
import { spacing, radius, shadow } from '@theme/spacing';
import { supabase } from '../../../lib/supabase';
import { formatFare } from '../../../services/fareEngine';

type Props = NativeStackScreenProps<MainStackParamList, 'Receipt'>;

export function ReceiptScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { rideId } = route.params;
  const [ride, setRide] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    supabase.from('rides').select('*').eq('id', rideId).single().then(({ data }) => setRide(data));
  }, [rideId]);

  if (!ride) return null;

  return (
    <ScrollView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxl }}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Pressable onPress={() => navigation.goBack()}>
          <VeloraText variant="label" color={theme.colors.primary}>← Back</VeloraText>
        </Pressable>
        <VeloraText variant="h2" style={styles.title}>Digital receipt</VeloraText>
      </View>

      <View style={[styles.card, shadow.md, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Row label="Trip ID" value={String(ride.id)} />
        <Row label="Date" value={new Date(String(ride.created_at)).toLocaleString()} />
        <Row label="Driver" value={String(ride.driver_name ?? '—')} />
        <Row label="From" value={String(ride.pickup_address)} />
        <Row label="To" value={String(ride.dropoff_address)} />
        <Row label="Distance" value={`${ride.distance_km ?? '—'} km`} />
        <Row label="Duration" value={`${ride.duration_min ?? '—'} min`} />
        <Row label="Fare" value={formatFare(Number(ride.customer_offer ?? ride.fare))} />
        <Row label="Commission" value={formatFare(Number(ride.commission_amount ?? 0))} />
        <Row label="Payment" value={String(ride.payment_method ?? 'cash')} />
      </View>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const { theme } = useTheme();
  return (
    <View style={styles.row}>
      <VeloraText variant="caption" color={theme.colors.textSecondary}>{label}</VeloraText>
      <VeloraText variant="bodyMedium">{value}</VeloraText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.lg },
  title: { marginTop: spacing.md },
  card: { marginHorizontal: spacing.xxl, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1 },
  row: { marginBottom: spacing.md },
});
