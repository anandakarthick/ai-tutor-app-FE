/**
 * AI Tutor App
 * Main entry point with Push Notifications, API integration, Network handling, and Screen Security
 */

import React, {useEffect} from 'react';
import {StatusBar, useColorScheme, Platform, NativeModules} from 'react-native';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {AppNavigator} from './src/navigation/AppNavigator';
import {AuthProvider, StudentProvider, SubscriptionProvider, NetworkProvider, useNetwork} from './src/context';
import {NoInternetScreen} from './src/components/common';
import {Colors} from './src/constants/theme';
import NotificationService from './src/services/NotificationService';

const {ScreenSecurity} = NativeModules;

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

// Main App Content with Network Check
function AppContent() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const {isConnected, isNetInfoAvailable} = useNetwork();

  // Only show No Internet screen if NetInfo is available and we're disconnected
  if (isNetInfoAvailable && !isConnected) {
    return <NoInternetScreen />;
  }

  return (
    <AuthProvider>
      <StudentProvider>
        <SubscriptionProvider>
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
        </SubscriptionProvider>
      </StudentProvider>
    </AuthProvider>
  );
}

function App(): React.JSX.Element {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Initialize Screen Security (prevent screenshots/recording)
  useEffect(() => {
    const enableScreenSecurity = async () => {
      if (Platform.OS === 'android' && ScreenSecurity) {
        try {
          await ScreenSecurity.enableSecureMode();
          console.log('🛡️ Screen security enabled - Screenshots blocked');
        } catch (error) {
          console.error('❌ Failed to enable screen security:', error);
        }
      }
    };

    enableScreenSecurity();
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
      <NetworkProvider>
        <AppContent />
      </NetworkProvider>
    </SafeAreaProvider>
  );
}

export default App;
