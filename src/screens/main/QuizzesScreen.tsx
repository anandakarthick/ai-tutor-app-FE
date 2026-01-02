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
import {useThemeColor} from '../../hooks/useThemeColor';
import {useStudent} from '../../context';
import {useQuizzes} from '../../hooks/useApi';
import {quizzesApi} from '../../services/api';
import {Icon, Badge} from '../../components/ui';
import {BorderRadius, FontSizes, Shadows, Spacing} from '../../constants/theme';
import type {Quiz, QuizAttempt} from '../../types/api';

export function QuizzesScreen() {
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
        q.attempts?.map((a: QuizAttempt) => a.score) || []
      );
      
      setStats({
        completed: completedQuizzes.length,
        avgScore: scores.length > 0 
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0,
        bestScore: scores.length > 0 ? Math.max(...scores) : 0,
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

  const handleQuizPress = async (quiz: Quiz) => {
    // Show quiz details and start option
    Alert.alert(
      quiz.quizTitle,
      `${quiz.totalQuestions} questions • ${quiz.duration} min\n\nReady to start this quiz?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Start Quiz',
          onPress: () => startQuiz(quiz),
        },
      ]
    );
  };

  const startQuiz = async (quiz: Quiz) => {
    if (!currentStudent) return;
    
    try {
      const response = await quizzesApi.startAttempt(quiz.id, currentStudent.id);
      if (response.success && response.data) {
        // Navigate to quiz taking screen (would need to create this)
        Alert.alert('Quiz Started', `Attempt ID: ${response.data.id}\n\nQuiz taking screen coming soon!`);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to start quiz');
    }
  };

  const getQuizTypeLabel = (type: string) => {
    switch (type) {
      case 'topic': return 'Topic Quiz';
      case 'chapter': return 'Chapter Test';
      case 'mock': return 'Mock Test';
      case 'practice': return 'Practice';
      default: return type;
    }
  };

  const getLatestScore = (quiz: Quiz): number | null => {
    if (quiz.attempts && quiz.attempts.length > 0) {
      return quiz.attempts[quiz.attempts.length - 1].score;
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
                    <Icon name="file-text" size={24} color={primary} />
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
                          {score}%
                        </Text>
                      )}
                    </View>
                    <Text style={[styles.quizTitle, {color: text}]}>
                      {quiz.quizTitle}
                    </Text>
                    <View style={styles.quizMeta}>
                      <Text style={[styles.quizMetaText, {color: textSecondary}]}>
                        {quiz.totalQuestions} questions
                      </Text>
                      <Text style={[styles.quizMetaText, {color: textSecondary}]}>
                        {quiz.duration} min
                      </Text>
                    </View>
                  </View>
                  <Icon name="chevron-right" size={20} color={textSecondary} />
                </TouchableOpacity>
              );
            })
          )}
        </Animated.View>
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
