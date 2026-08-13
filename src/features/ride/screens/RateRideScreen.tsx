import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@components/atoms/Button';
import { VeloraText } from '@components/atoms/VeloraText';
import { useTheme } from '@hooks/useTheme';
import { MainStackParamList } from '@navigation/types';
import { spacing } from '@theme/spacing';
import { submitRating } from '../../../services/ratingService';

type Props = NativeStackScreenProps<MainStackParamList, 'RateRide'>;

export function RateRideScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { rideId, driverId } = route.params;
  const [score, setScore] = useState(5);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!driverId) {
      navigation.replace('MainTabs');
      return;
    }
    setLoading(true);
    try {
      await submitRating(rideId, driverId, { score, cleanliness: score, driving: score, behaviour: score });
      navigation.replace('MainTabs');
    } catch (e) {
      Alert.alert('Rating failed', e instanceof Error ? e.message : 'Try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top + spacing.xxxl }]}>
      <VeloraText variant="hero">Rate your trip</VeloraText>
      <VeloraText variant="body" color={theme.colors.textSecondary} style={styles.sub}>
        Help us maintain premium quality
      </VeloraText>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map(n => (
          <Button key={n} label={n <= score ? '★' : '☆'} variant="ghost" onPress={() => setScore(n)} />
        ))}
      </View>
      <Button label="Submit rating" fullWidth loading={loading} onPress={handleSubmit} />
      <Button label="Skip" variant="ghost" fullWidth onPress={() => navigation.replace('MainTabs')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.xxl },
  sub: { marginBottom: spacing.xxl },
  stars: { flexDirection: 'row', justifyContent: 'center', marginBottom: spacing.xxl },
});
