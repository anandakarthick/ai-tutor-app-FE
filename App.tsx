/**
 * AI Tutor App
 * Main entry point with Push Notifications
 */

import React, {useEffect} from 'react';
import {StatusBar, useColorScheme, Alert, Platform} from 'react-native';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {AppNavigator} from './src/navigation/AppNavigator';
import {AuthProvider} from './src/context/AuthContext';
import {Colors} from './src/constants/theme';
import NotificationService from './src/services/NotificationService';

// Custom themes with vibrant colors
const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.primary,
    background: Colors.light.background,
    card: Colors.light.card,
    text: Colors.light.text,
    border: Colors.light.border,
    notification: Colors.light.accent,
  },
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.primary,
    background: Colors.dark.background,
    card: Colors.dark.card,
    text: Colors.dark.text,
    border: Colors.dark.border,
    notification: Colors.dark.accent,
  },
};

function App(): React.JSX.Element {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Initialize Push Notifications
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        console.log('🔔 Initializing Push Notifications...');
        
        // Initialize the notification service
        await NotificationService.initialize();

        // Subscribe to general topics
        await NotificationService.subscribeToTopic('all_users');
        await NotificationService.subscribeToTopic('announcements');

        // Set up foreground notification handler
        NotificationService.onNotification((message) => {
          console.log('📬 Foreground notification in App:', message);
          // The notification will be displayed by the service
        });

        // Set up notification opened handler
        NotificationService.onNotificationOpened((message) => {
          console.log('🔓 Notification opened in App:', message);
          // Navigation will be handled by useNotification hook in screens
        });

        console.log('✅ Push Notifications initialized successfully');
      } catch (error) {
        console.error('❌ Error initializing push notifications:', error);
      }
    };

    initializeNotifications();

    // Cleanup on unmount
    return () => {
      NotificationService.cleanup();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={
            isDark ? Colors.dark.background : Colors.light.background
          }
          translucent={false}
        />
        <NavigationContainer theme={isDark ? CustomDarkTheme : CustomLightTheme}>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
