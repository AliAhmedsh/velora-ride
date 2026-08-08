import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@components/atoms/Button';
import { VeloraText } from '@components/atoms/VeloraText';
import { RideMap } from '@components/organisms/RideMap';
import { useTheme } from '@hooks/useTheme';
import { useUserLocation } from '@hooks/useUserLocation';
import { useAppDispatch } from '@hooks/useAppDispatch';
import { requestRide } from '@store';
import { MainStackParamList } from '@navigation/types';
import { spacing, radius, shadow } from '@theme/spacing';
import { PRESET_DESTINATIONS, formatFare, estimateFare } from '@utils/locations';
import type { RideLocation } from '../../../types/ride';

type Props = NativeStackScreenProps<MainStackParamList, 'BookRide'>;

export function BookRideScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { location: pickup, loading } = useUserLocation();
  const [dropoff, setDropoff] = useState<RideLocation | null>(null);
  const [booking, setBooking] = useState(false);

  const fare = dropoff ? estimateFare(pickup, dropoff) : 0;

  const handleBook = async () => {
    if (!dropoff) return;
    setBooking(true);
    await dispatch(requestRide({ pickup, dropoff }));
    setBooking(false);
    navigation.replace('RideStatus');
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <View style={styles.mapWrap}>
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : (
          <RideMap pickup={pickup} dropoff={dropoff} />
        )}
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
        <View style={styles.sheetHeader}>
          <Pressable onPress={() => navigation.goBack()}>
            <VeloraText variant="label" color={theme.colors.primary}>← Back</VeloraText>
          </Pressable>
          <VeloraText variant="h3">Book a ride</VeloraText>
        </View>

        <VeloraText variant="caption" color={theme.colors.textSecondary} style={styles.pickupLabel}>
          Pickup: {pickup.address}
        </VeloraText>

        <VeloraText variant="label" style={styles.destTitle}>Choose destination</VeloraText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.destScroll}>
          {PRESET_DESTINATIONS.map(dest => {
            const selected = dropoff?.address === dest.address;
            return (
              <Pressable
                key={dest.id}
                onPress={() => setDropoff(dest)}
                style={[
                  styles.destChip,
                  {
                    backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
                    borderColor: selected ? theme.colors.primary : theme.colors.border,
                  },
                ]}>
                <VeloraText
                  variant="caption"
                  color={selected ? theme.colors.textOnPrimary : theme.colors.text}>
                  {dest.address}
                </VeloraText>
              </Pressable>
            );
          })}
        </ScrollView>

        {dropoff && (
          <View style={[styles.fareRow, { borderColor: theme.colors.border }]}>
            <VeloraText variant="bodyMedium">Estimated fare</VeloraText>
            <VeloraText variant="h3" color={theme.colors.primary}>{formatFare(fare)}</VeloraText>
          </View>
        )}

        <Button
          label="Confirm ride"
          fullWidth
          loading={booking}
          disabled={!dropoff}
          onPress={handleBook}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  mapWrap: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sheet: {
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  pickupLabel: { marginBottom: spacing.lg },
  destTitle: { marginBottom: spacing.sm },
  destScroll: { marginBottom: spacing.lg },
  destChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    borderTopWidth: 1,
  },
});
