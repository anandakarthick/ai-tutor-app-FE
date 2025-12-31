/**
 * Quizzes Screen
 * Browse and take quizzes
 */

import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useThemeColor} from '../../hooks/useThemeColor';
import {Icon, Badge} from '../../components/ui';
import {BorderRadius, FontSizes, Shadows, Spacing} from '../../constants/theme';

const QUIZZES = [
  {
    id: '1',
    title: 'Real Numbers - Basics',
    type: 'topic',
    questions: 10,
    duration: 15,
    score: 85,
  },
  {
    id: '2',
    title: 'Polynomials Fundamentals',
    type: 'topic',
    questions: 15,
    duration: 20,
    score: 72,
  },
  {
    id: '3',
    title: 'Chemical Reactions',
    type: 'chapter',
    questions: 25,
    duration: 30,
  },
  {
    id: '4',
    title: 'Science Mock Test',
    type: 'mock',
    questions: 50,
    duration: 60,
  },
];

export function QuizzesScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');
  const card = useThemeColor({}, 'card');
  const success = useThemeColor({}, 'success');
  const warning = useThemeColor({}, 'warning');

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
        <Text style={[styles.title, {color: text}]}>Quizzes</Text>
        <Text style={[styles.subtitle, {color: textSecondary}]}>
          Test your knowledge
        </Text>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Stats */}
        <Animated.View style={[styles.statsRow, {opacity: fadeAnim}]}>
          <View style={[styles.statCard, {backgroundColor: card}, Shadows.sm]}>
            <Icon name="check-circle" size={24} color={success} />
            <Text style={[styles.statValue, {color: text}]}>12</Text>
            <Text style={[styles.statLabel, {color: textSecondary}]}>
              Completed
            </Text>
          </View>
          <View style={[styles.statCard, {backgroundColor: card}, Shadows.sm]}>
            <Icon name="percent" size={24} color={primary} />
            <Text style={[styles.statValue, {color: text}]}>78%</Text>
            <Text style={[styles.statLabel, {color: textSecondary}]}>
              Avg. Score
            </Text>
          </View>
          <View style={[styles.statCard, {backgroundColor: card}, Shadows.sm]}>
            <Icon name="star" size={24} color={warning} />
            <Text style={[styles.statValue, {color: text}]}>95%</Text>
            <Text style={[styles.statLabel, {color: textSecondary}]}>
              Best Score
            </Text>
          </View>
        </Animated.View>

        {/* Quiz List */}
        <Animated.View style={{opacity: fadeAnim}}>
          <Text style={[styles.sectionTitle, {color: text}]}>
            Available Quizzes
          </Text>
          {QUIZZES.map((quiz) => (
            <TouchableOpacity
              key={quiz.id}
              style={[styles.quizCard, {backgroundColor: card}, Shadows.sm]}>
              <View
                style={[styles.quizIcon, {backgroundColor: `${primary}15`}]}>
                <Icon name="file-text" size={24} color={primary} />
              </View>
              <View style={styles.quizContent}>
                <View style={styles.quizHeader}>
                  <Badge label={quiz.type} variant="primary" size="sm" />
                  {quiz.score && (
                    <Text
                      style={[
                        styles.quizScore,
                        {color: quiz.score >= 80 ? success : warning},
                      ]}>
                      {quiz.score}%
                    </Text>
                  )}
                </View>
                <Text style={[styles.quizTitle, {color: text}]}>
                  {quiz.title}
                </Text>
                <View style={styles.quizMeta}>
                  <Text style={[styles.quizMetaText, {color: textSecondary}]}>
                    {quiz.questions} questions
                  </Text>
                  <Text style={[styles.quizMetaText, {color: textSecondary}]}>
                    {quiz.duration} min
                  </Text>
                </View>
              </View>
              <Icon name="chevron-right" size={20} color={textSecondary} />
            </TouchableOpacity>
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
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    marginBottom: Spacing.base,
  },
  quizCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  quizIcon: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  quizContent: {flex: 1, marginRight: Spacing.sm},
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  quizScore: {fontSize: FontSizes.sm, fontWeight: '700'},
  quizTitle: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  quizMeta: {flexDirection: 'row', gap: Spacing.base},
  quizMetaText: {fontSize: FontSizes.xs},
});
