/**
 * Home Screen / Dashboard
 * Student's main dashboard with orange theme
 */

import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  useColorScheme,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {
  Avatar,
  Badge,
  ProgressRing,
  Icon,
  StatsCard,
  StudyPlanCard,
  SubjectCard,
} from '../../components/ui';
import {
  BorderRadius,
  FontSizes,
  Shadows,
  Spacing,
} from '../../constants/theme';

// Mock data
const STUDENT = {
  name: 'Rahul Kumar',
  avatar: null,
  class: '10th',
  board: 'CBSE',
  streak: 7,
  xp: 2450,
  level: 12,
};

const TODAY_PLAN = [
  {
    id: '1',
    topic: 'Quadratic Equations - Introduction',
    subject: 'Mathematics',
    chapter: 'Chapter 4',
    duration: 30,
    scheduledTime: '9:00 AM',
    isCompleted: true,
  },
  {
    id: '2',
    topic: 'Chemical Reactions and Equations',
    subject: 'Science',
    chapter: 'Chapter 1',
    duration: 45,
    scheduledTime: '10:00 AM',
    isCurrent: true,
  },
  {
    id: '3',
    topic: 'The Rise of Nationalism in Europe',
    subject: 'History',
    chapter: 'Chapter 1',
    duration: 30,
    scheduledTime: '11:30 AM',
  },
];

const SUBJECTS = [
  {
    subject: 'Mathematics',
    chaptersCompleted: 3,
    totalChapters: 15,
    progress: 20,
  },
  {subject: 'Science', chaptersCompleted: 2, totalChapters: 16, progress: 12},
  {subject: 'English', chaptersCompleted: 4, totalChapters: 12, progress: 33},
];

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme() ?? 'light';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');
  const card = useThemeColor({}, 'card');

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

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: background}]}
      edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, {color: textSecondary}]}>
              Good Morning 🌅
            </Text>
            <Text style={[styles.name, {color: text}]}>{STUDENT.name}</Text>
            <View style={styles.badges}>
              <Badge
                label={`${STUDENT.class} • ${STUDENT.board}`}
                variant="primary"
                size="sm"
              />
              <Badge
                label={`🔥 Level ${STUDENT.level}`}
                variant="warning"
                size="sm"
              />
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <View style={[styles.avatarContainer, {borderColor: primary}]}>
              <Avatar name={STUDENT.name} source={STUDENT.avatar} size="lg" />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Stats */}
        <Animated.View
          style={[
            styles.statsContainer,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          <View style={styles.statsRow}>
            <StatsCard
              title="Streak"
              value={STUDENT.streak}
              subtitle="days 🔥"
              icon="flame"
              iconColor="#EF4444"
              delay={0}
            />
            <View style={{width: Spacing.md}} />
            <StatsCard
              title="XP Points"
              value={STUDENT.xp.toLocaleString()}
              subtitle="total ⭐"
              icon="star"
              iconColor="#F97316"
              delay={100}
            />
          </View>
        </Animated.View>

        {/* Continue Learning - Orange Gradient Card */}
        <Animated.View
          style={[
            styles.section,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          <TouchableOpacity
            style={[styles.continueCard, Shadows.lg]}
            activeOpacity={0.9}>
            <View style={[styles.continueGradient, {backgroundColor: primary}]}>
              <View style={styles.continueDecoration1} />
              <View style={styles.continueDecoration2} />
              <View style={styles.continueDecoration3} />
              <View style={styles.continueContent}>
                <View style={styles.continueIcon}>
                  <Icon name="play" size={24} color={primary} />
                </View>
                <View style={styles.continueText}>
                  <Text style={styles.continueTitle}>Continue Learning 🚀</Text>
                  <Text style={styles.continueSubtitle} numberOfLines={1}>
                    Chemical Reactions and Equations
                  </Text>
                  <View style={styles.continueMeta}>
                    <Text style={styles.continueMetaText}>Science</Text>
                    <View style={styles.dot} />
                    <Text style={styles.continueMetaText}>15 min left</Text>
                  </View>
                </View>
              </View>
              <View style={styles.continueProgress}>
                <ProgressRing
                  progress={65}
                  size="md"
                  showLabel={true}
                  variant="success"
                />
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Today's Plan */}
        <Animated.View
          style={[
            styles.section,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionTitle, {color: text}]}>
                Today's Plan
              </Text>
              <Text style={styles.sectionEmoji}>📋</Text>
            </View>
            <TouchableOpacity>
              <Text style={[styles.seeAll, {color: primary}]}>See All</Text>
            </TouchableOpacity>
          </View>
          {TODAY_PLAN.map((item) => (
            <StudyPlanCard
              key={item.id}
              topic={item.topic}
              subject={item.subject}
              chapter={item.chapter}
              duration={item.duration}
              scheduledTime={item.scheduledTime}
              isCompleted={item.isCompleted}
              isCurrent={item.isCurrent}
              onPress={() => console.log('Start learning', item.id)}
            />
          ))}
        </Animated.View>

        {/* Subjects Progress */}
        <Animated.View
          style={[
            styles.section,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionTitle, {color: text}]}>
                Your Subjects
              </Text>
              <Text style={styles.sectionEmoji}>📚</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Learn')}>
              <Text style={[styles.seeAll, {color: primary}]}>View All</Text>
            </TouchableOpacity>
          </View>
          {SUBJECTS.map((subject) => (
            <SubjectCard
              key={subject.subject}
              subject={subject.subject}
              chaptersCompleted={subject.chaptersCompleted}
              totalChapters={subject.totalChapters}
              progress={subject.progress}
              onPress={() => navigation.navigate('Learn')}
            />
          ))}
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          style={[
            styles.section,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitle, {color: text}]}>
              Quick Actions
            </Text>
            <Text style={styles.sectionEmoji}>⚡</Text>
          </View>
          <View style={styles.actionsGrid}>
            <QuickAction
              icon="help-circle"
              label="Ask Doubt"
              color="#EF4444"
              emoji="💬"
              onPress={() => navigation.navigate('Doubt')}
            />
            <QuickAction
              icon="file-text"
              label="Take Quiz"
              color="#3B82F6"
              emoji="📝"
              onPress={() => navigation.navigate('Quizzes')}
            />
            <QuickAction
              icon="calendar"
              label="Study Plan"
              color="#22C55E"
              emoji="📅"
              onPress={() => {}}
            />
            <QuickAction
              icon="trophy"
              label="Leaderboard"
              color="#F97316"
              emoji="🏆"
              onPress={() => {}}
            />
          </View>
        </Animated.View>

        <View style={{height: Spacing['2xl']}} />
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickAction({
  icon,
  label,
  color,
  emoji,
  onPress,
}: {
  icon: string;
  label: string;
  color: string;
  emoji: string;
  onPress: () => void;
}) {
  const card = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{transform: [{scale: scaleAnim}], width: '47%'}}>
      <TouchableOpacity
        style={[styles.actionCard, {backgroundColor: card}, Shadows.md]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}>
        <View style={[styles.actionIcon, {backgroundColor: `${color}15`}]}>
          <Icon name={icon} size={24} color={color} />
        </View>
        <Text style={[styles.actionLabel, {color: text}]}>{label}</Text>
        <Text style={styles.actionEmoji}>{emoji}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: FontSizes.sm,
    marginBottom: 4,
  },
  name: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  avatarContainer: {
    borderWidth: 3,
    borderRadius: BorderRadius.full,
    padding: 2,
  },
  statsContainer: {
    marginBottom: Spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  sectionEmoji: {
    fontSize: FontSizes.lg,
  },
  seeAll: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  continueCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  continueDecoration1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  continueDecoration2: {
    position: 'absolute',
    bottom: -50,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  continueDecoration3: {
    position: 'absolute',
    top: 20,
    left: '40%',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  continueContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.base,
  },
  continueIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  continueText: {
    flex: 1,
  },
  continueTitle: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
    fontWeight: '600',
  },
  continueSubtitle: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  continueMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  continueMetaText: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: Spacing.sm,
  },
  continueProgress: {
    zIndex: 1,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  actionCard: {
    padding: Spacing.base,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    position: 'relative',
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  actionLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  actionEmoji: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    fontSize: 16,
  },
});
