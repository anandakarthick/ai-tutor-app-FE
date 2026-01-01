/**
 * Notification Settings Screen
 * Manage push notification preferences
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {useNotification} from '../../hooks/useNotification';
import {Icon} from '../../components/ui';
import {BorderRadius, FontSizes, Spacing, Shadows} from '../../constants/theme';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  topic: string;
  enabled: boolean;
}

const DEFAULT_SETTINGS: NotificationSetting[] = [
  {
    id: 'study_reminders',
    title: 'Study Reminders',
    description: 'Get reminders for your daily study schedule',
    topic: 'study_reminders',
    enabled: true,
  },
  {
    id: 'quiz_alerts',
    title: 'Quiz Alerts',
    description: 'Notifications about new quizzes and results',
    topic: 'quiz_alerts',
    enabled: true,
  },
  {
    id: 'achievement_updates',
    title: 'Achievement Updates',
    description: 'Know when you earn badges and rewards',
    topic: 'achievements',
    enabled: true,
  },
  {
    id: 'new_content',
    title: 'New Content',
    description: 'Updates about new lessons and chapters',
    topic: 'new_content',
    enabled: true,
  },
  {
    id: 'tips_tricks',
    title: 'Tips & Tricks',
    description: 'Learning tips and study hacks',
    topic: 'tips',
    enabled: false,
  },
  {
    id: 'promotions',
    title: 'Promotions & Offers',
    description: 'Special discounts and subscription offers',
    topic: 'promotions',
    enabled: false,
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

  const [settings, setSettings] = useState<NotificationSetting[]>(DEFAULT_SETTINGS);
  const [masterSwitch, setMasterSwitch] = useState(true);

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const primary = useThemeColor({}, 'primary');
  const success = useThemeColor({}, 'success');
  const error = useThemeColor({}, 'error');

  useEffect(() => {
    setMasterSwitch(hasPermission);
  }, [hasPermission]);

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
    setMasterSwitch(value);
  };

  const handleSettingToggle = async (id: string, value: boolean) => {
    const setting = settings.find(s => s.id === id);
    if (!setting) return;

    try {
      if (value) {
        await subscribeToTopic(setting.topic);
      } else {
        await unsubscribeFromTopic(setting.topic);
      }

      setSettings(prev =>
        prev.map(s => (s.id === id ? {...s, enabled: value} : s)),
      );
    } catch (err) {
      console.error('Error toggling setting:', err);
      Alert.alert('Error', 'Failed to update notification setting');
    }
  };

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
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        
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
              value={masterSwitch}
              onValueChange={handleMasterToggle}
              trackColor={{false: border, true: `${primary}50`}}
              thumbColor={masterSwitch ? primary : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Individual Settings */}
        {masterSwitch && (
          <>
            <Text style={[styles.sectionTitle, {color: text}]}>
              Notification Types
            </Text>
            <View style={[styles.section, {backgroundColor: card}, Shadows.sm]}>
              {settings.map((setting, index) => (
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
                      value={setting.enabled}
                      onValueChange={(value) => handleSettingToggle(setting.id, value)}
                      trackColor={{false: border, true: `${primary}50`}}
                      thumbColor={setting.enabled ? primary : '#f4f3f4'}
                    />
                  </View>
                  {index < settings.length - 1 && (
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
