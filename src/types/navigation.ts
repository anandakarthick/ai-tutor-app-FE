/**
 * Navigation Types
 */

import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';

// Root Stack
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Doubt: {subject?: string; topic?: string};
  LearningSession: {
    topicId: string;
    topicTitle?: string;
    subject?: string;
    chapter?: string;
  };
};

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  VerifyOTP: {phone?: string; email?: string};
  Onboarding: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  Home: undefined;
  Learn: undefined;
  Quizzes: undefined;
  Progress: undefined;
  Profile: undefined;
};

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<AuthStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

// Declare global navigation types
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
