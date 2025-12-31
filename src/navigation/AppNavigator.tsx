/**
 * App Navigator
 * Root navigation container
 */

import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {useAuth} from '../context/AuthContext';
import {AuthNavigator} from './AuthNavigator';
import {MainTabNavigator} from './MainTabNavigator';
import {DoubtScreen} from '../screens/main/DoubtScreen';
import type {RootStackParamList} from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const {isAuthenticated} = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen
            name="Doubt"
            component={DoubtScreen}
            options={{
              animation: 'slide_from_bottom',
              presentation: 'modal',
            }}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
