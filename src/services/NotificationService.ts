/**
 * Firebase Cloud Messaging Notification Service
 * Handles both foreground and background notifications
 */

import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import {Platform, PermissionsAndroid, Alert, Linking} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Notification types for the app
export interface NotificationData {
  type?: 'lesson' | 'quiz' | 'reminder' | 'achievement' | 'general';
  screen?: string;
  id?: string;
  title?: string;
  body?: string;
  [key: string]: any;
}

export interface NotificationMessage {
  notification?: {
    title?: string;
    body?: string;
    imageUrl?: string;
  };
  data?: NotificationData;
  messageId?: string;
}

// Storage keys
const FCM_TOKEN_KEY = '@fcm_token';
const NOTIFICATION_PERMISSION_KEY = '@notification_permission';

class NotificationService {
  private static instance: NotificationService;
  private foregroundListener: (() => void) | null = null;
  private notificationOpenedListener: (() => void) | null = null;
  private tokenRefreshListener: (() => void) | null = null;
  private onNotificationCallback: ((message: NotificationMessage) => void) | null = null;
  private onNotificationOpenedCallback: ((message: NotificationMessage) => void) | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize the notification service
   */
  async initialize(): Promise<void> {
    try {
      console.log('🔔 Initializing Notification Service...');
      
      // Request permission
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        console.log('❌ Notification permission denied');
        return;
      }

      // Get FCM token
      await this.getToken();

      // Setup listeners
      this.setupForegroundListener();
      this.setupNotificationOpenedListener();
      this.setupTokenRefreshListener();

      // Check if app was opened from notification
      await this.checkInitialNotification();

      console.log('✅ Notification Service initialized');
    } catch (error) {
      console.error('❌ Error initializing notifications:', error);
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        // Android 13+ requires POST_NOTIFICATIONS permission
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('❌ POST_NOTIFICATIONS permission denied');
            return false;
          }
        }
      }

      // Request Firebase messaging permission
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('✅ Notification permission granted:', authStatus);
        await AsyncStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'granted');
      } else {
        console.log('❌ Notification permission denied');
        await AsyncStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'denied');
      }

      return enabled;
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Get FCM token
   */
  async getToken(): Promise<string | null> {
    try {
      // Check if messaging is supported
      const isSupported = await messaging().isDeviceRegisteredForRemoteMessages;
      if (!isSupported) {
        await messaging().registerDeviceForRemoteMessages();
      }

      const token = await messaging().getToken();
      
      if (token) {
        console.log('📱 FCM Token:', token);
        await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
        
        // TODO: Send token to your backend server
        await this.sendTokenToServer(token);
      }

      return token;
    } catch (error) {
      console.error('❌ Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Send token to backend server
   */
  private async sendTokenToServer(token: string): Promise<void> {
    try {
      // TODO: Implement API call to send token to your backend
      console.log('📤 Sending FCM token to server:', token.substring(0, 20) + '...');
      
      // Example API call:
      // await fetch('https://your-api.com/api/notifications/register', {
      //   method: 'POST',
      //   headers: {'Content-Type': 'application/json'},
      //   body: JSON.stringify({token, platform: Platform.OS}),
      // });
    } catch (error) {
      console.error('❌ Error sending token to server:', error);
    }
  }

  /**
   * Setup foreground notification listener
   */
  private setupForegroundListener(): void {
    // Remove existing listener
    if (this.foregroundListener) {
      this.foregroundListener();
    }

    // Listen for notifications when app is in foreground
    this.foregroundListener = messaging().onMessage(async remoteMessage => {
      console.log('📬 Foreground notification received:', remoteMessage);
      
      // Call the callback if set
      if (this.onNotificationCallback) {
        this.onNotificationCallback(remoteMessage as NotificationMessage);
      }

      // Show local notification (since foreground notifications don't show automatically)
      this.displayLocalNotification(remoteMessage);
    });
  }

  /**
   * Setup notification opened listener (when app is in background)
   */
  private setupNotificationOpenedListener(): void {
    // Remove existing listener
    if (this.notificationOpenedListener) {
      this.notificationOpenedListener();
    }

    // When user taps on notification while app is in background
    this.notificationOpenedListener = messaging().onNotificationOpenedApp(
      remoteMessage => {
        console.log('🔓 Notification opened (background):', remoteMessage);
        
        if (this.onNotificationOpenedCallback) {
          this.onNotificationOpenedCallback(remoteMessage as NotificationMessage);
        }

        // Handle navigation based on notification data
        this.handleNotificationNavigation(remoteMessage.data as NotificationData);
      },
    );
  }

  /**
   * Setup token refresh listener
   */
  private setupTokenRefreshListener(): void {
    // Remove existing listener
    if (this.tokenRefreshListener) {
      this.tokenRefreshListener();
    }

    // When token is refreshed
    this.tokenRefreshListener = messaging().onTokenRefresh(async token => {
      console.log('🔄 FCM Token refreshed:', token);
      await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
      await this.sendTokenToServer(token);
    });
  }

  /**
   * Check if app was opened from a notification (when app was killed)
   */
  private async checkInitialNotification(): Promise<void> {
    try {
      const remoteMessage = await messaging().getInitialNotification();
      
      if (remoteMessage) {
        console.log('🚀 App opened from notification (killed state):', remoteMessage);
        
        if (this.onNotificationOpenedCallback) {
          this.onNotificationOpenedCallback(remoteMessage as NotificationMessage);
        }

        // Handle navigation
        this.handleNotificationNavigation(remoteMessage.data as NotificationData);
      }
    } catch (error) {
      console.error('❌ Error checking initial notification:', error);
    }
  }

  /**
   * Display local notification for foreground messages
   */
  private async displayLocalNotification(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  ): Promise<void> {
    try {
      const {notification, data} = remoteMessage;
      
      if (!notification) return;

      // Using Notifee for better local notification control
      // If Notifee is not available, show an Alert
      try {
        const notifee = require('@notifee/react-native').default;
        
        // Create a channel (required for Android)
        const channelId = await notifee.createChannel({
          id: 'ai_tutor_channel',
          name: 'AI Tutor Notifications',
          importance: 4, // HIGH
          vibration: true,
          sound: 'default',
        });

        // Display notification
        await notifee.displayNotification({
          title: notification.title || 'AI Tutor',
          body: notification.body || '',
          android: {
            channelId,
            smallIcon: 'ic_launcher',
            color: '#F97316',
            pressAction: {
              id: 'default',
            },
            importance: 4,
          },
          data: data as {[key: string]: string},
        });
      } catch (notifeeError) {
        // Fallback to Alert if Notifee is not available
        Alert.alert(
          notification.title || 'AI Tutor',
          notification.body || '',
          [
            {text: 'Dismiss', style: 'cancel'},
            {
              text: 'View',
              onPress: () => this.handleNotificationNavigation(data as NotificationData),
            },
          ],
        );
      }
    } catch (error) {
      console.error('❌ Error displaying local notification:', error);
    }
  }

  /**
   * Handle navigation based on notification data
   */
  private handleNotificationNavigation(data?: NotificationData): void {
    if (!data) return;

    console.log('🧭 Handling notification navigation:', data);

    // Navigation will be handled by the app component
    // Store the navigation intent for the app to pick up
    AsyncStorage.setItem('@pending_notification', JSON.stringify(data));
  }

  /**
   * Set callback for foreground notifications
   */
  onNotification(callback: (message: NotificationMessage) => void): void {
    this.onNotificationCallback = callback;
  }

  /**
   * Set callback for notification opened events
   */
  onNotificationOpened(callback: (message: NotificationMessage) => void): void {
    this.onNotificationOpenedCallback = callback;
  }

  /**
   * Get pending notification (for navigation after app startup)
   */
  async getPendingNotification(): Promise<NotificationData | null> {
    try {
      const pending = await AsyncStorage.getItem('@pending_notification');
      if (pending) {
        await AsyncStorage.removeItem('@pending_notification');
        return JSON.parse(pending);
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting pending notification:', error);
      return null;
    }
  }

  /**
   * Subscribe to a topic
   */
  async subscribeToTopic(topic: string): Promise<void> {
    try {
      await messaging().subscribeToTopic(topic);
      console.log(`✅ Subscribed to topic: ${topic}`);
    } catch (error) {
      console.error(`❌ Error subscribing to topic ${topic}:`, error);
    }
  }

  /**
   * Unsubscribe from a topic
   */
  async unsubscribeFromTopic(topic: string): Promise<void> {
    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log(`✅ Unsubscribed from topic: ${topic}`);
    } catch (error) {
      console.error(`❌ Error unsubscribing from topic ${topic}:`, error);
    }
  }

  /**
   * Get stored FCM token
   */
  async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(FCM_TOKEN_KEY);
    } catch (error) {
      console.error('❌ Error getting stored token:', error);
      return null;
    }
  }

  /**
   * Check if notifications are enabled
   */
  async areNotificationsEnabled(): Promise<boolean> {
    try {
      const permission = await AsyncStorage.getItem(NOTIFICATION_PERMISSION_KEY);
      return permission === 'granted';
    } catch (error) {
      return false;
    }
  }

  /**
   * Open app notification settings
   */
  openNotificationSettings(): void {
    if (Platform.OS === 'android') {
      Linking.openSettings();
    }
  }

  /**
   * Cleanup listeners
   */
  cleanup(): void {
    if (this.foregroundListener) {
      this.foregroundListener();
      this.foregroundListener = null;
    }
    if (this.notificationOpenedListener) {
      this.notificationOpenedListener();
      this.notificationOpenedListener = null;
    }
    if (this.tokenRefreshListener) {
      this.tokenRefreshListener();
      this.tokenRefreshListener = null;
    }
  }
}

export default NotificationService.getInstance();
