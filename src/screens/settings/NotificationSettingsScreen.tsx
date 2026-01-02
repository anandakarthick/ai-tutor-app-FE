/**
 * Notification Settings Screen
 * Manage push notification preferences with real API
 */

import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {useNotification} from '../../hooks/useNotification';
import {settingsApi} from '../../services/api';
import type {NotificationPreferences} from '../../services/api/settings';
import {Icon} from '../../components/ui';
import {BorderRadius, FontSizes, Spacing, Shadows} from '../../constants/theme';

interface NotificationSetting {
  id: keyof NotificationPreferences;
  title: string;
  description: string;
  topic: string;
}

const NOTIFICATION_SETTINGS: NotificationSetting[] = [
  {
    id: 'studyReminders',
    title: 'Study Reminders',
    description: 'Get reminders for your daily study schedule',
    topic: 'study_reminders',
  },
  {
    id: 'quizAlerts',
    title: 'Quiz Alerts',
    description: 'Notifications about new quizzes and results',
    topic: 'quiz_alerts',
  },
  {
    id: 'achievements',
    title: 'Achievement Updates',
    description: 'Know when you earn badges and rewards',
    topic: 'achievements',
  },
  {
    id: 'newContent',
    title: 'New Content',
    description: 'Updates about new lessons and chapters',
    topic: 'new_content',
  },
  {
    id: 'tips',
    title: 'Tips & Tricks',
    description: 'Learning tips and study hacks',
    topic: 'tips',
  },
  {
    id: 'promotions',
    title: 'Promotions & Offers',
    description: 'Special discounts and subscription offers',
    topic: 'promotions',
  },
];

export function NotificationSettingsScreen() {
  const navigation = useNavigation<any>();
  const {
    hasPermission,
    fcmToken,
    requestPermission,
    subscribeToTopic,
    unsubscribeFromTopic,
    openSettings,
  } = useNotification();

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    masterEnabled: true,
    studyReminders: true,
    quizAlerts: true,
    achievements: true,
    newContent: true,
    tips: false,
    promotions: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const primary = useThemeColor({}, 'primary');
  const success = useThemeColor({}, 'success');
  const error = useThemeColor({}, 'error');

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const response = await settingsApi.getNotificationPreferences();
      if (response.success && response.data) {
        setPreferences(response.data);
      }
    } catch (err) {
      console.log('Load preferences error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPreferences();
    setRefreshing(false);
  }, []);

  const savePreferences = async (newPrefs: NotificationPreferences) => {
    try {
      setSaving(true);
      await settingsApi.updateNotificationPreferences(newPrefs);
    } catch (err) {
      console.log('Save preferences error:', err);
      Alert.alert('Error', 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleMasterToggle = async (value: boolean) => {
    if (value && !hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive updates.',
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Open Settings', onPress: openSettings},
          ],
        );
        return;
      }
    }
    
    const newPrefs = {...preferences, masterEnabled: value};
    setPreferences(newPrefs);
    await savePreferences(newPrefs);
  };

  const handleSettingToggle = async (id: keyof NotificationPreferences, value: boolean) => {
    const setting = NOTIFICATION_SETTINGS.find(s => s.id === id);
    if (!setting) return;

    try {
      // Update FCM topic subscription
      if (value) {
        await subscribeToTopic(setting.topic);
      } else {
        await unsubscribeFromTopic(setting.topic);
      }

      // Update preferences
      const newPrefs = {...preferences, [id]: value};
      setPreferences(newPrefs);
      await savePreferences(newPrefs);
    } catch (err) {
      console.error('Error toggling setting:', err);
      Alert.alert('Error', 'Failed to update notification setting');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: background}]} edges={['top']}>
        <View style={[styles.header, {borderBottomColor: border}]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="chevron-left" size={24} color={text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, {color: text}]}>Notifications</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primary} />
          <Text style={[styles.loadingText, {color: textSecondary}]}>Loading preferences...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: background}]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, {borderBottomColor: border}]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: text}]}>Notifications</Text>
        <View style={styles.headerRight}>
          {saving && <ActivityIndicator size="small" color={primary} />}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[primary]} />
        }>
        
        {/* Permission Status Card */}
        <View style={[styles.statusCard, {
          backgroundColor: hasPermission ? `${success}15` : `${error}15`,
          borderColor: hasPermission ? success : error,
        }]}>
          <View style={styles.statusContent}>
            <Icon 
              name={hasPermission ? 'check-circle' : 'alert-circle'} 
              size={24} 
              color={hasPermission ? success : error} 
            />
            <View style={styles.statusText}>
              <Text style={[styles.statusTitle, {color: hasPermission ? success : error}]}>
                {hasPermission ? 'Notifications Enabled' : 'Notifications Disabled'}
              </Text>
              <Text style={[styles.statusDescription, {color: textMuted}]}>
                {hasPermission 
                  ? 'You will receive push notifications'
                  : 'Enable notifications to stay updated'}
              </Text>
            </View>
          </View>
          {!hasPermission && (
            <TouchableOpacity
              style={[styles.enableButton, {backgroundColor: primary}]}
              onPress={() => handleMasterToggle(true)}>
              <Text style={styles.enableButtonText}>Enable</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Master Toggle */}
        <View style={[styles.section, {backgroundColor: card}, Shadows.sm]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, {backgroundColor: `${primary}15`}]}>
                <Icon name="bell" size={20} color={primary} />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, {color: text}]}>
                  All Notifications
                </Text>
                <Text style={[styles.settingDescription, {color: textMuted}]}>
                  Master switch for all notifications
                </Text>
              </View>
            </View>
            <Switch
              value={preferences.masterEnabled}
              onValueChange={handleMasterToggle}
              trackColor={{false: border, true: `${primary}50`}}
              thumbColor={preferences.masterEnabled ? primary : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Individual Settings */}
        {preferences.masterEnabled && (
          <>
            <Text style={[styles.sectionTitle, {color: text}]}>
              Notification Types
            </Text>
            <View style={[styles.section, {backgroundColor: card}, Shadows.sm]}>
              {NOTIFICATION_SETTINGS.map((setting, index) => (
                <View key={setting.id}>
                  <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                      <View style={styles.settingText}>
                        <Text style={[styles.settingTitle, {color: text}]}>
                          {setting.title}
                        </Text>
                        <Text style={[styles.settingDescription, {color: textMuted}]}>
                          {setting.description}
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={preferences[setting.id] as boolean}
                      onValueChange={(value) => handleSettingToggle(setting.id, value)}
                      trackColor={{false: border, true: `${primary}50`}}
                      thumbColor={preferences[setting.id] ? primary : '#f4f3f4'}
                    />
                  </View>
                  {index < NOTIFICATION_SETTINGS.length - 1 && (
                    <View style={[styles.divider, {backgroundColor: border}]} />
                  )}
                </View>
              ))}
            </View>
          </>
        )}

        {/* FCM Token (for debugging) */}
        {__DEV__ && fcmToken && (
          <View style={[styles.debugSection, {backgroundColor: `${textMuted}10`}]}>
            <Text style={[styles.debugTitle, {color: textMuted}]}>
              Debug: FCM Token
            </Text>
            <Text style={[styles.debugToken, {color: textMuted}]} selectable>
              {fcmToken.substring(0, 50)}...
            </Text>
          </View>
        )}

        {/* Tips */}
        <View style={[styles.tipsCard, {backgroundColor: `${primary}10`}]}>
          <Text style={styles.tipsEmoji}>💡</Text>
          <Text style={[styles.tipsText, {color: textSecondary}]}>
            Keep study reminders enabled to maintain your learning streak and stay consistent with your goals!
          </Text>
        </View>

        <View style={{height: Spacing['2xl']}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSizes.lg,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSizes.sm,
  },
  content: {
    padding: Spacing.lg,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  statusTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginBottom: 2,
  },
  statusDescription: {
    fontSize: FontSizes.xs,
  },
  enableButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  enableButtonText: {
    color: '#FFF',
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  section: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.md,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: FontSizes.xs,
  },
  divider: {
    height: 1,
    marginHorizontal: Spacing.md,
  },
  debugSection: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
  },
  debugTitle: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  debugToken: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  tipsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
  },
  tipsEmoji: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  tipsText: {
    flex: 1,
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
});
