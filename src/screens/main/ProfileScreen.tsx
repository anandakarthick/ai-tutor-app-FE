/**
 * Profile Screen
 * Student profile and settings
 */

import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Animated,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useThemeColor} from '../../hooks/useThemeColor';
import {Avatar, Badge, Card, Icon} from '../../components/ui';
import {BorderRadius, FontSizes, Shadows, Spacing} from '../../constants/theme';

const STUDENT = {
  name: 'Rahul Kumar',
  class: '10th',
  board: 'CBSE',
  streak: 7,
  xp: 2450,
  level: 12,
};

export function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const primary = useThemeColor({}, 'primary');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const error = useThemeColor({}, 'error');

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: background}]}
      edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <Animated.View style={[styles.profileHeader, {opacity: fadeAnim}]}>
          <Avatar name={STUDENT.name} size="xl" />
          <Text style={[styles.name, {color: text}]}>{STUDENT.name}</Text>
          <View style={styles.badges}>
            <Badge
              label={`${STUDENT.class} • ${STUDENT.board}`}
              variant="primary"
            />
            <Badge label={`Level ${STUDENT.level}`} variant="warning" />
          </View>
        </Animated.View>

        {/* Stats */}
        <Animated.View style={[styles.statsRow, {opacity: fadeAnim}]}>
          <View style={[styles.statCard, {backgroundColor: card}, Shadows.sm]}>
            <Icon name="flame" size={24} color="#F59E0B" />
            <Text style={[styles.statValue, {color: text}]}>
              {STUDENT.streak}
            </Text>
            <Text style={[styles.statLabel, {color: textSecondary}]}>
              Day Streak
            </Text>
          </View>
          <View style={[styles.statCard, {backgroundColor: card}, Shadows.sm]}>
            <Icon name="star" size={24} color="#8B5CF6" />
            <Text style={[styles.statValue, {color: text}]}>
              {STUDENT.xp.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, {color: textSecondary}]}>
              XP Points
            </Text>
          </View>
          <View style={[styles.statCard, {backgroundColor: card}, Shadows.sm]}>
            <Icon name="trophy" size={24} color="#EC4899" />
            <Text style={[styles.statValue, {color: text}]}>8</Text>
            <Text style={[styles.statLabel, {color: textSecondary}]}>
              Badges
            </Text>
          </View>
        </Animated.View>

        {/* Menu Sections */}
        <Animated.View style={[styles.menuSection, {opacity: fadeAnim}]}>
          <Text style={[styles.sectionTitle, {color: textSecondary}]}>
            ACCOUNT
          </Text>
          <Card padding="sm">
            <MenuItem
              icon="user"
              label="Edit Profile"
              textColor={text}
              textSecondary={textSecondary}
              textMuted={textMuted}
              onPress={() => {}}
            />
            <View style={[styles.divider, {backgroundColor: border}]} />
            <MenuItem
              icon="school"
              label="School Details"
              textColor={text}
              textSecondary={textSecondary}
              textMuted={textMuted}
              onPress={() => {}}
            />
            <View style={[styles.divider, {backgroundColor: border}]} />
            <MenuItem
              icon="graduation-cap"
              label="Class & Board"
              textColor={text}
              textSecondary={textSecondary}
              textMuted={textMuted}
              onPress={() => {}}
            />
          </Card>
        </Animated.View>

        <Animated.View style={[styles.menuSection, {opacity: fadeAnim}]}>
          <Text style={[styles.sectionTitle, {color: textSecondary}]}>
            PREFERENCES
          </Text>
          <Card padding="sm">
            <View style={styles.menuItem}>
              <View style={[styles.menuIcon, {backgroundColor: '#F3F4F6'}]}>
                <Icon name="bell" size={18} color={textSecondary} />
              </View>
              <Text style={[styles.menuLabel, {color: text}]}>
                Notifications
              </Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{false: '#D1D5DB', true: `${primary}60`}}
                thumbColor={notificationsEnabled ? primary : '#F3F4F6'}
              />
            </View>
            <View style={[styles.divider, {backgroundColor: border}]} />
            <MenuItem
              icon="globe"
              label="Language"
              value="English"
              textColor={text}
              textSecondary={textSecondary}
              textMuted={textMuted}
              onPress={() => {}}
            />
          </Card>
        </Animated.View>

        <Animated.View style={[styles.menuSection, {opacity: fadeAnim}]}>
          <Text style={[styles.sectionTitle, {color: textSecondary}]}>
            SUPPORT
          </Text>
          <Card padding="sm">
            <MenuItem
              icon="help-circle"
              label="Help Center"
              textColor={text}
              textSecondary={textSecondary}
              textMuted={textMuted}
              onPress={() => {}}
            />
            <View style={[styles.divider, {backgroundColor: border}]} />
            <MenuItem
              icon="mail"
              label="Contact Us"
              textColor={text}
              textSecondary={textSecondary}
              textMuted={textMuted}
              onPress={() => {}}
            />
          </Card>
        </Animated.View>

        <Animated.View style={[styles.menuSection, {opacity: fadeAnim}]}>
          <Card padding="sm">
            <MenuItem
              icon="log-out"
              label="Logout"
              danger
              errorColor={error}
              textColor={text}
              textSecondary={textSecondary}
              textMuted={textMuted}
              onPress={() => Alert.alert('Logout', 'Are you sure?')}
            />
          </Card>
        </Animated.View>

        <View style={{height: Spacing['2xl']}} />
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({
  icon,
  label,
  value,
  danger,
  errorColor,
  textColor,
  textSecondary,
  textMuted,
  onPress,
}: {
  icon: string;
  label: string;
  value?: string;
  danger?: boolean;
  errorColor?: string;
  textColor: string;
  textSecondary: string;
  textMuted: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View
        style={[
          styles.menuIcon,
          {backgroundColor: danger ? `${errorColor}15` : '#F3F4F6'},
        ]}>
        <Icon
          name={icon}
          size={18}
          color={danger ? errorColor : textSecondary}
        />
      </View>
      <View style={styles.menuContent}>
        <Text
          style={[styles.menuLabel, {color: danger ? errorColor : textColor}]}>
          {label}
        </Text>
        {value && (
          <Text style={[styles.menuValue, {color: textMuted}]}>{value}</Text>
        )}
      </View>
      <Icon name="chevron-right" size={16} color={textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  scrollContent: {padding: Spacing.lg},
  profileHeader: {alignItems: 'center', marginBottom: Spacing.xl},
  name: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  badges: {flexDirection: 'row', gap: Spacing.sm},
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    marginTop: Spacing.sm,
  },
  statLabel: {fontSize: FontSizes.xs, marginTop: 2},
  menuSection: {marginBottom: Spacing.lg},
  sectionTitle: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.base,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuContent: {flex: 1},
  menuLabel: {fontSize: FontSizes.base, fontWeight: '500'},
  menuValue: {fontSize: FontSizes.sm, marginTop: 2},
  divider: {height: 1, marginLeft: 52},
});
