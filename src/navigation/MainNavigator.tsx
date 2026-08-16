import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '@features/home/screens/HomeScreen';
import { HistoryScreen } from '@features/history/screens/HistoryScreen';
import { WalletScreen } from '@features/wallet/screens/WalletScreen';
import { ProfileScreen } from '@features/profile/screens/ProfileScreen';
import { MainTabParamList } from './types';
import { CustomTabBar } from './CustomTabBar';
import { useTheme } from '@hooks/useTheme';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        lazy: false,
        sceneStyle: { backgroundColor: theme.colors.background },
      }}
      tabBar={props => <CustomTabBar {...props} />}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
