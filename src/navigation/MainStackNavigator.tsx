import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigator } from './MainNavigator';
import { BookRideScreen } from '@features/ride/screens/BookRideScreen';
import { BookC2CScreen } from '@features/ride/screens/BookC2CScreen';
import { BookRentalScreen } from '@features/ride/screens/BookRentalScreen';
import { RideStatusScreen } from '@features/ride/screens/RideStatusScreen';
import { RideOffersScreen } from '@features/ride/screens/RideOffersScreen';
import { ChatScreen } from '@features/ride/screens/ChatScreen';
import { RateRideScreen } from '@features/ride/screens/RateRideScreen';
import { SupportScreen } from '@features/support/screens/SupportScreen';
import { ReceiptScreen } from '@features/ride/screens/ReceiptScreen';
import { NotificationsScreen } from '@features/notifications/screens/NotificationsScreen';
import { MainStackParamList } from './types';
import { useRideSync } from '@hooks/useRideSync';
import { useAppSelector } from '@hooks/useAppDispatch';
import { IN_PROGRESS_RIDE_STATUSES } from './useMainStackNavigation';

const Stack = createNativeStackNavigator<MainStackParamList>();

function MainTabsWithRideRedirect() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const isFocused = useIsFocused();
  const activeRide = useAppSelector(state => state.ride.activeRide);

  useEffect(() => {
    if (!isFocused) return;
    if (!activeRide || !IN_PROGRESS_RIDE_STATUSES.includes(activeRide.status as typeof IN_PROGRESS_RIDE_STATUSES[number])) {
      return;
    }
    navigation.navigate('RideStatus');
  }, [isFocused, activeRide?.id, activeRide?.status, navigation]);

  return <MainNavigator />;
}

export function MainStackNavigator() {
  useRideSync();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabsWithRideRedirect} />
      <Stack.Screen name="BookRide" component={BookRideScreen} />
      <Stack.Screen name="BookC2C" component={BookC2CScreen} />
      <Stack.Screen name="BookRental" component={BookRentalScreen} />
      <Stack.Screen name="RideStatus" component={RideStatusScreen} />
      <Stack.Screen name="RideOffers" component={RideOffersScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="RateRide" component={RateRideScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="Receipt" component={ReceiptScreen} />
    </Stack.Navigator>
  );
}
