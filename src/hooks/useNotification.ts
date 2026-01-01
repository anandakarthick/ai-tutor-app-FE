/**
 * Notification Hook
 * Use this hook to access notification functionality in components
 */

import {useEffect, useState, useCallback} from 'react';
import {useNavigation} from '@react-navigation/native';
import NotificationService, {
  NotificationData,
  NotificationMessage,
} from '../services/NotificationService';

interface UseNotificationReturn {
  isInitialized: boolean;
  fcmToken: string | null;
  hasPermission: boolean;
  lastNotification: NotificationMessage | null;
  requestPermission: () => Promise<boolean>;
  subscribeToTopic: (topic: string) => Promise<void>;
  unsubscribeFromTopic: (topic: string) => Promise<void>;
  openSettings: () => void;
}

export function useNotification(): UseNotificationReturn {
  const navigation = useNavigation<any>();
  const [isInitialized, setIsInitialized] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [lastNotification, setLastNotification] = useState<NotificationMessage | null>(null);

  // Initialize notification service
  useEffect(() => {
    const init = async () => {
      await NotificationService.initialize();
      
      const token = await NotificationService.getStoredToken();
      const enabled = await NotificationService.areNotificationsEnabled();
      
      setFcmToken(token);
      setHasPermission(enabled);
      setIsInitialized(true);

      // Check for pending notification (from killed state)
      const pending = await NotificationService.getPendingNotification();
      if (pending) {
        handleNotificationNavigation(pending);
      }
    };

    init();

    // Setup notification callbacks
    NotificationService.onNotification((message) => {
      console.log('📬 Notification received in hook:', message);
      setLastNotification(message);
    });

    NotificationService.onNotificationOpened((message) => {
      console.log('🔓 Notification opened in hook:', message);
      setLastNotification(message);
      if (message.data) {
        handleNotificationNavigation(message.data);
      }
    });

    return () => {
      NotificationService.cleanup();
    };
  }, []);

  // Handle navigation based on notification data
  const handleNotificationNavigation = useCallback((data: NotificationData) => {
    if (!data || !navigation) return;

    console.log('🧭 Navigating based on notification:', data);

    switch (data.type) {
      case 'lesson':
        if (data.screen === 'Lesson' && data.id) {
          navigation.navigate('Lesson', {
            lessonId: data.id,
            subject: data.subject,
            chapter: data.chapter,
            lesson: data.lessonTitle,
            subjectColor: data.subjectColor || '#F97316',
          });
        }
        break;

      case 'quiz':
        navigation.navigate('MainTabs', {screen: 'Quizzes'});
        break;

      case 'reminder':
        navigation.navigate('MainTabs', {screen: 'Home'});
        break;

      case 'achievement':
        navigation.navigate('Profile');
        break;

      default:
        // Navigate to home by default
        navigation.navigate('MainTabs', {screen: 'Home'});
        break;
    }
  }, [navigation]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const granted = await NotificationService.requestPermission();
    setHasPermission(granted);
    
    if (granted) {
      const token = await NotificationService.getToken();
      setFcmToken(token);
    }
    
    return granted;
  }, []);

  const subscribeToTopic = useCallback(async (topic: string): Promise<void> => {
    await NotificationService.subscribeToTopic(topic);
  }, []);

  const unsubscribeFromTopic = useCallback(async (topic: string): Promise<void> => {
    await NotificationService.unsubscribeFromTopic(topic);
  }, []);

  const openSettings = useCallback((): void => {
    NotificationService.openNotificationSettings();
  }, []);

  return {
    isInitialized,
    fcmToken,
    hasPermission,
    lastNotification,
    requestPermission,
    subscribeToTopic,
    unsubscribeFromTopic,
    openSettings,
  };
}
