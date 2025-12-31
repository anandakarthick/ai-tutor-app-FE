/**
 * Navigation Types
 */

import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import type {CompositeScreenProps} from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  VerifyOTP: {phone: string};
  Register: {phone: string};
  SelectPlan: {userId: string};
  Payment: {planId: string; planName: string; price: number; userId: string};
  Onboarding: {userId: string};
};

// Main Tab Navigator
export type MainTabParamList = {
  Home: undefined;
  Learn: undefined;
  Quizzes: undefined;
  Progress: undefined;
  Profile: undefined;
};

// Root Stack (contains Auth and Main)
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Doubt: undefined;
};

// Screen props types
export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
