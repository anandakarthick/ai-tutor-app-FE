/**
 * Progress Screen
 * View learning progress and analytics
 */

import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, ScrollView, Animated} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useThemeColor} from '../../hooks/useThemeColor';
import {Icon, ProgressRing, ProgressBar, Card, Badge} from '../../components/ui';
import {BorderRadius, FontSizes, Spacing} from '../../constants/theme';

const WEEKLY_STUDY = [
  {day: 'Mon', hours: 2.5},
  {day: 'Tue', hours: 3},
  {day: 'Wed', hours: 1.5},
  {day: 'Thu', hours: 4},
  {day: 'Fri', hours: 2},
  {day: 'Sat', hours: 3.5},
  {day: 'Sun', hours: 1},
];

const SUBJECTS = [
  {name: 'Mathematics', progress: 45},
  {name: 'Science', progress: 32},
  {name: 'English', progress: 58},
];

export function ProgressScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');

  const maxHours = Math.max(...WEEKLY_STUDY.map(d => d.hours));

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
      <Animated.View style={[styles.header, {opacity: fadeAnim}]}>
        <Text style={[styles.title, {color: text}]}>Progress</Text>
        <Text style={[styles.subtitle, {color: textSecondary}]}>
          Track your learning journey
        </Text>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Overall Progress */}
        <Animated.View style={{opacity: fadeAnim}}>
          <Card style={styles.overallCard}>
            <View style={styles.overallContent}>
              <View style={styles.overallText}>
                <Text style={[styles.overallTitle, {color: text}]}>
                  Overall Progress
                </Text>
                <Text style={[styles.overallSubtitle, {color: textSecondary}]}>
                  You're doing great! Keep it up.
                </Text>
                <View style={styles.overallStats}>
                  <View style={styles.overallStat}>
                    <Text style={[styles.statValue, {color: text}]}>47</Text>
                    <Text style={[styles.statLabel, {color: textSecondary}]}>
                      Topics
                    </Text>
                  </View>
                  <View
                    style={[styles.statDivider, {backgroundColor: border}]}
                  />
                  <View style={styles.overallStat}>
                    <Text style={[styles.statValue, {color: text}]}>12</Text>
                    <Text style={[styles.statLabel, {color: textSecondary}]}>
                      Quizzes
                    </Text>
                  </View>
                  <View
                    style={[styles.statDivider, {backgroundColor: border}]}
                  />
                  <View style={styles.overallStat}>
                    <Text style={[styles.statValue, {color: text}]}>28h</Text>
                    <Text style={[styles.statLabel, {color: textSecondary}]}>
                      Study Time
                    </Text>
                  </View>
                </View>
              </View>
              <ProgressRing progress={42} size="xl" label="Complete" />
            </View>
          </Card>
        </Animated.View>

        {/* Weekly Chart */}
        <Animated.View style={[styles.section, {opacity: fadeAnim}]}>
          <Text style={[styles.sectionTitle, {color: text}]}>This Week</Text>
          <Card>
            <View style={styles.chartContainer}>
              {WEEKLY_STUDY.map((item, index) => (
                <View key={item.day} style={styles.chartBar}>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${(item.hours / maxHours) * 100}%`,
                          backgroundColor:
                            index === 3 ? primary : `${primary}40`,
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
                  17.5 hours this week
                </Text>
              </View>
              <Badge label="+15% vs last week" variant="success" size="sm" />
            </View>
          </Card>
        </Animated.View>

        {/* Subject Progress */}
        <Animated.View style={[styles.section, {opacity: fadeAnim}]}>
          <Text style={[styles.sectionTitle, {color: text}]}>
            Subject Progress
          </Text>
          {SUBJECTS.map(subject => (
            <View key={subject.name} style={styles.subjectItem}>
              <ProgressBar
                progress={subject.progress}
                label={subject.name}
                showLabel
                size="md"
              />
            </View>
          ))}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
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
  subjectItem: {marginBottom: Spacing.md},
});
