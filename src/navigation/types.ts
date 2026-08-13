export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  History: undefined;
  Wallet: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  BookRide: undefined;
  BookC2C: undefined;
  BookRental: undefined;
  RideStatus: undefined;
  RideOffers: { rideId?: string } | undefined;
  Chat: { rideId?: string } | undefined;
  Notifications: undefined;
  RateRide: { rideId: string; driverId?: string };
  Support: undefined;
  Receipt: { rideId: string };
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};
