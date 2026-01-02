/**
 * Progress Screen
 * View learning progress and analytics - API Integrated
 */

import React, {useEffect, useRef, useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {useStudent} from '../../context';
import {useProgress} from '../../hooks/useApi';
import {progressApi} from '../../services/api';
import {Icon, ProgressRing, ProgressBar, Card, Badge} from '../../components/ui';
import {BorderRadius, FontSizes, Spacing} from '../../constants/theme';

interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  avgProgress: number;
}

export function ProgressScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
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
  const border = useThemeColor({}, 'border');

  // Load overall progress
  const loadOverall = useCallback(async () => {
    if (!currentStudent) return;
    try {
      console.log('Loading overall progress for student:', currentStudent.id);
      const response = await progressApi.getOverall(currentStudent.id);
      if (response.success && response.data) {
        setOverallData(response.data);
      }
    } catch (err) {
      console.log('Load overall progress error:', err);
    }
  }, [currentStudent]);

  // Refresh when screen is focused
  useFocusEffect(
    useCallback(() => {
      console.log('ProgressScreen focused - refreshing data');
      refresh();
      loadOverall();
    }, [refresh, loadOverall])
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleRefresh = useCallback(async () => {
    console.log('ProgressScreen pull-to-refresh triggered');
    setRefreshing(true);
    try {
      await Promise.all([refresh(), loadOverall()]);
    } catch (err) {
      console.log('Refresh error:', err);
    }
    setRefreshing(false);
  }, [refresh, loadOverall]);

  // Calculate weekly study data from dailyProgress
  const getWeeklyData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      
      // Find matching progress entry
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

  if (loading && dailyProgress.length === 0) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: background}]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primary} />
          <Text style={[styles.loadingText, {color: textSecondary}]}>Loading progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: background}]}
      edges={['top']}>
      <Animated.View style={[styles.header, {opacity: fadeAnim}]}>
        <Text style={[styles.title, {color: text}]}>Progress 📊</Text>
        <Text style={[styles.subtitle, {color: textSecondary}]}>
          Track your learning journey
        </Text>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[primary]} />
        }>
        {/* Overall Progress */}
        <Animated.View style={{opacity: fadeAnim}}>
          <Card style={styles.overallCard}>
            <View style={styles.overallContent}>
              <View style={styles.overallText}>
                <Text style={[styles.overallTitle, {color: text}]}>
                  Overall Progress
                </Text>
                <Text style={[styles.overallSubtitle, {color: textSecondary}]}>
                  {streak.streakDays > 0 
                    ? `🔥 ${streak.streakDays} day streak! Keep it up!` 
                    : 'Start learning to build your streak!'}
                </Text>
                <View style={styles.overallStats}>
                  <View style={styles.overallStat}>
                    <Text style={[styles.statValue, {color: text}]}>
                      {overallData.completedTopics}
                    </Text>
                    <Text style={[styles.statLabel, {color: textSecondary}]}>
                      Topics
                    </Text>
                  </View>
                  <View
                    style={[styles.statDivider, {backgroundColor: border}]}
                  />
                  <View style={styles.overallStat}>
                    <Text style={[styles.statValue, {color: text}]}>
                      {streak.xp || 0}
                    </Text>
                    <Text style={[styles.statLabel, {color: textSecondary}]}>
                      XP Points
                    </Text>
                  </View>
                  <View
                    style={[styles.statDivider, {backgroundColor: border}]}
                  />
                  <View style={styles.overallStat}>
                    <Text style={[styles.statValue, {color: text}]}>
                      {formatStudyTime(overallData.totalTimeMinutes)}
                    </Text>
                    <Text style={[styles.statLabel, {color: textSecondary}]}>
                      Study Time
                    </Text>
                  </View>
                </View>
              </View>
              <ProgressRing progress={overallProgress} size="xl" label="Complete" />
            </View>
          </Card>
        </Animated.View>

        {/* Weekly Chart */}
        <Animated.View style={[styles.section, {opacity: fadeAnim}]}>
          <Text style={[styles.sectionTitle, {color: text}]}>This Week</Text>
          <Card>
            <View style={styles.chartContainer}>
              {weeklyStudy.map((item, index) => (
                <View key={item.day} style={styles.chartBar}>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${Math.max((item.hours / maxHours) * 100, 5)}%`,
                          backgroundColor:
                            item.isToday ? primary : `${primary}40`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, {color: textSecondary}]}>
                    {item.day}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.chartSummary}>
              <View style={styles.chartSummaryItem}>
                <Icon name="clock" size={16} color={primary} />
                <Text style={[styles.chartSummaryText, {color: text}]}>
                  {totalWeeklyHours.toFixed(1)} hours this week
                </Text>
              </View>
              <Badge 
                label={`Level ${streak.level || 1}`} 
                variant="success" 
                size="sm" 
              />
            </View>
          </Card>
        </Animated.View>

        {/* Subject Progress */}
        <Animated.View style={[styles.section, {opacity: fadeAnim}]}>
          <Text style={[styles.sectionTitle, {color: text}]}>
            Subject Progress
          </Text>
          {overallData.subjectProgress.length === 0 ? (
            <View style={styles.emptySubjects}>
              <Text style={[styles.emptyText, {color: textSecondary}]}>
                Start learning to see your progress here
              </Text>
            </View>
          ) : (
            overallData.subjectProgress.map(subject => (
              <View key={subject.subjectId} style={styles.subjectItem}>
                <ProgressBar
                  progress={Math.round(subject.avgProgress || 0)}
                  label={subject.subjectName}
                  showLabel
                  size="md"
                />
              </View>
            ))
          )}
        </Animated.View>

        {/* Recent Activity */}
        {dailyProgress.length > 0 && (
          <Animated.View style={[styles.section, {opacity: fadeAnim}]}>
            <Text style={[styles.sectionTitle, {color: text}]}>
              Recent Activity
            </Text>
            <Card>
              {dailyProgress.slice(0, 5).map((activity, index) => (
                <View 
                  key={activity.id || index} 
                  style={[
                    styles.activityItem,
                    index < dailyProgress.slice(0, 5).length - 1 && {
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
              ))}
            </Card>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSizes.sm,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  subtitle: {fontSize: FontSizes.base},
  scrollContent: {padding: Spacing.lg, paddingTop: 0},
  overallCard: {marginBottom: Spacing.xl},
  overallContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  overallText: {flex: 1, marginRight: Spacing.lg},
  overallTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  overallSubtitle: {fontSize: FontSizes.sm, marginBottom: Spacing.base},
  overallStats: {flexDirection: 'row', alignItems: 'center'},
  overallStat: {alignItems: 'center'},
  statValue: {fontSize: FontSizes.lg, fontWeight: '700'},
  statLabel: {fontSize: FontSizes.xs},
  statDivider: {width: 1, height: 30, marginHorizontal: Spacing.md},
  section: {marginBottom: Spacing.xl},
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    marginBottom: Spacing.base,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 120,
    marginBottom: Spacing.base,
  },
  chartBar: {flex: 1, alignItems: 'center'},
  barContainer: {
    flex: 1,
    width: 24,
    justifyContent: 'flex-end',
    marginBottom: Spacing.xs,
  },
  bar: {width: '100%', borderRadius: BorderRadius.sm, minHeight: 4},
  barLabel: {fontSize: FontSizes.xs, fontWeight: '500'},
  chartSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  chartSummaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  chartSummaryText: {fontSize: FontSizes.sm, fontWeight: '500'},
  emptySubjects: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
  },
  subjectItem: {marginBottom: Spacing.md},
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  activityContent: {flex: 1},
  activityTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginBottom: 2,
  },
  activityMeta: {
    fontSize: FontSizes.xs,
  },
});
