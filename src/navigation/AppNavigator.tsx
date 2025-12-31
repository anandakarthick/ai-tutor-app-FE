/**
 * App Navigator
 * Main navigation structure
 */

import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {AuthNavigator} from './AuthNavigator';
import {MainTabNavigator} from './MainTabNavigator';
import {DoubtScreen} from '../screens/main/DoubtScreen';
import type {RootStackParamList} from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  // TODO: Check if user is authenticated from your auth state
  const isAuthenticated = true; // Change this based on your auth state

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen
            name="Doubt"
            component={DoubtScreen}
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
