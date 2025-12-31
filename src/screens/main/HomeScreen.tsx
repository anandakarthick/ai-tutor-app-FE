/**
 * Home Screen / Dashboard
 * Student's main dashboard with overview
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Animated, {FadeInDown, FadeInUp} from 'react-native-reanimated';
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
import {BorderRadius, FontSizes, Shadows, Spacing} from '../../constants/theme';

// Mock data
const STUDENT = {
  name: 'Rahul Kumar',
  avatar: null,
  class: '10th',
  board: 'CBSE',
  streak: 7,
  xp: 2450,
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

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');
  const card = useThemeColor({}, 'card');

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: background}]}
      edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animated.View entering={FadeInUp.duration(500)} style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, {color: textSecondary}]}>
              Good Morning 👋
            </Text>
            <Text style={[styles.name, {color: text}]}>{STUDENT.name}</Text>
            <View style={styles.badges}>
              <Badge
                label={`${STUDENT.class} • ${STUDENT.board}`}
                variant="primary"
                size="sm"
              />
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Avatar name={STUDENT.name} source={STUDENT.avatar} size="lg" />
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Stats */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatsCard
              title="Streak"
              value={STUDENT.streak}
              subtitle="days"
              icon="flame"
              iconColor="#F59E0B"
              delay={0}
            />
            <View style={{width: Spacing.md}} />
            <StatsCard
              title="XP Points"
              value={STUDENT.xp.toLocaleString()}
              subtitle="total"
              icon="star"
              iconColor="#8B5CF6"
              delay={100}
            />
          </View>
        </Animated.View>

        {/* Continue Learning */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={styles.section}>
          <TouchableOpacity
            style={[styles.continueCard, {backgroundColor: primary}]}
            activeOpacity={0.9}>
            <View style={styles.continueContent}>
              <View style={styles.continueIcon}>
                <Icon name="play" size={24} color={primary} />
              </View>
              <View style={styles.continueText}>
                <Text style={styles.continueTitle}>Continue Learning</Text>
                <Text style={styles.continueSubtitle}>
                  Chemical Reactions and Equations
                </Text>
                <Text style={styles.continueMeta}>Science • 15 min left</Text>
              </View>
            </View>
            <ProgressRing progress={65} size="md" showLabel={false} />
          </TouchableOpacity>
        </Animated.View>

        {/* Today's Plan */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, {color: text}]}>
              Today's Study Plan
            </Text>
            <TouchableOpacity>
              <Text style={[styles.seeAll, {color: primary}]}>See All</Text>
            </TouchableOpacity>
          </View>
          {TODAY_PLAN.map(item => (
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
          entering={FadeInDown.delay(400).duration(500)}
          style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, {color: text}]}>
              Your Subjects
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Learn')}>
              <Text style={[styles.seeAll, {color: primary}]}>View All</Text>
            </TouchableOpacity>
          </View>
          {SUBJECTS.map(subject => (
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
          entering={FadeInDown.delay(500).duration(500)}
          style={styles.section}>
          <Text
            style={[styles.sectionTitle, {color: text, marginBottom: Spacing.base}]}>
            Quick Actions
          </Text>
          <View style={styles.actionsGrid}>
            <QuickAction
              icon="help-circle"
              label="Ask Doubt"
              color="#EC4899"
              onPress={() => navigation.navigate('Doubt')}
            />
            <QuickAction
              icon="file-text"
              label="Take Quiz"
              color="#3B82F6"
              onPress={() => navigation.navigate('Quizzes')}
            />
            <QuickAction
              icon="calendar"
              label="Study Plan"
              color="#10B981"
              onPress={() => {}}
            />
            <QuickAction
              icon="trophy"
              label="Leaderboard"
              color="#F59E0B"
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
  onPress,
}: {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
}) {
  const card = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');

  return (
    <TouchableOpacity
      style={[styles.actionCard, {backgroundColor: card}]}
      onPress={onPress}
      activeOpacity={0.8}>
      <View style={[styles.actionIcon, {backgroundColor: `${color}15`}]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.actionLabel, {color: text}]}>{label}</Text>
    </TouchableOpacity>
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
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  continueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    ...Shadows.lg,
  },
  continueContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.base,
  },
  continueIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.base,
  },
  continueText: {
    flex: 1,
  },
  continueTitle: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  continueSubtitle: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  continueMeta: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  actionCard: {
    width: '47%',
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadows.sm,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  actionLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
});
