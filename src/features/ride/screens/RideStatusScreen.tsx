import React, { useEffect } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@components/atoms/Button';
import { VeloraText } from '@components/atoms/VeloraText';
import { RideMap } from '@components/organisms/RideMap';
import { useTheme } from '@hooks/useTheme';
import { useAppDispatch, useAppSelector } from '@hooks/useAppDispatch';
import { cancelRide, dismissCompletedRide } from '@store';
import { MainStackParamList } from '@navigation/types';
import { spacing, radius, shadow } from '@theme/spacing';
import { formatFare } from '../../../services/fareEngine';
import { triggerSos } from '../../../services/safetyService';

type Props = NativeStackScreenProps<MainStackParamList, 'RideStatus'>;

const STATUS_LABELS: Record<string, string> = {
  searching: 'Finding your driver...',
  driver_assigned: 'Driver assigned',
  driver_arriving: 'Driver is on the way',
  in_progress: 'Trip in progress',
  completed: 'Trip completed',
  cancelled: 'Trip cancelled',
};

const SERVICE_LABELS: Record<string, string> = {
  local: 'Local ride',
  city_to_city: 'City to City',
  rental: 'Rental',
};

export function RideStatusScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const ride = useAppSelector(state => state.ride.activeRide);

  useEffect(() => {
    if (!ride) {
      navigation.replace('MainTabs');
    }
  }, [ride, navigation]);

  if (!ride) {
    return (
      <View style={[styles.flex, styles.loading, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  const isSearching = ride.status === 'searching';
  const isCompleted = ride.status === 'completed';
  const showDriver = ride.driverName && !isSearching;

  const handleCancel = async () => {
    await dispatch(cancelRide());
    navigation.replace('MainTabs');
  };

  const handleDone = async () => {
    await dispatch(dismissCompletedRide());
    navigation.replace('RateRide', { rideId: ride.id, driverId: ride.driverId });
  };

  const handleSos = async () => {
    try {
      await triggerSos(ride.id, ride.pickup.latitude, ride.pickup.longitude);
      Alert.alert('SOS sent', 'Emergency team has been notified.');
    } catch {
      Alert.alert('SOS failed', 'Could not send alert. Call emergency services.');
    }
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <View style={styles.mapWrap}>
        <RideMap pickup={ride.pickup} dropoff={ride.dropoff} showRoute fullBleed />
      </View>

      <View style={[styles.sheet, shadow.lg, { backgroundColor: theme.colors.card, paddingBottom: insets.bottom + spacing.lg }]}>
        <VeloraText variant="caption" color={theme.colors.textSecondary}>
          {SERVICE_LABELS[ride.serviceType] ?? ride.serviceType}
        </VeloraText>
        <VeloraText variant="h3" style={styles.statusTitle}>
          {STATUS_LABELS[ride.status] ?? ride.status}
        </VeloraText>

        <View style={styles.route}>
          <VeloraText variant="bodyMedium">{ride.pickup.address}</VeloraText>
          <VeloraText variant="caption" color={theme.colors.textSecondary}>→ {ride.dropoff.address}</VeloraText>
        </View>

        <View style={[styles.fareRow, { borderColor: theme.colors.border }]}>
          <VeloraText variant="bodyMedium">Your offer</VeloraText>
          <VeloraText variant="h3" color={theme.colors.primary}>{formatFare(ride.fare)}</VeloraText>
        </View>
        {ride.recommendedFare && ride.recommendedFare < ride.fare && (
          <VeloraText variant="caption" color={theme.colors.success}>Above recommended minimum</VeloraText>
        )}

        {showDriver && (
          <View style={[styles.driverCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={styles.driverRow}>
              <View>
                <VeloraText variant="bodyMedium">{ride.driverName}</VeloraText>
                <VeloraText variant="caption" color={theme.colors.textSecondary}>
                  {ride.driverRating} ★ · Platinum driver
                </VeloraText>
              </View>
              <Pressable onPress={() => navigation.navigate('Chat', { rideId: ride.id })}>
                <VeloraText variant="label" color={theme.colors.primary}>Chat</VeloraText>
              </Pressable>
            </View>
          </View>
        )}

        {isSearching && ride.negotiationEnabled !== false && (
          <Button
            label="View driver offers"
            variant="secondary"
            fullWidth
            onPress={() => navigation.navigate('RideOffers', { rideId: ride.id })}
            style={styles.offersBtn}
          />
        )}

        <Button label="SOS Emergency" variant="outline" fullWidth onPress={handleSos} style={styles.sos} />

        {isSearching && <Button label="Cancel request" variant="outline" fullWidth onPress={handleCancel} />}
        {isCompleted && <Button label="Rate & finish" fullWidth onPress={handleDone} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loading: { alignItems: 'center', justifyContent: 'center' },
  mapWrap: { flex: 1, minHeight: 280 },
  sheet: { borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl, paddingHorizontal: spacing.xxl, paddingTop: spacing.lg },
  statusTitle: { marginBottom: spacing.md },
  route: { marginBottom: spacing.md },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderTopWidth: 1, borderBottomWidth: 1, marginBottom: spacing.sm },
  driverCard: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, marginBottom: spacing.md },
  driverRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  offersBtn: { marginBottom: spacing.md },
  sos: { marginBottom: spacing.md, borderColor: '#C45C4A' },
});
