import React from 'react';
import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { VeloraText } from '@components/atoms/VeloraText';
import { ServiceCard } from '@components/molecules/ServiceCard';
import { useTheme } from '@hooks/useTheme';
import { useAppSelector } from '@hooks/useAppDispatch';
import { MainStackParamList } from '@navigation/types';
import { spacing, radius, shadow } from '@theme/spacing';
import { formatFare } from '@utils/locations';

export function HomeScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { activeRide, history } = useAppSelector(state => state.ride);

  const recentTrips = history.slice(-2).reverse().map(ride => ({
    id: ride.id,
    from: ride.pickup.address,
    to: ride.dropoff.address,
    fare: formatFare(ride.fare),
  }));

  const goToBook = () => navigation.navigate('BookRide');

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.background]}
        style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <View style={styles.headerRow}>
          <View>
            <VeloraText variant="caption" color="rgba(250,247,242,0.75)">
              Good morning
            </VeloraText>
            <VeloraText variant="h2" color={theme.colors.textOnPrimary}>
              Ali Ahmed
            </VeloraText>
          </View>
          <View style={[styles.avatar, { backgroundColor: theme.colors.accent }]}>
            <VeloraText variant="h3" color={theme.colors.textOnPrimary}>A</VeloraText>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}>
        {activeRide && activeRide.status !== 'completed' && activeRide.status !== 'cancelled' && (
          <Pressable
            onPress={() => navigation.navigate('RideStatus')}
            style={[
              styles.activeBanner,
              shadow.sm,
              { backgroundColor: theme.colors.primary, borderColor: theme.colors.border },
            ]}>
            <VeloraText variant="label" color={theme.colors.textOnPrimary}>
              Active ride · Tap to view
            </VeloraText>
            <VeloraText variant="caption" color={theme.colors.brown200}>
              {activeRide.pickup.address} → {activeRide.dropoff.address}
            </VeloraText>
          </Pressable>
        )}

        <ServiceCard
          featured
          title="Where to?"
          subtitle="Book a premium local ride in seconds"
          icon="→"
          onPress={goToBook}
        />

        <View style={styles.serviceRow}>
          <ServiceCard
            title="City to City"
            subtitle="Inter-city travel"
            icon="◎"
            accentColor={theme.colors.accent}
            onPress={goToBook}
          />
          <View style={styles.gap} />
          <ServiceCard
            title="Rental"
            subtitle="With driver"
            icon="◆"
            accentColor={theme.colors.primaryLight}
            onPress={goToBook}
          />
        </View>

        <VeloraText variant="h3" style={styles.sectionTitle}>Recent trips</VeloraText>

        {recentTrips.length === 0 ? (
          <VeloraText variant="caption" color={theme.colors.textMuted}>
            No trips yet. Book your first ride!
          </VeloraText>
        ) : (
          recentTrips.map(trip => (
            <Pressable
              key={trip.id}
              style={[
                styles.tripCard,
                shadow.sm,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}>
              <View style={styles.tripDot} />
              <View style={styles.tripInfo}>
                <VeloraText variant="bodyMedium">{trip.from}</VeloraText>
                <VeloraText variant="caption" color={theme.colors.textSecondary}>
                  → {trip.to}
                </VeloraText>
              </View>
              <VeloraText variant="label" color={theme.colors.primary}>{trip.fare}</VeloraText>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { paddingHorizontal: spacing.xxl, paddingTop: spacing.lg },
  activeBanner: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  serviceRow: { flexDirection: 'row', marginBottom: spacing.xxl },
  gap: { width: spacing.md },
  sectionTitle: { marginBottom: spacing.lg },
  tripCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  tripDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C9A66B',
    marginRight: spacing.md,
  },
  tripInfo: { flex: 1 },
});
