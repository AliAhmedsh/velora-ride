import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@components/atoms/Button';
import { VeloraText } from '@components/atoms/VeloraText';
import { RideMap } from '@components/organisms/RideMap';
import { DestinationPicker } from '@components/organisms/DestinationPicker';
import { useTheme } from '@hooks/useTheme';
import { useUserLocation } from '@hooks/useUserLocation';
import { useAppDispatch } from '@hooks/useAppDispatch';
import { requestRide } from '@store';
import { MainStackParamList } from '@navigation/types';
import { spacing, radius, shadow } from '@theme/spacing';
import {
  detectNearestCity,
  distanceKm,
  LOCAL_MAX_DISTANCE_KM,
  type DestinationOption,
} from '@utils/locations';
import { PaymentMethodPicker } from '@components/molecules/PaymentMethodPicker';
import { RideOptionsPanel } from '@components/molecules/RideOptionsPanel';
import {
  buildSpecialRequirements,
  DEFAULT_RIDE_EXTRAS,
  RideExtrasPicker,
} from '@components/molecules/RideExtrasPicker';
import {
  calculateFare,
  formatFare,
  validateCustomerOffer,
} from '../../../services/fareEngine';
import { getRideErrorMessage } from '../../../utils/rideErrors';
import type { AcPreference, BookingRequest, PaymentMethod, ServiceType } from '../../../types/booking';
import type { PromoApplication } from '../../../services/promoService';

type Props = NativeStackScreenProps<MainStackParamList, 'BookRide'>;

export function BookRideScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const dispatch = useAppDispatch();
  const { location: pickup, loading: pickupLoading } = useUserLocation();
  const [dropoff, setDropoff] = useState<DestinationOption | null>(null);
  const [customerOffer, setCustomerOffer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [booking, setBooking] = useState(false);
  const [rideExtras, setRideExtras] = useState(DEFAULT_RIDE_EXTRAS);
  const [serviceOverride, setServiceOverride] = useState<ServiceType | 'auto'>('auto');
  const [womenOnly, setWomenOnly] = useState(false);
  const [acPreference, setAcPreference] = useState<AcPreference>('any');
  const [promoApplication, setPromoApplication] = useState<PromoApplication | null>(null);

  const tripKm = pickup && dropoff ? distanceKm(pickup, dropoff) : 0;
  const isLongTrip = tripKm > LOCAL_MAX_DISTANCE_KM;

  const effectiveService: ServiceType =
    serviceOverride === 'auto' ? (isLongTrip ? 'city_to_city' : 'local') : serviceOverride;

  const breakdown =
    pickup && dropoff
      ? calculateFare(pickup, dropoff, { serviceType: effectiveService })
      : null;

  const serviceBlocked = serviceOverride === 'local' && isLongTrip;

  useEffect(() => {
    setDropoff(null);
    setServiceOverride('auto');
  }, [pickup?.latitude, pickup?.longitude]);

  useEffect(() => {
    if (breakdown) setCustomerOffer(String(breakdown.recommendedFare));
  }, [breakdown?.recommendedFare]);

  const handleBook = async () => {
    if (!pickup || !dropoff || !breakdown) {
      Alert.alert('Select destination', 'Choose where you want to go first.');
      return;
    }

    if (serviceBlocked) {
      Alert.alert(
        'Too far for local ride',
        `This trip is ${tripKm.toFixed(0)} km. Switch to City to City or pick a nearer destination (under ${LOCAL_MAX_DISTANCE_KM} km).`,
      );
      return;
    }

    const offer = parseInt(customerOffer, 10);
    if (Number.isNaN(offer) || !validateCustomerOffer(breakdown.recommendedFare, offer)) {
      Alert.alert('Invalid offer', 'Enter a valid amount at least the recommended minimum fare.');
      return;
    }

    const originCity = detectNearestCity(pickup);
    const destinationCity = dropoff.city ?? detectNearestCity(dropoff);

    const request: BookingRequest = {
      serviceType: effectiveService,
      pickup,
      dropoff,
      recommendedFare: breakdown.recommendedFare,
      customerOffer: offer,
      paymentMethod: paymentMethod === 'card' ? 'wallet' : paymentMethod,
      originCity: effectiveService === 'city_to_city' ? originCity : undefined,
      destinationCity: effectiveService === 'city_to_city' ? destinationCity : undefined,
      specialRequirements: buildSpecialRequirements(rideExtras),
      womenOnly,
      acPreference,
      promoCode: promoApplication?.promo.code,
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

  const mapHeight = Math.min(windowHeight * 0.32, 280);
  const confirmLabel =
    effectiveService === 'city_to_city'
      ? `Confirm city to city · ${formatFare(breakdown?.recommendedFare ?? 0)}`
      : `Confirm local ride · ${formatFare(breakdown?.recommendedFare ?? 0)}`;

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.top}>
      <View style={[styles.mapWrap, { height: mapHeight }]}>
        {pickupLoading || !pickup ? (
          <View style={styles.loading}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : (
          <RideMap pickup={pickup} dropoff={dropoff} />
        )}
      </View>

      <View style={[styles.sheet, shadow.lg, { backgroundColor: theme.colors.card }]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{
            paddingHorizontal: spacing.xxl,
            paddingTop: spacing.lg,
            paddingBottom: spacing.md,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <VeloraText variant="label" color={theme.colors.primary}>← Back</VeloraText>
          </Pressable>
          <VeloraText variant="h3" style={styles.title}>Book a ride</VeloraText>
          <VeloraText variant="caption" color={theme.colors.textSecondary} numberOfLines={2}>
            From: {pickup?.address ?? 'Getting location…'}
          </VeloraText>

          <View style={styles.serviceRow}>
            <Pressable
              onPress={() => setServiceOverride('local')}
              style={[
                styles.serviceChip,
                {
                  borderColor: effectiveService === 'local' ? theme.colors.primary : theme.colors.border,
                  backgroundColor:
                    effectiveService === 'local' ? theme.colors.primary + '14' : theme.colors.surface,
                },
              ]}>
              <VeloraText
                variant="caption"
                color={effectiveService === 'local' ? theme.colors.primary : theme.colors.textSecondary}>
                Local (≤{LOCAL_MAX_DISTANCE_KM} km)
              </VeloraText>
            </Pressable>
            <Pressable
              onPress={() => setServiceOverride('city_to_city')}
              style={[
                styles.serviceChip,
                {
                  borderColor:
                    effectiveService === 'city_to_city' ? theme.colors.primary : theme.colors.border,
                  backgroundColor:
                    effectiveService === 'city_to_city' ? theme.colors.primary + '14' : theme.colors.surface,
                },
              ]}>
              <VeloraText
                variant="caption"
                color={
                  effectiveService === 'city_to_city' ? theme.colors.primary : theme.colors.textSecondary
                }>
                City to City
              </VeloraText>
            </Pressable>
            <Pressable onPress={() => setServiceOverride('auto')}>
              <VeloraText variant="caption" color={theme.colors.textMuted}>Auto</VeloraText>
            </Pressable>
          </View>

          {isLongTrip && effectiveService === 'city_to_city' && (
            <View style={[styles.banner, { backgroundColor: theme.colors.accent + '22' }]}>
              <VeloraText variant="caption" color={theme.colors.primary}>
                Long trip ({tripKm.toFixed(0)} km) — priced as City to City inter-city ride.
              </VeloraText>
            </View>
          )}

          {serviceBlocked && (
            <View style={[styles.banner, { backgroundColor: theme.colors.error + '18' }]}>
              <VeloraText variant="caption" color={theme.colors.error}>
                Local rides max {LOCAL_MAX_DISTANCE_KM} km. Use City to City or pick a closer place.
              </VeloraText>
            </View>
          )}

          {pickup ? (
            <DestinationPicker pickup={pickup} selected={dropoff} onSelect={setDropoff} />
          ) : null}

          {dropoff ? (
            <View style={[styles.destCard, { borderColor: theme.colors.border }]}>
              <VeloraText variant="label" color={theme.colors.textSecondary}>Going to</VeloraText>
              <VeloraText variant="bodyMedium">{dropoff.address}</VeloraText>
            </View>
          ) : null}

          {breakdown && (
            <View style={styles.fareBox}>
              <VeloraText variant="caption" color={theme.colors.textSecondary}>
                {breakdown.distanceKm} km · ~{breakdown.durationMin} min · {effectiveService.replace('_', ' ')}
              </VeloraText>
              <VeloraText variant="bodyMedium">
                Minimum fare: {formatFare(breakdown.recommendedFare)}
              </VeloraText>
              <VeloraText variant="caption" color={theme.colors.textMuted}>
                You may offer higher — not lower
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
          )}

          <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} />
          <RideExtrasPicker value={rideExtras} onChange={setRideExtras} />
          {breakdown && (
            <RideOptionsPanel
              fare={parseInt(customerOffer, 10) || breakdown.recommendedFare}
              womenOnly={womenOnly}
              onWomenOnlyChange={setWomenOnly}
              acPreference={acPreference}
              onAcPreferenceChange={setAcPreference}
              onPromoApplied={setPromoApplication}
            />
          )}
        </ScrollView>

        <View
          style={[
            styles.footer,
            {
              borderTopColor: theme.colors.border,
              paddingBottom: insets.bottom + spacing.md,
              backgroundColor: theme.colors.card,
            },
          ]}>
          <Button
            label={dropoff ? confirmLabel : 'Select a destination'}
            fullWidth
            loading={booking}
            disabled={!dropoff || serviceBlocked}
            onPress={handleBook}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  mapWrap: { width: '100%' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sheet: { flex: 1, borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl },
  scroll: { flex: 1 },
  title: { marginVertical: spacing.sm },
  serviceRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  serviceChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  banner: { padding: spacing.md, borderRadius: radius.md, marginTop: spacing.sm },
  destCard: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
  },
  fareBox: { marginTop: spacing.lg, gap: spacing.xs },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    minHeight: 48,
  },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
