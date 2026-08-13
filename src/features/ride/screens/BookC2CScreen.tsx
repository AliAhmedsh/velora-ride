import React, { useEffect, useState } from 'react';
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
import { fetchCities } from '../../../services/rideService';
import { calculateFare, formatFare } from '../../../services/fareEngine';
import { ISLAMABAD_CENTER } from '@utils/locations';
import type { BookingRequest } from '../../../types/booking';

type Props = NativeStackScreenProps<MainStackParamList, 'BookC2C'>;

export function BookC2CScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { location: pickup, loading } = useUserLocation();
  const [cities, setCities] = useState<string[]>([]);
  const [originCity, setOriginCity] = useState('Islamabad');
  const [destCity, setDestCity] = useState('Lahore');
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    fetchCities().then(setCities).catch(() => setCities(['Islamabad', 'Lahore', 'Karachi', 'Peshawar']));
  }, []);

  const dropoff = { ...ISLAMABAD_CENTER, address: destCity };

  if (loading || !pickup) {
    return <View style={styles.center}><ActivityIndicator /></View>;
  }

  const breakdown = calculateFare(pickup, dropoff, { serviceType: 'city_to_city' });

  const handleBook = async () => {
    const request: BookingRequest = {
      serviceType: 'city_to_city',
      pickup,
      dropoff,
      recommendedFare: breakdown.recommendedFare,
      customerOffer: breakdown.recommendedFare,
      originCity,
      destinationCity: destCity,
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
      <VeloraText variant="hero" style={styles.title}>City to City</VeloraText>
      <VeloraText variant="body" color={theme.colors.textSecondary}>Scheduled inter-city with driver</VeloraText>

      <VeloraText variant="label" style={styles.section}>From city</VeloraText>
      <View style={styles.row}>
        {cities.slice(0, 6).map(c => (
          <Pressable key={c} onPress={() => setOriginCity(c)} style={[styles.chip, { backgroundColor: originCity === c ? theme.colors.primary : theme.colors.card, borderColor: theme.colors.border }]}>
            <VeloraText variant="caption" color={originCity === c ? theme.colors.textOnPrimary : theme.colors.text}>{c}</VeloraText>
          </Pressable>
        ))}
      </View>

      <VeloraText variant="label" style={styles.section}>To city</VeloraText>
      <View style={styles.row}>
        {cities.slice(0, 6).map(c => (
          <Pressable key={c} onPress={() => setDestCity(c)} style={[styles.chip, { backgroundColor: destCity === c ? theme.colors.accent : theme.colors.card, borderColor: theme.colors.border }]}>
            <VeloraText variant="caption" color={destCity === c ? theme.colors.textOnPrimary : theme.colors.text}>{c}</VeloraText>
          </Pressable>
        ))}
      </View>

      <View style={[styles.card, shadow.sm, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <VeloraText variant="h3">{originCity} → {destCity}</VeloraText>
        <VeloraText variant="caption" color={theme.colors.textSecondary}>~{breakdown.distanceKm} km · {breakdown.durationMin} min est.</VeloraText>
        <VeloraText variant="h2" color={theme.colors.primary}>{formatFare(breakdown.recommendedFare)}</VeloraText>
        <VeloraText variant="caption" color={theme.colors.textMuted}>Recommended minimum fare</VeloraText>
      </View>

      <Button label="Book city ride" fullWidth loading={booking} onPress={handleBook} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { marginTop: spacing.md },
  section: { marginTop: spacing.lg, marginBottom: spacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, borderWidth: 1 },
  card: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, marginVertical: spacing.xl, gap: spacing.xs },
});
