import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigator } from './MainNavigator';
import { BookRideScreen } from '@features/ride/screens/BookRideScreen';
import { RideStatusScreen } from '@features/ride/screens/RideStatusScreen';
import { MainStackParamList } from './types';
import { useRideSync } from '@hooks/useRideSync';
import { useAppSelector } from '@hooks/useAppDispatch';

const Stack = createNativeStackNavigator<MainStackParamList>();

function ActiveRideRedirect() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const activeRide = useAppSelector(state => state.ride.activeRide);

  useEffect(() => {
    if (activeRide && activeRide.status !== 'cancelled') {
      navigation.navigate('RideStatus');
    }
  }, [activeRide, navigation]);

  return null;
}

export function MainStackNavigator() {
  useRideSync();

  return (
    <>
      <ActiveRideRedirect />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainNavigator} />
        <Stack.Screen name="BookRide" component={BookRideScreen} />
        <Stack.Screen name="RideStatus" component={RideStatusScreen} />
      </Stack.Navigator>
    </>
  );
}
