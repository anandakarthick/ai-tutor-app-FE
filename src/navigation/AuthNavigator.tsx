/**
 * Auth Navigator
 * Authentication flow navigation
 */

import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {LoginScreen} from '../screens/auth/LoginScreen';
import {VerifyOTPScreen} from '../screens/auth/VerifyOTPScreen';
import {RegisterScreen} from '../screens/auth/RegisterScreen';
import {SelectPlanScreen} from '../screens/auth/SelectPlanScreen';
import {PaymentScreen} from '../screens/auth/PaymentScreen';
import {OnboardingScreen} from '../screens/auth/OnboardingScreen';
import type {AuthStackParamList} from '../types/navigation';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="SelectPlan" component={SelectPlanScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    </Stack.Navigator>
  );
}
