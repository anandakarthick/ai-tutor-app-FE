/**
 * Progress Screen
 * View learning progress and analytics - API Integrated
 */

import React, {useEffect, useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {useStudent} from '../../context';
import {useProgress} from '../../hooks/useApi';
import {progressApi} from '../../services/api';
import {Icon, ProgressBar, Badge} from '../../components/ui';
import {BorderRadius, FontSizes, Shadows, Spacing} from '../../constants/theme';

interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  avgProgress: number;
}

export function ProgressScreen() {
  const navigation = useNavigation<any>();
  const {currentStudent} = useStudent();
  const {dailyProgress, streak, loading, refresh} = useProgress();
  const [refreshing, setRefreshing] = useState(false);
  const [overallData, setOverallData] = useState({
    totalTopics: 0,
    completedTopics: 0,
    totalTimeMinutes: 0,
    subjectProgress: [] as SubjectProgress[],
  });

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');
  const primaryBg = useThemeColor({}, 'primaryBackground');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const success = useThemeColor({}, 'success');
  const warning = useThemeColor({}, 'warning');

  // Load overall progress
  const loadOverall = useCallback(async () => {
    if (!currentStudent) return;
    try {
      console.log('[ProgressScreen] Loading overall progress for student:', currentStudent.id);
      const response = await progressApi.getOverall(currentStudent.id);
      if (response.success && response.data) {
        setOverallData(response.data);
      }
    } catch (err) {
      console.log('[ProgressScreen] Load overall progress error:', err);
    }
  }, [currentStudent]);

  // Refresh when screen is focused
  useFocusEffect(
    useCallback(() => {
      console.log('[ProgressScreen] Screen focused - refreshing data');
      if (currentStudent) {
        refresh();
        loadOverall();
      }
    }, [refresh, loadOverall, currentStudent])
  );

  const handleRefresh = useCallback(async () => {
    console.log('[ProgressScreen] Pull-to-refresh triggered');
    setRefreshing(true);
    try {
      if (currentStudent) {
        await Promise.all([refresh(), loadOverall()]);
      }
    } catch (err) {
      console.log('[ProgressScreen] Refresh error:', err);
    }
    setRefreshing(false);
  }, [refresh, loadOverall, currentStudent]);

  // Calculate weekly study data from dailyProgress
  const getWeeklyData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      
      const progressEntry = dailyProgress.find(p => {
        const pDate = new Date(p.date);
        return pDate.toDateString() === date.toDateString();
      });
      
      weekData.push({
        day: dayName,
        hours: progressEntry ? progressEntry.studyTimeMinutes / 60 : 0,
        isToday: i === 0,
      });
    }
    
    return weekData;
  };

  const weeklyStudy = getWeeklyData();
  const maxHours = Math.max(...weeklyStudy.map(d => d.hours), 1);
  const totalWeeklyHours = weeklyStudy.reduce((sum, d) => sum + d.hours, 0);
  
  const overallProgress = overallData.totalTopics > 0
    ? Math.round((overallData.completedTopics / overallData.totalTopics) * 100)
    : 0;

  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // No student profile - show setup prompt
  if (!currentStudent) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: background}]} edges={['top']}>
        <View style={styles.header}>
          <Text style={[styles.title, {color: text}]}>Progress 📊</Text>
          <Text style={[styles.subtitle, {color: textSecondary}]}>
            Track your learning journey
          </Text>
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[primary]} />
          }>
          <View style={[styles.emptyCard, {backgroundColor: card}]}>
            <View style={[styles.emptyIcon, {backgroundColor: primaryBg}]}>
              <Text style={styles.emptyEmoji}>📊</Text>
            </View>
            <Text style={[styles.emptyTitle, {color: text}]}>
              Complete Your Profile
            </Text>
            <Text style={[styles.emptyDescription, {color: textSecondary}]}>
              Set up your student profile to start tracking your learning progress and achievements!
            </Text>
            <TouchableOpacity
              style={[styles.actionButton, {backgroundColor: primary}]}
              onPress={() => navigation.navigate('Profile')}>
              <Icon name="user" size={18} color="#FFF" />
              <Text style={styles.actionButtonText}>Go to Profile</Text>
            </TouchableOpacity>
            
            <View style={[styles.previewSection, {borderColor: border}]}>
              <Text style={[styles.previewTitle, {color: text}]}>
                📈 What you'll track:
              </Text>
              <Text style={[styles.previewItem, {color: textSecondary}]}>
                • Daily study time and streaks
              </Text>
              <Text style={[styles.previewItem, {color: textSecondary}]}>
                • Topics completed per subject
              </Text>
              <Text style={[styles.previewItem, {color: textSecondary}]}>
                • XP points and levels
              </Text>
              <Text style={[styles.previewItem, {color: textSecondary}]}>
                • Weekly progress charts
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Loading state
  if (loading && dailyProgress.length === 0) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: background}]} edges={['top']}>
        <View style={styles.header}>
          <Text style={[styles.title, {color: text}]}>Progress 📊</Text>
          <Text style={[styles.subtitle, {color: textSecondary}]}>
            Track your learning journey
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primary} />
          <Text style={[styles.loadingText, {color: textSecondary}]}>Loading progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: background}]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, {color: text}]}>Progress 📊</Text>
        <Text style={[styles.subtitle, {color: textSecondary}]}>
          Track your learning journey
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[primary]} />
        }>
        
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, {backgroundColor: card}, Shadows.sm]}>
            <Icon name="flame" size={24} color="#EF4444" />
            <Text style={[styles.statValue, {color: text}]}>{streak.streakDays || 0}</Text>
            <Text style={[styles.statLabel, {color: textSecondary}]}>Day Streak</Text>
          </View>
          <View style={[styles.statCard, {backgroundColor: card}, Shadows.sm]}>
            <Icon name="star" size={24} color="#F97316" />
            <Text style={[styles.statValue, {color: text}]}>{streak.xp || 0}</Text>
            <Text style={[styles.statLabel, {color: textSecondary}]}>XP Points</Text>
          </View>
          <View style={[styles.statCard, {backgroundColor: card}, Shadows.sm]}>
            <Icon name="award" size={24} color="#FBBF24" />
            <Text style={[styles.statValue, {color: text}]}>{streak.level || 1}</Text>
            <Text style={[styles.statLabel, {color: textSecondary}]}>Level</Text>
          </View>
        </View>

        {/* Overall Progress Card */}
        <View style={[styles.overallCard, {backgroundColor: card}, Shadows.sm]}>
          <View style={styles.overallHeader}>
            <Text style={[styles.sectionTitle, {color: text}]}>Overall Progress</Text>
            <Badge label={`${overallProgress}%`} variant="primary" />
          </View>
          <View style={styles.overallStats}>
            <View style={styles.overallStatItem}>
              <Text style={[styles.overallStatValue, {color: text}]}>{overallData.completedTopics}</Text>
              <Text style={[styles.overallStatLabel, {color: textSecondary}]}>Topics Done</Text>
            </View>
            <View style={[styles.overallDivider, {backgroundColor: border}]} />
            <View style={styles.overallStatItem}>
              <Text style={[styles.overallStatValue, {color: text}]}>{overallData.totalTopics}</Text>
              <Text style={[styles.overallStatLabel, {color: textSecondary}]}>Total Topics</Text>
            </View>
            <View style={[styles.overallDivider, {backgroundColor: border}]} />
            <View style={styles.overallStatItem}>
              <Text style={[styles.overallStatValue, {color: text}]}>{formatStudyTime(overallData.totalTimeMinutes)}</Text>
              <Text style={[styles.overallStatLabel, {color: textSecondary}]}>Study Time</Text>
            </View>
          </View>
          <ProgressBar progress={overallProgress} size="md" showLabel={false} />
        </View>

        {/* Weekly Chart */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: text}]}>This Week</Text>
          <View style={[styles.chartCard, {backgroundColor: card}, Shadows.sm]}>
            <View style={styles.chartContainer}>
              {weeklyStudy.map((item) => (
                <View key={item.day} style={styles.chartBar}>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${Math.max((item.hours / maxHours) * 100, 8)}%`,
                          backgroundColor: item.isToday ? primary : `${primary}50`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, {color: item.isToday ? primary : textSecondary}]}>
                    {item.day}
                  </Text>
                </View>
              ))}
            </View>
            <View style={[styles.chartSummary, {borderTopColor: border}]}>
              <View style={styles.chartSummaryItem}>
                <Icon name="clock" size={16} color={primary} />
                <Text style={[styles.chartSummaryText, {color: text}]}>
                  {totalWeeklyHours.toFixed(1)} hours this week
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Subject Progress */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: text}]}>Subject Progress</Text>
          <View style={[styles.subjectCard, {backgroundColor: card}, Shadows.sm]}>
            {overallData.subjectProgress.length === 0 ? (
              <View style={styles.emptySection}>
                <Text style={styles.emptySectionEmoji}>📚</Text>
                <Text style={[styles.emptySectionText, {color: textSecondary}]}>
                  Start learning to see your subject progress
                </Text>
              </View>
            ) : (
              overallData.subjectProgress.map((subject, index) => (
                <View 
                  key={subject.subjectId} 
                  style={[
                    styles.subjectItem,
                    index < overallData.subjectProgress.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: border,
                      marginBottom: 12,
                      paddingBottom: 12,
                    }
                  ]}>
                  <View style={styles.subjectHeader}>
                    <Text style={[styles.subjectName, {color: text}]}>{subject.subjectName}</Text>
                    <Text style={[styles.subjectPercent, {color: primary}]}>
                      {Math.round(subject.avgProgress || 0)}%
                    </Text>
                  </View>
                  <ProgressBar progress={Math.round(subject.avgProgress || 0)} size="sm" showLabel={false} />
                </View>
              ))
            )}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: text}]}>Recent Activity</Text>
          <View style={[styles.activityCard, {backgroundColor: card}, Shadows.sm]}>
            {dailyProgress.length === 0 ? (
              <View style={styles.emptySection}>
                <Text style={styles.emptySectionEmoji}>🕐</Text>
                <Text style={[styles.emptySectionText, {color: textSecondary}]}>
                  Your recent activity will appear here
                </Text>
              </View>
            ) : (
              dailyProgress.slice(0, 5).map((activity, index) => (
                <View 
                  key={activity.id || index} 
                  style={[
                    styles.activityItem,
                    index < Math.min(dailyProgress.length, 5) - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: border,
                    },
                  ]}>
                  <View style={[styles.activityIcon, {backgroundColor: `${primary}15`}]}>
                    <Icon name="book-open" size={16} color={primary} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={[styles.activityTitle, {color: text}]}>
                      {new Date(activity.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                    <Text style={[styles.activityMeta, {color: textSecondary}]}>
                      {activity.studyTimeMinutes} min • {activity.topicsCompleted || 0} topics • +{activity.xpEarned || 0} XP
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
        
        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
    flexGrow: 1,
  },
  
  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  
  // Overall Card
  overallCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  overallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  overallStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  overallStatItem: {
    alignItems: 'center',
  },
  overallStatValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  overallStatLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  overallDivider: {
    width: 1,
    height: 30,
  },
  
  // Section
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  
  // Chart Card
  chartCard: {
    padding: 16,
    borderRadius: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 100,
    marginBottom: 12,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    flex: 1,
    width: 20,
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  chartSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  chartSummaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chartSummaryText: {
    fontSize: 13,
    fontWeight: '500',
  },
  
  // Subject Card
  subjectCard: {
    padding: 16,
    borderRadius: 16,
  },
  subjectItem: {},
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectName: {
    fontSize: 14,
    fontWeight: '600',
  },
  subjectPercent: {
    fontSize: 14,
    fontWeight: '700',
  },
  
  // Activity Card
  activityCard: {
    padding: 16,
    borderRadius: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  activityMeta: {
    fontSize: 12,
  },
  
  // Empty States
  emptyCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyEmoji: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    marginBottom: 24,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  previewSection: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  previewItem: {
    fontSize: 13,
    lineHeight: 22,
  },
  emptySection: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptySectionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptySectionText: {
    fontSize: 13,
    textAlign: 'center',
  },
});
