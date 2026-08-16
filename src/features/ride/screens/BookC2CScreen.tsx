import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@components/atoms/Button';
import { VeloraText } from '@components/atoms/VeloraText';
import { ScreenHeader } from '@components/molecules/ScreenHeader';
import { CityPicker } from '@components/molecules/CityPicker';
import { VehicleCategoryPicker } from '@components/molecules/VehicleCategoryPicker';
import { useTheme } from '@hooks/useTheme';
import { useUserLocation } from '@hooks/useUserLocation';
import { useAppDispatch } from '@hooks/useAppDispatch';
import { requestRide } from '@store';
import { MainStackParamList } from '@navigation/types';
import { spacing, radius, shadow } from '@theme/spacing';
import { getCityCenter } from '../../../data/pakistanCities';
import { getRideServiceType } from '../../../data/rideServiceTypes';
import {
  calculateFare,
  formatFare,
  validateCustomerOffer,
} from '../../../services/fareEngine';
import { getRideErrorMessage } from '../../../utils/rideErrors';
import type { BookingRequest } from '../../../types/booking';

type Props = NativeStackScreenProps<MainStackParamList, 'BookC2C'>;

export function BookC2CScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { location: deviceLocation, loading } = useUserLocation();
  const [originCity, setOriginCity] = useState('Islamabad');
  const [destCity, setDestCity] = useState('Lahore');
  const [booking, setBooking] = useState(false);
  const [vehicleSlug, setVehicleSlug] = useState<string | null>(null);
  const [vehicleMultiplier, setVehicleMultiplier] = useState(1);
  const [customerOffer, setCustomerOffer] = useState('');

  const originCenter = getCityCenter(originCity);
  const destCenter = getCityCenter(destCity);

  const breakdown = calculateFare(originCenter, destCenter, {
    serviceType: 'city_to_city',
    vehicleMultiplier,
  });

  useEffect(() => {
    setCustomerOffer(String(breakdown.recommendedFare));
  }, [breakdown.recommendedFare, originCity, destCity, vehicleSlug]);

  if (loading || !deviceLocation) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  const handleBook = async () => {
    if (!vehicleSlug) {
      Alert.alert('Select ride type', 'Choose Bike, Car, Rickshaw, or another option.');
      return;
    }

    const offer = parseInt(customerOffer, 10);
    if (Number.isNaN(offer) || !validateCustomerOffer(breakdown.recommendedFare, offer)) {
      Alert.alert(
        'Set your fare',
        `Enter at least ${formatFare(breakdown.recommendedFare)}. You can offer more — drivers may counter-offer.`,
      );
      return;
    }

    const rideType = getRideServiceType(vehicleSlug);

    const request: BookingRequest = {
      serviceType: 'city_to_city',
      pickup: originCenter,
      dropoff: destCenter,
      recommendedFare: breakdown.recommendedFare,
      customerOffer: offer,
      vehicleCategorySlug: vehicleSlug,
      originCity,
      destinationCity: destCity,
      paymentMethod: 'cash',
      negotiationEnabled: true,
      specialRequirements: rideType ? `Ride type: ${rideType.name}` : undefined,
    };

    setBooking(true);
    try {
      await dispatch(requestRide(request)).unwrap();
      navigation.replace('RideStatus');
    } catch (error) {
      Alert.alert('Booking failed', getRideErrorMessage(error));
    } finally {
      setBooking(false);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        padding: spacing.xxl,
        paddingBottom: insets.bottom + spacing.xxl,
      }}>
      <ScreenHeader
        title="City to City"
        subtitle="Inter-city ride · set your own fare (InDriver style)"
        onBack={() => navigation.goBack()}
      />

      <CityPicker
        label="From city"
        value={originCity}
        onSelect={setOriginCity}
        excludeCity={destCity}
      />

      <CityPicker
        label="To city"
        value={destCity}
        onSelect={setDestCity}
        excludeCity={originCity}
      />

      <VehicleCategoryPicker
        value={vehicleSlug}
        serviceType="city_to_city"
        onChange={(slug, multiplier) => {
          setVehicleSlug(slug);
          setVehicleMultiplier(multiplier);
        }}
      />

      <View
        style={[
          styles.card,
          shadow.sm,
          { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
        ]}>
        <VeloraText variant="h3" color={theme.colors.text}>
          {originCity} → {destCity}
        </VeloraText>
        <VeloraText variant="caption" color={theme.colors.textSecondary}>
          ~{breakdown.distanceKm} km · ~{breakdown.durationMin} min
        </VeloraText>
        <VeloraText variant="bodyMedium" color={theme.colors.textSecondary} style={styles.fareHint}>
          Recommended minimum: {formatFare(breakdown.recommendedFare)}
        </VeloraText>
        <VeloraText variant="caption" color={theme.colors.textMuted}>
          Offer your fare — not lower than the minimum. Drivers can accept or counter-offer.
        </VeloraText>
        <TextInput
          value={customerOffer}
          onChangeText={setCustomerOffer}
          keyboardType="number-pad"
          style={[
            styles.input,
            {
              borderColor: theme.colors.border,
              color: theme.colors.text,
              backgroundColor: theme.colors.surface,
            },
          ]}
          placeholder="Your offer (PKR)"
          placeholderTextColor={theme.colors.textMuted}
        />
      </View>

      <Button
        label={`Book · ${formatFare(parseInt(customerOffer, 10) || breakdown.recommendedFare)}`}
        fullWidth
        loading={booking}
        onPress={handleBook}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginVertical: spacing.lg,
    gap: spacing.xs,
  },
  fareHint: { marginTop: spacing.sm },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    minHeight: 48,
    fontSize: 16,
  },
});
