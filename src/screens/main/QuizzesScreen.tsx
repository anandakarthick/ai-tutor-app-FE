/**
 * Quizzes Screen
 * Browse and take quizzes - API Integrated
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
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {useStudent} from '../../context';
import {quizzesApi, dashboardApi} from '../../services/api';
import {Icon, Badge} from '../../components/ui';
import {BorderRadius, FontSizes, Shadows, Spacing} from '../../constants/theme';
import type {Quiz, DashboardStats} from '../../types/api';

interface QuizStats {
  completed: number;
  avgScore: number;
  bestScore: number;
}

export function QuizzesScreen() {
  const navigation = useNavigation<any>();
  const {currentStudent} = useStudent();
  
  // Local state
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<QuizStats>({
    completed: 0,
    avgScore: 0,
    bestScore: 0,
  });

  // Theme colors
  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');
  const primaryBg = useThemeColor({}, 'primaryBackground');
  const card = useThemeColor({}, 'card');
  const success = useThemeColor({}, 'success');
  const warning = useThemeColor({}, 'warning');
  const border = useThemeColor({}, 'border');

  // Load quiz stats from dashboard
  const loadStats = useCallback(async () => {
    if (!currentStudent?.id) {
      console.log('[QuizzesScreen] No student ID, skipping stats load');
      setStatsLoading(false);
      return;
    }
    
    try {
      setStatsLoading(true);
      console.log('[QuizzesScreen] Loading quiz stats for student:', currentStudent.id);
      const response = await dashboardApi.getStats(currentStudent.id);
      
      console.log('[QuizzesScreen] Dashboard stats response:', JSON.stringify(response, null, 2));
      
      if (response.success && response.data?.overall) {
        const overall = response.data.overall;
        const newStats = {
          completed: overall.totalQuizzes || 0,
          avgScore: Math.round(overall.avgQuizScore || 0),
          bestScore: Math.round(overall.bestQuizScore || overall.avgQuizScore || 0),
        };
        setStats(newStats);
        console.log('[QuizzesScreen] Quiz stats set:', newStats);
      } else {
        console.log('[QuizzesScreen] No overall data in response');
      }
    } catch (err: any) {
      console.log('[QuizzesScreen] Error loading stats:', err.message || err);
    } finally {
      setStatsLoading(false);
    }
  }, [currentStudent?.id]);

  // Load quizzes
  const loadQuizzes = useCallback(async () => {
    try {
      setError(null);
      console.log('[QuizzesScreen] Loading quizzes...');
      const response = await quizzesApi.getAll();
      console.log('[QuizzesScreen] Quizzes response:', response);
      
      if (response.success && response.data) {
        setQuizzes(response.data);
        console.log('[QuizzesScreen] Loaded', response.data.length, 'quizzes');
      } else {
        setQuizzes([]);
        console.log('[QuizzesScreen] No quizzes found');
      }
    } catch (err: any) {
      console.log('[QuizzesScreen] Error loading quizzes:', err.message || err);
      setError(err.message || 'Failed to load quizzes');
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadQuizzes();
    loadStats();
  }, [loadQuizzes, loadStats]);

  // Refresh stats when screen is focused (e.g., after completing a quiz)
  useFocusEffect(
    useCallback(() => {
      console.log('[QuizzesScreen] Screen focused - refreshing stats');
      loadStats();
    }, [loadStats])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadQuizzes(), loadStats()]);
    setRefreshing(false);
  }, [loadQuizzes, loadStats]);

  const handleQuizPress = (quiz: Quiz) => {
    Alert.alert(
      quiz.quizTitle || 'Quiz',
      `${quiz.totalQuestions || 0} questions • ${quiz.timeLimitMinutes || 15} min\n\nReady to start?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Start Quiz 🚀',
          onPress: () => navigation.navigate('QuizTaking', {quizId: quiz.id}),
        },
      ]
    );
  };

  const getQuizTypeLabel = (type?: string) => {
    switch (type) {
      case 'topic': return 'Topic Quiz';
      case 'chapter': return 'Chapter Test';
      case 'mock': return 'Mock Test';
      case 'practice': return 'Practice';
      case 'daily': return 'Daily Quiz';
      default: return 'Quiz';
    }
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: background}]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, {color: text}]}>Quizzes 📝</Text>
        <Text style={[styles.subtitle, {color: textSecondary}]}>
          Test your knowledge
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh} 
            colors={[primary]} 
          />
        }>
        
        {/* Stats Cards - Now using real data */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, {backgroundColor: card}, Shadows.sm]}>
            <Icon name="check-circle" size={24} color={success} />
            {statsLoading ? (
              <ActivityIndicator size="small" color={success} style={{marginTop: 8}} />
            ) : (
              <Text style={[styles.statValue, {color: text}]}>{stats.completed}</Text>
            )}
            <Text style={[styles.statLabel, {color: textSecondary}]}>Completed</Text>
          </View>
          <View style={[styles.statCard, {backgroundColor: card}, Shadows.sm]}>
            <Icon name="percent" size={24} color={primary} />
            {statsLoading ? (
              <ActivityIndicator size="small" color={primary} style={{marginTop: 8}} />
            ) : (
              <Text style={[styles.statValue, {color: text}]}>{stats.avgScore}%</Text>
            )}
            <Text style={[styles.statLabel, {color: textSecondary}]}>Avg. Score</Text>
          </View>
          <View style={[styles.statCard, {backgroundColor: card}, Shadows.sm]}>
            <Icon name="star" size={24} color={warning} />
            {statsLoading ? (
              <ActivityIndicator size="small" color={warning} style={{marginTop: 8}} />
            ) : (
              <Text style={[styles.statValue, {color: text}]}>{stats.bestScore}%</Text>
            )}
            <Text style={[styles.statLabel, {color: textSecondary}]}>Best Score</Text>
          </View>
        </View>

        {/* Content */}
        {loading ? (
          // Loading State
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={primary} />
            <Text style={[styles.centerText, {color: textSecondary}]}>
              Loading quizzes...
            </Text>
          </View>
        ) : error ? (
          // Error State
          <View style={[styles.emptyCard, {backgroundColor: card}]}>
            <View style={[styles.emptyIcon, {backgroundColor: '#FEE2E2'}]}>
              <Text style={styles.emptyEmoji}>⚠️</Text>
            </View>
            <Text style={[styles.emptyTitle, {color: text}]}>
              Something went wrong
            </Text>
            <Text style={[styles.emptyText, {color: textSecondary}]}>
              {error}
            </Text>
            <TouchableOpacity
              style={[styles.actionButton, {backgroundColor: primary}]}
              onPress={handleRefresh}>
              <Icon name="refresh-cw" size={18} color="#FFF" />
              <Text style={styles.actionButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : quizzes.length === 0 ? (
          // Empty State
          <View style={[styles.emptyCard, {backgroundColor: card}]}>
            <View style={[styles.emptyIcon, {backgroundColor: primaryBg}]}>
              <Text style={styles.emptyEmoji}>📝</Text>
            </View>
            <Text style={[styles.emptyTitle, {color: text}]}>
              No Quizzes Available
            </Text>
            <Text style={[styles.emptyText, {color: textSecondary}]}>
              Quizzes will appear here once you start learning topics. Complete lessons to unlock quizzes!
            </Text>
            <TouchableOpacity
              style={[styles.actionButton, {backgroundColor: primary}]}
              onPress={() => navigation.navigate('Learn')}>
              <Icon name="book-open" size={18} color="#FFF" />
              <Text style={styles.actionButtonText}>Start Learning</Text>
            </TouchableOpacity>
            
            {/* Tips */}
            <View style={[styles.tipsBox, {backgroundColor: background, borderColor: border}]}>
              <Text style={[styles.tipsTitle, {color: text}]}>
                💡 How to unlock quizzes:
              </Text>
              <Text style={[styles.tipItem, {color: textSecondary}]}>
                • Complete topics to unlock topic quizzes
              </Text>
              <Text style={[styles.tipItem, {color: textSecondary}]}>
                • Finish chapters to access chapter tests
              </Text>
              <Text style={[styles.tipItem, {color: textSecondary}]}>
                • Daily quizzes appear every day
              </Text>
            </View>
          </View>
        ) : (
          // Quiz List
          <View>
            <Text style={[styles.sectionTitle, {color: text}]}>
              Available Quizzes ({quizzes.length})
            </Text>
            {quizzes.map((quiz) => (
              <TouchableOpacity
                key={quiz.id}
                style={[styles.quizCard, {backgroundColor: card}, Shadows.sm]}
                onPress={() => handleQuizPress(quiz)}
                activeOpacity={0.7}>
                <View style={[styles.quizIcon, {backgroundColor: `${primary}15`}]}>
                  <Text style={styles.quizEmoji}>📝</Text>
                </View>
                <View style={styles.quizInfo}>
                  <Badge label={getQuizTypeLabel(quiz.quizType)} variant="primary" size="sm" />
                  <Text style={[styles.quizTitle, {color: text}]} numberOfLines={1}>
                    {quiz.quizTitle || 'Untitled Quiz'}
                  </Text>
                  <View style={styles.quizMeta}>
                    <Text style={[styles.quizMetaText, {color: textSecondary}]}>
                      📋 {quiz.totalQuestions || 0} questions
                    </Text>
                    <Text style={[styles.quizMetaText, {color: textSecondary}]}>
                      ⏱️ {quiz.timeLimitMinutes || 15} min
                    </Text>
                  </View>
                </View>
                <Icon name="chevron-right" size={20} color={textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 90,
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
  
  // Center container for loading
  centerContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  centerText: {
    marginTop: 12,
    fontSize: 14,
  },
  
  // Empty/Error state
  emptyCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
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
  emptyText: {
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
  tipsBox: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipItem: {
    fontSize: 13,
    lineHeight: 22,
  },
  
  // Section
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  
  // Quiz card
  quizCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  quizIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  quizEmoji: {
    fontSize: 24,
  },
  quizInfo: {
    flex: 1,
    marginRight: 8,
  },
  quizTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 6,
  },
  quizMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  quizMetaText: {
    fontSize: 12,
  },
});
