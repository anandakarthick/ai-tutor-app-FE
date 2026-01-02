/**
 * Quizzes Screen
 * Browse and take quizzes - API Integrated
 */

import React, {useEffect, useRef, useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {useStudent} from '../../context';
import {useQuizzes} from '../../hooks/useApi';
import {Icon, Badge} from '../../components/ui';
import {BorderRadius, FontSizes, Shadows, Spacing} from '../../constants/theme';
import type {Quiz, QuizAttempt} from '../../types/api';

export function QuizzesScreen() {
  const navigation = useNavigation<any>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const {currentStudent} = useStudent();
  const {quizzes, loading, refresh} = useQuizzes();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    completed: 0,
    avgScore: 0,
    bestScore: 0,
  });

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');
  const card = useThemeColor({}, 'card');
  const success = useThemeColor({}, 'success');
  const warning = useThemeColor({}, 'warning');

  // Calculate stats from quizzes
  useEffect(() => {
    if (quizzes.length > 0) {
      const completedQuizzes = quizzes.filter(q => q.attempts && q.attempts.length > 0);
      const scores = completedQuizzes.flatMap(q => 
        q.attempts?.map((a: QuizAttempt) => a.percentage || a.score) || []
      ).filter(s => s !== undefined && s !== null);
      
      setStats({
        completed: completedQuizzes.length,
        avgScore: scores.length > 0 
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0,
        bestScore: scores.length > 0 ? Math.round(Math.max(...scores)) : 0,
      });
    }
  }, [quizzes]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleQuizPress = (quiz: Quiz) => {
    // Show quiz details and start option
    Alert.alert(
      quiz.quizTitle,
      `${quiz.totalQuestions} questions • ${quiz.timeLimitMinutes || quiz.duration || 15} min\n\nReady to start this quiz?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Start Quiz 🚀',
          onPress: () => navigation.navigate('QuizTaking', {quizId: quiz.id}),
        },
      ]
    );
  };

  const getQuizTypeLabel = (type: string) => {
    switch (type) {
      case 'topic': return 'Topic Quiz';
      case 'chapter': return 'Chapter Test';
      case 'mock': return 'Mock Test';
      case 'practice': return 'Practice';
      case 'daily': return 'Daily Quiz';
      default: return type;
    }
  };

  const getQuizTypeEmoji = (type: string) => {
    switch (type) {
      case 'topic': return '📚';
      case 'chapter': return '📖';
      case 'mock': return '🎯';
      case 'practice': return '✏️';
      case 'daily': return '📅';
      default: return '📝';
    }
  };

  const getLatestScore = (quiz: Quiz): number | null => {
    if (quiz.attempts && quiz.attempts.length > 0) {
      const lastAttempt = quiz.attempts[quiz.attempts.length - 1];
      return lastAttempt.percentage || lastAttempt.score || null;
    }
    return null;
  };

  if (loading && quizzes.length === 0) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: background}]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primary} />
          <Text style={[styles.loadingText, {color: textSecondary}]}>Loading quizzes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: background}]}
      edges={['top']}>
      <Animated.View style={[styles.header, {opacity: fadeAnim}]}>
        <Text style={[styles.title, {color: text}]}>Quizzes 📝</Text>
        <Text style={[styles.subtitle, {color: textSecondary}]}>
          Test your knowledge
        </Text>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[primary]} />
        }>
        {/* Stats */}
        <Animated.View style={[styles.statsRow, {opacity: fadeAnim}]}>
          <View style={[styles.statCard, {backgroundColor: card}, Shadows.sm]}>
            <Icon name="check-circle" size={24} color={success} />
            <Text style={[styles.statValue, {color: text}]}>{stats.completed}</Text>
            <Text style={[styles.statLabel, {color: textSecondary}]}>
              Completed
            </Text>
          </View>
          <View style={[styles.statCard, {backgroundColor: card}, Shadows.sm]}>
            <Icon name="percent" size={24} color={primary} />
            <Text style={[styles.statValue, {color: text}]}>{stats.avgScore}%</Text>
            <Text style={[styles.statLabel, {color: textSecondary}]}>
              Avg. Score
            </Text>
          </View>
          <View style={[styles.statCard, {backgroundColor: card}, Shadows.sm]}>
            <Icon name="star" size={24} color={warning} />
            <Text style={[styles.statValue, {color: text}]}>{stats.bestScore}%</Text>
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
          
          {quizzes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={[styles.emptyText, {color: textSecondary}]}>
                No quizzes available yet
              </Text>
            </View>
          ) : (
            quizzes.map((quiz) => {
              const score = getLatestScore(quiz);
              return (
                <TouchableOpacity
                  key={quiz.id}
                  style={[styles.quizCard, {backgroundColor: card}, Shadows.sm]}
                  onPress={() => handleQuizPress(quiz)}>
                  <View
                    style={[styles.quizIcon, {backgroundColor: `${primary}15`}]}>
                    <Text style={styles.quizIconEmoji}>
                      {getQuizTypeEmoji(quiz.quizType)}
                    </Text>
                  </View>
                  <View style={styles.quizContent}>
                    <View style={styles.quizHeader}>
                      <Badge 
                        label={getQuizTypeLabel(quiz.quizType)} 
                        variant="primary" 
                        size="sm" 
                      />
                      {score !== null && (
                        <Text
                          style={[
                            styles.quizScore,
                            {color: score >= 80 ? success : score >= 60 ? warning : '#EF4444'},
                          ]}>
                          {Math.round(score)}%
                        </Text>
                      )}
                    </View>
                    <Text style={[styles.quizTitle, {color: text}]} numberOfLines={1}>
                      {quiz.quizTitle}
                    </Text>
                    <View style={styles.quizMeta}>
                      <View style={styles.quizMetaItem}>
                        <Icon name="help-circle" size={12} color={textSecondary} />
                        <Text style={[styles.quizMetaText, {color: textSecondary}]}>
                          {quiz.totalQuestions} questions
                        </Text>
                      </View>
                      <View style={styles.quizMetaItem}>
                        <Icon name="clock" size={12} color={textSecondary} />
                        <Text style={[styles.quizMetaText, {color: textSecondary}]}>
                          {quiz.timeLimitMinutes || quiz.duration || 15} min
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Icon name="chevron-right" size={20} color={textSecondary} />
                </TouchableOpacity>
              );
            })
          )}
        </Animated.View>

        <View style={{height: Spacing['2xl']}} />
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: FontSizes.base,
    textAlign: 'center',
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
  quizIconEmoji: {
    fontSize: 24,
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
  quizMeta: {flexDirection: 'row', gap: Spacing.lg},
  quizMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  quizMetaText: {fontSize: FontSizes.xs},
});
