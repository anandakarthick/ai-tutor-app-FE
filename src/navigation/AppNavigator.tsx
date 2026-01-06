/**
 * App Navigator
 * Root navigation container with auth state handling
 */

import React from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {useAuth} from '../context';
import {AuthNavigator} from './AuthNavigator';
import {MainTabNavigator} from './MainTabNavigator';
import {DoubtScreen, StudyPlanScreen} from '../screens/main';
import {SubjectDetailScreen, ChapterScreen, LessonScreen} from '../screens/learn';
import {QuizTakingScreen} from '../screens/quiz';
import {NotificationSettingsScreen} from '../screens/settings';
import {SubscriptionScreen} from '../screens/subscription';
import {useThemeColor} from '../hooks/useThemeColor';
import type {RootStackParamList} from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Loading screen component
function LoadingScreen() {
  const background = useThemeColor({}, 'background');
  const primary = useThemeColor({}, 'primary');
  
  return (
    <View style={[styles.loadingContainer, {backgroundColor: background}]}>
      <ActivityIndicator size="large" color={primary} />
    </View>
  );
}

export function AppNavigator() {
  const {isAuthenticated, isLoading} = useAuth();

  // Show loading screen while checking auth state
  if (isLoading) {
    return <LoadingScreen />;
  }

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
          <Stack.Screen
            name="SubjectDetail"
            component={SubjectDetailScreen}
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="Chapter"
            component={ChapterScreen}
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="Lesson"
            component={LessonScreen}
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="StudyPlan"
            component={StudyPlanScreen}
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="QuizTaking"
            component={QuizTakingScreen}
            options={{
              animation: 'slide_from_right',
              gestureEnabled: false, // Prevent swipe back during quiz
            }}
          />
          <Stack.Screen
            name="NotificationSettings"
            component={NotificationSettingsScreen}
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="Subscription"
            component={SubscriptionScreen}
            options={{
              animation: 'slide_from_right',
            }}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
