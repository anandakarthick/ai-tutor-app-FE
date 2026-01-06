/**
 * App Navigator
 * Root navigation container with auth state handling
 */

import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
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
import {Icon} from '../components/ui';
import {BorderRadius, FontSizes, Spacing} from '../constants/theme';
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
  const {isAuthenticated, isLoading, sessionTerminated, clearSessionTerminated} = useAuth();
  
  const card = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const primary = useThemeColor({}, 'primary');
  const warning = useThemeColor({}, 'warning');

  // Show loading screen while checking auth state
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
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

      {/* Session Terminated Modal */}
      <Modal
        visible={sessionTerminated}
        transparent
        animationType="fade"
        onRequestClose={clearSessionTerminated}>
        <View style={styles.modalOverlay}>
          <View style={[styles.sessionModal, {backgroundColor: card}]}>
            {/* Icon */}
            <View style={[styles.sessionIconContainer, {backgroundColor: `${warning}15`}]}>
              <Icon name="alert-circle" size={48} color={warning} />
            </View>

            {/* Title */}
            <Text style={[styles.sessionTitle, {color: text}]}>
              Session Ended
            </Text>

            {/* Message */}
            <Text style={[styles.sessionMessage, {color: textSecondary}]}>
              You have been logged out because you signed in on another device.
            </Text>
            <Text style={[styles.sessionSubMessage, {color: textMuted}]}>
              Only one device can be active at a time for security purposes.
            </Text>

            {/* Info Box */}
            <View style={[styles.sessionInfoBox, {backgroundColor: `${primary}10`}]}>
              <Icon name="shield" size={20} color={primary} />
              <Text style={[styles.sessionInfoText, {color: textSecondary}]}>
                This keeps your account secure
              </Text>
            </View>

            {/* Button */}
            <TouchableOpacity
              style={[styles.sessionButton, {backgroundColor: primary}]}
              onPress={clearSessionTerminated}>
              <Text style={styles.sessionButtonText}>Continue to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Session Terminated Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  sessionModal: {
    width: '100%',
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    alignItems: 'center',
  },
  sessionIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  sessionTitle: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  sessionMessage: {
    fontSize: FontSizes.base,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xs,
  },
  sessionSubMessage: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  sessionInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    width: '100%',
    justifyContent: 'center',
  },
  sessionInfoText: {
    fontSize: FontSizes.sm,
  },
  sessionButton: {
    width: '100%',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  sessionButtonText: {
    color: '#FFF',
    fontSize: FontSizes.base,
    fontWeight: '700',
  },
});
