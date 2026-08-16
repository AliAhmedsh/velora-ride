import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
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
import { LocalDestinationField } from '@components/molecules/LocalDestinationField';
import { PaymentMethodPicker } from '@components/molecules/PaymentMethodPicker';
import { VehicleCategoryPicker } from '@components/molecules/VehicleCategoryPicker';
import { RideMap } from '@components/organisms/RideMap';
import { useTheme } from '@hooks/useTheme';
import { useUserLocation } from '@hooks/useUserLocation';
import { useAppDispatch } from '@hooks/useAppDispatch';
import { requestRide } from '@store';
import { MainStackParamList } from '@navigation/types';
import { spacing, radius, shadow } from '@theme/spacing';
import { getRideServiceType } from '../../../data/rideServiceTypes';
import {
  calculateFare,
  formatFare,
  getLocalRideDistanceError,
  validateCustomerOffer,
} from '../../../services/fareEngine';
import { reverseGeocode } from '../../../services/placesService';
import { getRideErrorMessage } from '../../../utils/rideErrors';
import type { BookingRequest, PaymentMethod } from '../../../types/booking';
import type { RideLocation } from '../../../types/ride';

type Props = NativeStackScreenProps<MainStackParamList, 'BookRide'>;

export function BookRideScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { location: pickup, loading: locLoading } = useUserLocation();

  const [dropoff, setDropoff] = useState<RideLocation | null>(null);
  const [vehicleSlug, setVehicleSlug] = useState<string | null>(null);
  const [vehicleMultiplier, setVehicleMultiplier] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [customerOffer, setCustomerOffer] = useState('');
  const [booking, setBooking] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);

  const breakdown = useMemo(() => {
    if (!pickup || !dropoff) return null;
    return calculateFare(pickup, dropoff, {
      serviceType: 'local',
      vehicleMultiplier,
    });
  }, [pickup, dropoff, vehicleMultiplier]);

  useEffect(() => {
    if (breakdown) {
      setCustomerOffer(String(breakdown.recommendedFare));
    }
  }, [breakdown?.recommendedFare, dropoff?.latitude, dropoff?.longitude, vehicleSlug]);

  const handleMapPress = useCallback(async (coord: { latitude: number; longitude: number }) => {
    setMapLoading(true);
    try {
      const address = (await reverseGeocode(coord.latitude, coord.longitude)) ?? 'Selected on map';
      setDropoff({
        latitude: coord.latitude,
        longitude: coord.longitude,
        address,
      });
    } finally {
      setMapLoading(false);
    }
  }, []);

  const handleBook = async () => {
    if (!pickup) {
      Alert.alert('Location', 'Enable location to set your pickup point.');
      return;
    }
    if (!dropoff) {
      Alert.alert('Destination', 'Search or tap the map to choose where you are going.');
      return;
    }
    if (!vehicleSlug) {
      Alert.alert('Select vehicle', 'Choose Car, Mini Car, Rickshaw, Bike, Chingchi, or AC Car.');
      return;
    }

    const distanceError = getLocalRideDistanceError(pickup, dropoff);
    if (distanceError) {
      Alert.alert('Long trip', distanceError);
      return;
    }

    const recommendedFare = breakdown?.recommendedFare ?? 500;
    const offer = parseInt(customerOffer, 10);
    if (Number.isNaN(offer) || !validateCustomerOffer(recommendedFare, offer)) {
      Alert.alert(
        'Set your fare',
        `Enter at least ${formatFare(recommendedFare)}. You can offer more — drivers may counter-offer.`,
      );
      return;
    }

    const rideType = getRideServiceType(vehicleSlug);
    const request: BookingRequest = {
      serviceType: 'local',
      pickup,
      dropoff,
      recommendedFare,
      customerOffer: offer,
      vehicleCategorySlug: vehicleSlug,
      paymentMethod,
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

  if (locLoading || !pickup) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View style={{ paddingHorizontal: spacing.lg }}>
        <ScreenHeader
          title="Local ride"
          subtitle="Pick destination on map · choose vehicle · set fare"
          onBack={() => navigation.goBack()}
        />
      </View>

      <View style={styles.mapArea}>
        <RideMap
          pickup={pickup}
          dropoff={dropoff}
          showsUserLocation
          onMapPress={handleMapPress}
          fullBleed
        />
        {mapLoading ? (
          <View style={styles.mapOverlay}>
            <VeloraText variant="caption" color={theme.colors.white}>
              Getting address…
            </VeloraText>
          </View>
        ) : null}
      </View>

      <KeyboardAvoidingView
        style={styles.sheetWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 56}>
        <ScrollView
          style={[styles.sheet, { backgroundColor: theme.colors.surface }]}
          contentContainerStyle={{
            padding: spacing.lg,
            paddingBottom: insets.bottom + spacing.xl,
          }}
          keyboardShouldPersistTaps="handled">
          <VeloraText variant="caption" color={theme.colors.textSecondary}>
            Pickup: {pickup.address}
          </VeloraText>

          <LocalDestinationField value={dropoff} onChange={setDropoff} pickup={pickup} />

          {breakdown ? (
            <VeloraText variant="caption" color={theme.colors.textSecondary} style={styles.meta}>
              ~{breakdown.distanceKm} km · ~{breakdown.durationMin} min · min {formatFare(breakdown.recommendedFare)}
            </VeloraText>
          ) : null}

          <VehicleCategoryPicker
            value={vehicleSlug}
            serviceType="local"
            onChange={(slug, multiplier) => {
              setVehicleSlug(slug);
              setVehicleMultiplier(multiplier);
            }}
          />

          <View
            style={[
              styles.fareCard,
              shadow.sm,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}>
            <VeloraText variant="label" color={theme.colors.textSecondary}>
              Your fare (PKR)
            </VeloraText>
            <TextInput
              value={customerOffer}
              onChangeText={setCustomerOffer}
              keyboardType="number-pad"
              style={[
                styles.fareInput,
                {
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                  backgroundColor: theme.colors.surface,
                },
              ]}
              placeholder="Enter your offer"
              placeholderTextColor={theme.colors.textMuted}
            />
          </View>

          <VeloraText variant="label" color={theme.colors.textSecondary} style={styles.paymentLabel}>
            Payment
          </VeloraText>
          <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} />

          <Button
            label={
              booking
                ? 'Requesting…'
                : `Request ride · ${formatFare(parseInt(customerOffer, 10) || breakdown?.recommendedFare || 0)}`
            }
            fullWidth
            loading={booking}
            disabled={!dropoff || !vehicleSlug}
            onPress={handleBook}
            style={{ marginTop: spacing.lg }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mapArea: {
    flex: 1,
    minHeight: 280,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
  },
  sheetWrap: { maxHeight: '50%' },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  meta: { marginTop: spacing.sm },
  fareCard: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
  },
  fareInput: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 48,
    fontSize: 16,
  },
  paymentLabel: { marginTop: spacing.lg, marginBottom: spacing.xs },
});
