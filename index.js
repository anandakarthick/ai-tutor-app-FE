/**
 * @format
 */

import {AppRegistry} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import {name as appName} from './app.json';

/**
 * Background Message Handler
 * This runs when the app is in the background or killed
 * Must be registered BEFORE AppRegistry.registerComponent
 */
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('📬 Background notification received:', remoteMessage);

  // Handle the background message here
  // Note: You can't navigate from here directly
  // Store data for the app to handle when it opens

  const {notification, data} = remoteMessage;

  if (data) {
    // Log notification data for debugging
    console.log('📋 Notification data:', data);

    // You can perform background tasks here like:
    // - Update local storage
    // - Sync data
    // - Update badges
  }

  // Return a promise (required by Firebase)
  return Promise.resolve();
});

/**
 * Handle notification opened from quit state
 * Check when app starts if it was opened from a notification
 */
messaging()
  .getInitialNotification()
  .then(remoteMessage => {
    if (remoteMessage) {
      console.log(
        '🚀 App opened from notification (quit state):',
        remoteMessage,
      );
      // The app will handle navigation once it's mounted
    }
  });

AppRegistry.registerComponent(appName, () => App);
