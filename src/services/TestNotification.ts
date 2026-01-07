/**
 * Test Notification Utility
 * Use this to test local notifications during development
 */

import {Platform, Alert} from 'react-native';
import NotificationService from './NotificationService';

// Try to import notifee
let notifee: any = null;
try {
  notifee = require('@notifee/react-native').default;
} catch (e) {
  console.log('Notifee not available');
}

/**
 * Send a test local notification
 */
export async function sendTestNotification(
  title: string = 'Test Notification',
  body: string = 'This is a test notification from the app',
  data: Record<string, string> = {},
): Promise<void> {
  try {
    if (!notifee) {
      Alert.alert('Test Notification', `${title}\n\n${body}`);
      return;
    }

    // Create channel for Android
    const channelId = await notifee.createChannel({
      id: 'app_notification_channel',
      name: 'App Notifications',
      importance: 4, // HIGH
      vibration: true,
      sound: 'default',
    });

    // Display notification
    await notifee.displayNotification({
      title,
      body,
      android: {
        channelId,
        smallIcon: 'ic_launcher',
        color: '#F97316',
        pressAction: {
          id: 'default',
        },
        importance: 4,
      },
      data,
    });

    console.log('✅ Test notification sent');
  } catch (error) {
    console.error('❌ Error sending test notification:', error);
    Alert.alert('Error', 'Failed to send test notification');
  }
}

/**
 * Send different types of test notifications
 */
export const TestNotifications = {
  studyReminder: () =>
    sendTestNotification(
      '📚 Time to Study!',
      'Your daily study session is about to begin. Start learning now!',
      {type: 'reminder', screen: 'Home'},
    ),

  newLesson: () =>
    sendTestNotification(
      '🎉 New Lesson Available!',
      'Chapter 5: Trigonometry is now available. Start learning!',
      {type: 'lesson', screen: 'Learn', subject: 'Mathematics'},
    ),

  quizResult: () =>
    sendTestNotification(
      '📝 Quiz Results Are In!',
      'You scored 85% on the Science quiz. Great job!',
      {type: 'quiz', screen: 'Quizzes'},
    ),

  achievement: () =>
    sendTestNotification(
      '🏆 New Achievement Unlocked!',
      'You earned the "7 Day Streak" badge. Keep it up!',
      {type: 'achievement', screen: 'Profile'},
    ),

  streakReminder: () =>
    sendTestNotification(
      '🔥 Don\'t Break Your Streak!',
      'Complete one lesson today to maintain your 7-day streak.',
      {type: 'reminder', screen: 'Home'},
    ),
};

/**
 * Get FCM Token for testing
 */
export async function getFCMToken(): Promise<string | null> {
  const token = await NotificationService.getStoredToken();
  if (token) {
    console.log('📱 FCM Token:', token);
    return token;
  }
  return null;
}
