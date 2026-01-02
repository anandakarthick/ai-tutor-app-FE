/**
 * AI Tutor App
 * Main entry point with Push Notifications, E2E Encryption, and API integration
 */

import React, {useEffect} from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {AppNavigator} from './src/navigation/AppNavigator';
import {AuthProvider, StudentProvider} from './src/context';
import {Colors} from './src/constants/theme';
import NotificationService from './src/services/NotificationService';
import {encryptionService} from './src/services/EncryptionService';
import {encryptedApiClient} from './src/services/api';

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

  // Initialize E2E Encryption
  useEffect(() => {
    const initializeEncryption = async () => {
      try {
        console.log('🔐 Initializing E2E Encryption...');
        
        // Initialize encryption service
        await encryptionService.initialize();
        
        // Perform handshake with server
        const handshakeSuccess = await encryptedApiClient.performHandshake();
        
        if (handshakeSuccess) {
          console.log('✅ E2E Encryption initialized successfully');
        } else {
          console.log('⚠️ E2E handshake failed, continuing without encryption');
        }
      } catch (error) {
        console.error('❌ Error initializing encryption:', error);
        // App continues to work without encryption
      }
    };

    initializeEncryption();
  }, []);

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
        });

        // Set up notification opened handler
        NotificationService.onNotificationOpened((message) => {
          console.log('🔓 Notification opened in App:', message);
        });

        console.log('✅ Push Notifications initialized successfully');
      } catch (error) {
        console.error('❌ Error initializing push notifications:', error);
      }
    };

    initializeNotifications();

    return () => {
      NotificationService.cleanup();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StudentProvider>
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
        </StudentProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
