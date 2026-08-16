import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@components/atoms/Button';
import { ScreenHeader } from '@components/molecules/ScreenHeader';
import { VeloraText } from '@components/atoms/VeloraText';
import { useTheme } from '@hooks/useTheme';
import { useAppDispatch, useAppSelector } from '@hooks/useAppDispatch';
import { syncRideState } from '@store';
import { MainStackParamList } from '@navigation/types';
import { spacing, radius, shadow } from '@theme/spacing';
import { formatFare } from '../../../services/fareEngine';
import {
  RideOffer,
  acceptRideOffer,
  fetchRideOffers,
  rejectRideOffer,
  subscribeToRideOffers,
} from '../../../services/offerService';

type Props = NativeStackScreenProps<MainStackParamList, 'RideOffers'>;

export function RideOffersScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const ride = useAppSelector(state => state.ride.activeRide);
  const rideId = route.params?.rideId ?? ride?.id;
  const [offers, setOffers] = useState<RideOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!rideId) return;
    try {
      const data = await fetchRideOffers(rideId);
      setOffers(data);
    } catch {
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }, [rideId]);

  useEffect(() => {
    load();
    if (!rideId) return;
    const unsubscribe = subscribeToRideOffers(rideId, load);
    return () => {
      unsubscribe();
    };
  }, [rideId, load]);

  if (!rideId) {
    return (
      <View style={[styles.flex, styles.center, { backgroundColor: theme.colors.background }]}>
        <VeloraText variant="body">No active ride to negotiate.</VeloraText>
      </View>
    );
  }

  const handleAccept = async (offer: RideOffer) => {
    setBusyId(offer.id);
    try {
      await acceptRideOffer(offer);
      await dispatch(syncRideState());
      navigation.replace('RideStatus');
    } catch (e: any) {
      Alert.alert('Could not accept offer', e?.message ?? 'Try again');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (offer: RideOffer) => {
    setBusyId(offer.id);
    try {
      await rejectRideOffer(offer.id);
      await load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <View style={{ paddingHorizontal: spacing.xxl, paddingTop: insets.top + spacing.sm }}>
        <ScreenHeader
          title="Driver offers"
          subtitle="Compare fares from nearby drivers and pick the best one."
          onBack={() => navigation.goBack()}
        />
      </View>

      <FlatList
        data={offers}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={load}
        ListEmptyComponent={
          !loading ? (
            <VeloraText variant="body" color={theme.colors.textMuted} style={styles.empty}>
              Waiting for drivers to send offers...
            </VeloraText>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={[styles.card, shadow.sm, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.cardTop}>
              <View>
                <VeloraText variant="bodyMedium">{item.driverName ?? 'Driver'}</VeloraText>
                {item.driverRating ? (
                  <VeloraText variant="caption" color={theme.colors.textSecondary}>{item.driverRating} ★</VeloraText>
                ) : null}
              </View>
              <VeloraText variant="h3" color={theme.colors.primary}>{formatFare(item.offeredFare)}</VeloraText>
            </View>
            {item.etaMinutes ? (
              <VeloraText variant="caption" color={theme.colors.textSecondary}>{item.etaMinutes} min away</VeloraText>
            ) : null}
            {item.message ? <VeloraText variant="caption" style={styles.msg}>"{item.message}"</VeloraText> : null}
            <View style={styles.actions}>
              <Button
                label="Decline"
                variant="outline"
                onPress={() => handleReject(item)}
                loading={busyId === item.id}
                style={styles.flexBtn}
              />
              <View style={styles.gap} />
              <Button
                label="Accept"
                onPress={() => handleAccept(item)}
                loading={busyId === item.id}
                style={styles.flexBtn}
              />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxl },
  empty: { textAlign: 'center', marginTop: spacing.huge },
  card: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, marginBottom: spacing.md },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  msg: { marginTop: spacing.sm },
  actions: { flexDirection: 'row', marginTop: spacing.md },
  flexBtn: { flex: 1 },
  gap: { width: spacing.md },
});
