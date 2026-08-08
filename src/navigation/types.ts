export type AuthStackParamList = {
  Welcome: undefined;
  Phone: undefined;
  OTP: { phone: string };
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
  RideStatus: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};
