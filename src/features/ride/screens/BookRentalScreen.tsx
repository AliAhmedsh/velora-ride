import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@components/atoms/Button';
import { VeloraText } from '@components/atoms/VeloraText';
import { useTheme } from '@hooks/useTheme';
import { useUserLocation } from '@hooks/useUserLocation';
import { useAppDispatch } from '@hooks/useAppDispatch';
import { requestRide } from '@store';
import { MainStackParamList } from '@navigation/types';
import { spacing, radius, shadow } from '@theme/spacing';
import { calculateFare, formatFare } from '../../../services/fareEngine';
import { ISLAMABAD_CENTER } from '@utils/locations';
import type { BookingRequest, FuelOption, RentalDuration } from '../../../types/booking';

type Props = NativeStackScreenProps<MainStackParamList, 'BookRental'>;

const DURATIONS: { key: RentalDuration; label: string }[] = [
  { key: '1_day', label: '1 Day' },
  { key: '1_week', label: '1 Week' },
  { key: '15_days', label: '15 Days' },
  { key: '1_month', label: '1 Month' },
];

export function BookRentalScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { location: pickup, loading: pickupLoading } = useUserLocation();
  const [duration, setDuration] = useState<RentalDuration>('1_day');
  const [fuel, setFuel] = useState<FuelOption>('driver');
  const [vehicleCount, setVehicleCount] = useState(1);
  const [booking, setBooking] = useState(false);

  const dropoff = ISLAMABAD_CENTER;

  if (pickupLoading || !pickup) {
    return <View style={styles.center}><ActivityIndicator /></View>;
  }

  const breakdown = calculateFare(pickup, dropoff, { serviceType: 'rental', rentalDuration: duration, vehicleCount });

  const handleBook = async () => {
    const request: BookingRequest = {
      serviceType: 'rental',
      pickup,
      dropoff: { ...dropoff, address: 'As per rental agreement' },
      recommendedFare: breakdown.recommendedFare,
      customerOffer: breakdown.recommendedFare,
      rentalDuration: duration,
      fuelOption: fuel,
      vehicleCount,
      paymentMethod: 'cash',
    };
    setBooking(true);
    try {
      await dispatch(requestRide(request));
      navigation.replace('RideStatus');
    } finally {
      setBooking(false);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: spacing.xxl, paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xl }}>
      <Pressable onPress={() => navigation.goBack()}>
        <VeloraText variant="label" color={theme.colors.primary}>← Back</VeloraText>
      </Pressable>
      <VeloraText variant="hero" style={styles.title}>Rental / Contract</VeloraText>
      <VeloraText variant="body" color={theme.colors.textSecondary}>With-driver only · Advance payment may apply</VeloraText>

      <VeloraText variant="label" style={styles.section}>Duration</VeloraText>
      <View style={styles.row}>
        {DURATIONS.map(d => (
          <Pressable key={d.key} onPress={() => setDuration(d.key)} style={[styles.chip, { backgroundColor: duration === d.key ? theme.colors.primary : theme.colors.card, borderColor: theme.colors.border }]}>
            <VeloraText variant="caption" color={duration === d.key ? theme.colors.textOnPrimary : theme.colors.text}>{d.label}</VeloraText>
          </Pressable>
        ))}
      </View>

      <VeloraText variant="label" style={styles.section}>Fuel responsibility</VeloraText>
      <View style={styles.row}>
        {(['driver', 'customer'] as FuelOption[]).map(f => (
          <Pressable key={f} onPress={() => setFuel(f)} style={[styles.chip, { backgroundColor: fuel === f ? theme.colors.accent : theme.colors.card, borderColor: theme.colors.border }]}>
            <VeloraText variant="caption" color={fuel === f ? theme.colors.textOnPrimary : theme.colors.text}>{f === 'driver' ? 'Driver provides' : 'Customer provides'}</VeloraText>
          </Pressable>
        ))}
      </View>

      <VeloraText variant="label" style={styles.section}>Vehicles: {vehicleCount}</VeloraText>
      <View style={styles.row}>
        <Button label="−" variant="outline" onPress={() => setVehicleCount(Math.max(1, vehicleCount - 1))} />
        <VeloraText variant="h3" style={styles.count}>{vehicleCount}</VeloraText>
        <Button label="+" variant="outline" onPress={() => setVehicleCount(Math.min(10, vehicleCount + 1))} />
      </View>

      <View style={[styles.card, shadow.sm, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <VeloraText variant="h2" color={theme.colors.primary}>{formatFare(breakdown.recommendedFare)}</VeloraText>
        <VeloraText variant="caption" color={theme.colors.textMuted}>Recommended minimum · {vehicleCount} vehicle(s)</VeloraText>
      </View>

      <Button label="Request rental" fullWidth loading={booking} onPress={handleBook} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { marginTop: spacing.md },
  section: { marginTop: spacing.lg, marginBottom: spacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, alignItems: 'center' },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, borderWidth: 1 },
  card: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, marginVertical: spacing.xl },
  count: { marginHorizontal: spacing.lg },
});
