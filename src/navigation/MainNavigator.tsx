import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '@features/home/screens/HomeScreen';
import { HistoryScreen } from '@features/history/screens/HistoryScreen';
import { WalletScreen } from '@features/wallet/screens/WalletScreen';
import { ProfileScreen } from '@features/profile/screens/ProfileScreen';
import { MainTabParamList } from './types';
import { CustomTabBar } from './CustomTabBar';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={props => <CustomTabBar {...props} />}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
