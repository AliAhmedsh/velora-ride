import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@components/atoms/Button';
import { VeloraText } from '@components/atoms/VeloraText';
import { RideMap } from '@components/organisms/RideMap';
import { useTheme } from '@hooks/useTheme';
import { useAppDispatch, useAppSelector } from '@hooks/useAppDispatch';
import { cancelRide, clearCompletedRide } from '@store';
import { MainStackParamList } from '@navigation/types';
import { spacing, radius, shadow } from '@theme/spacing';
import { formatFare } from '@utils/locations';

type Props = NativeStackScreenProps<MainStackParamList, 'RideStatus'>;

const STATUS_LABELS: Record<string, string> = {
  searching: 'Finding your driver...',
  driver_assigned: 'Driver assigned',
  driver_arriving: 'Driver is on the way',
  in_progress: 'Trip in progress',
  completed: 'Trip completed',
  cancelled: 'Trip cancelled',
};

export function RideStatusScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const ride = useAppSelector(state => state.ride.activeRide);

  if (!ride) {
    navigation.replace('MainTabs');
    return null;
  }

  const isSearching = ride.status === 'searching';
  const isCompleted = ride.status === 'completed';
  const showDriver = ride.driverName && !isSearching;

  const handleCancel = async () => {
    await dispatch(cancelRide());
    navigation.replace('MainTabs');
  };

  const handleDone = async () => {
    await dispatch(clearCompletedRide());
    navigation.replace('MainTabs');
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <View style={styles.mapWrap}>
        <RideMap pickup={ride.pickup} dropoff={ride.dropoff} showRoute />
      </View>

      <View
        style={[
          styles.sheet,
          shadow.lg,
          {
            backgroundColor: theme.colors.card,
            paddingBottom: insets.bottom + spacing.lg,
          },
        ]}>
        <VeloraText variant="h3" style={styles.statusTitle}>
          {STATUS_LABELS[ride.status] ?? ride.status}
        </VeloraText>

        <View style={styles.route}>
          <VeloraText variant="bodyMedium">{ride.pickup.address}</VeloraText>
          <VeloraText variant="caption" color={theme.colors.textSecondary}>
            → {ride.dropoff.address}
          </VeloraText>
        </View>

        <View style={[styles.fareRow, { borderColor: theme.colors.border }]}>
          <VeloraText variant="bodyMedium">Fare</VeloraText>
          <VeloraText variant="h3" color={theme.colors.primary}>{formatFare(ride.fare)}</VeloraText>
        </View>

        {showDriver && (
          <View style={[styles.driverCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <VeloraText variant="bodyMedium">{ride.driverName}</VeloraText>
            <VeloraText variant="caption" color={theme.colors.textSecondary}>
              {ride.driverRating} ★ · Premium driver
            </VeloraText>
          </View>
        )}

        {isSearching && (
          <Button label="Cancel request" variant="outline" fullWidth onPress={handleCancel} />
        )}

        {isCompleted && (
          <Button label="Done" fullWidth onPress={handleDone} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  mapWrap: { flex: 1 },
  sheet: {
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
  },
  statusTitle: { marginBottom: spacing.md },
  route: { marginBottom: spacing.md },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  driverCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
});
