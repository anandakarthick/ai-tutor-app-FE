/**
 * Profile Screen - Orange Theme
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
import {useAuth} from '../../context/AuthContext';
import {Avatar, Badge, Card, Icon} from '../../components/ui';
import {BorderRadius, FontSizes, Shadows, Spacing} from '../../constants/theme';

const STUDENT = {
  name: 'Rahul Kumar',
  class: '10th',
  board: 'CBSE',
  streak: 7,
  xp: 2450,
  level: 12,
  badges: 8,
};

export function ProfileScreen() {
  const {logout} = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const primary = useThemeColor({}, 'primary');
  const primaryBg = useThemeColor({}, 'primaryBackground');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const error = useThemeColor({}, 'error');

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout(),
        },
      ],
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: background}]}
      edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <Animated.View
          style={[
            styles.profileHeader,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          <View style={[styles.avatarRing, {borderColor: primary}]}>
            <Avatar name={STUDENT.name} size="xl" />
          </View>
          <Text style={[styles.name, {color: text}]}>{STUDENT.name} 🔥</Text>
          <View style={styles.badges}>
            <Badge
              label={`${STUDENT.class} • ${STUDENT.board}`}
              variant="primary"
            />
            <Badge label={`⚡ Level ${STUDENT.level}`} variant="warning" />
          </View>
        </Animated.View>

        {/* Stats */}
        <Animated.View
          style={[
            styles.statsRow,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          <StatCard
            icon="flame"
            value={STUDENT.streak}
            label="Streak 🔥"
            color="#EF4444"
            cardColor={card}
            textColor={text}
            textSecondary={textSecondary}
          />
          <StatCard
            icon="star"
            value={STUDENT.xp.toLocaleString()}
            label="XP ⭐"
            color="#F97316"
            cardColor={card}
            textColor={text}
            textSecondary={textSecondary}
          />
          <StatCard
            icon="trophy"
            value={STUDENT.badges}
            label="Badges 🏆"
            color="#FBBF24"
            cardColor={card}
            textColor={text}
            textSecondary={textSecondary}
          />
        </Animated.View>

        {/* Menu Sections */}
        <Animated.View
          style={[
            styles.menuSection,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          <Text style={[styles.sectionTitle, {color: textSecondary}]}>
            ACCOUNT
          </Text>
          <Card padding="sm">
            <MenuItem
              icon="user"
              label="Edit Profile"
              emoji="✏️"
              primaryColor={primary}
              textColor={text}
              textSecondary={textSecondary}
              textMuted={textMuted}
              onPress={() => {}}
            />
            <View style={[styles.divider, {backgroundColor: border}]} />
            <MenuItem
              icon="school"
              label="School Details"
              emoji="🏫"
              primaryColor={primary}
              textColor={text}
              textSecondary={textSecondary}
              textMuted={textMuted}
              onPress={() => {}}
            />
            <View style={[styles.divider, {backgroundColor: border}]} />
            <MenuItem
              icon="graduation-cap"
              label="Class & Board"
              emoji="🎓"
              primaryColor={primary}
              textColor={text}
              textSecondary={textSecondary}
              textMuted={textMuted}
              onPress={() => {}}
            />
          </Card>
        </Animated.View>

        <Animated.View
          style={[
            styles.menuSection,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          <Text style={[styles.sectionTitle, {color: textSecondary}]}>
            PREFERENCES
          </Text>
          <Card padding="sm">
            <View style={styles.menuItem}>
              <View style={[styles.menuIcon, {backgroundColor: primaryBg}]}>
                <Icon name="bell" size={18} color={primary} />
              </View>
              <Text style={[styles.menuLabel, {color: text}]}>
                Notifications 🔔
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
              emoji="🌐"
              primaryColor={primary}
              textColor={text}
              textSecondary={textSecondary}
              textMuted={textMuted}
              onPress={() => {}}
            />
            <View style={[styles.divider, {backgroundColor: border}]} />
            <MenuItem
              icon="moon"
              label="Dark Mode"
              value="System"
              emoji="🌙"
              primaryColor={primary}
              textColor={text}
              textSecondary={textSecondary}
              textMuted={textMuted}
              onPress={() => {}}
            />
          </Card>
        </Animated.View>

        <Animated.View
          style={[
            styles.menuSection,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          <Text style={[styles.sectionTitle, {color: textSecondary}]}>
            SUPPORT
          </Text>
          <Card padding="sm">
            <MenuItem
              icon="help-circle"
              label="Help Center"
              emoji="❓"
              primaryColor={primary}
              textColor={text}
              textSecondary={textSecondary}
              textMuted={textMuted}
              onPress={() => {}}
            />
            <View style={[styles.divider, {backgroundColor: border}]} />
            <MenuItem
              icon="mail"
              label="Contact Us"
              emoji="📧"
              primaryColor={primary}
              textColor={text}
              textSecondary={textSecondary}
              textMuted={textMuted}
              onPress={() => {}}
            />
            <View style={[styles.divider, {backgroundColor: border}]} />
            <MenuItem
              icon="star"
              label="Rate App"
              emoji="⭐"
              primaryColor={primary}
              textColor={text}
              textSecondary={textSecondary}
              textMuted={textMuted}
              onPress={() => {}}
            />
          </Card>
        </Animated.View>

        <Animated.View
          style={[
            styles.menuSection,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          <Card padding="sm">
            <MenuItem
              icon="log-out"
              label="Logout"
              danger
              errorColor={error}
              primaryColor={primary}
              textColor={text}
              textSecondary={textSecondary}
              textMuted={textMuted}
              onPress={handleLogout}
            />
          </Card>
        </Animated.View>

        <Text style={[styles.version, {color: textMuted}]}>
          Version 1.0.0 • Made with 🧡
        </Text>

        <View style={{height: Spacing['2xl']}} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({
  icon,
  value,
  label,
  color,
  cardColor,
  textColor,
  textSecondary,
}: {
  icon: string;
  value: number | string;
  label: string;
  color: string;
  cardColor: string;
  textColor: string;
  textSecondary: string;
}) {
  return (
    <View style={[styles.statCard, {backgroundColor: cardColor}, Shadows.sm]}>
      <View style={[styles.statIcon, {backgroundColor: `${color}15`}]}>
        <Icon name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, {color: textColor}]}>{value}</Text>
      <Text style={[styles.statLabel, {color: textSecondary}]}>{label}</Text>
    </View>
  );
}

function MenuItem({
  icon,
  label,
  value,
  emoji,
  danger,
  errorColor,
  primaryColor,
  textColor,
  textSecondary,
  textMuted,
  onPress,
}: {
  icon: string;
  label: string;
  value?: string;
  emoji?: string;
  danger?: boolean;
  errorColor?: string;
  primaryColor: string;
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
          {backgroundColor: danger ? `${errorColor}15` : `${primaryColor}15`},
        ]}>
        <Icon
          name={icon}
          size={18}
          color={danger ? errorColor : primaryColor}
        />
      </View>
      <View style={styles.menuContent}>
        <Text
          style={[styles.menuLabel, {color: danger ? errorColor : textColor}]}>
          {label} {emoji}
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
  avatarRing: {
    borderWidth: 3,
    borderRadius: BorderRadius.full,
    padding: 3,
    marginBottom: Spacing.md,
  },
  name: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
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
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
  },
  statLabel: {fontSize: FontSizes.xs, marginTop: 2},
  menuSection: {marginBottom: Spacing.lg},
  sectionTitle: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuContent: {flex: 1},
  menuLabel: {fontSize: FontSizes.base, fontWeight: '500'},
  menuValue: {fontSize: FontSizes.sm, marginTop: 2},
  divider: {height: 1, marginLeft: 54},
  version: {
    textAlign: 'center',
    fontSize: FontSizes.sm,
    marginTop: Spacing.lg,
  },
});
