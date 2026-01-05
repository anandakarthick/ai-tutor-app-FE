/**
 * Quiz Taking Screen
 * Take quizzes with real-time answer submission
 */

import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Alert,
  BackHandler,
  Platform,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {useStudent} from '../../context';
import {quizzesApi} from '../../services/api';
import {Icon, Button} from '../../components/ui';
import {BorderRadius, FontSizes, Spacing, Shadows} from '../../constants/theme';
import type {Quiz, Question, QuizAttempt} from '../../types/api';

export function QuizTakingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {quizId} = route.params;
  const {currentStudent} = useStudent();
  const insets = useSafeAreaInsets();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<QuizAttempt | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const primary = useThemeColor({}, 'primary');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const success = useThemeColor({}, 'success');
  const error = useThemeColor({}, 'error');
  const warning = useThemeColor({}, 'warning');
  const primaryBg = useThemeColor({}, 'primaryBackground');

  // Calculate safe bottom padding for footer
  const bottomPadding = Platform.OS === 'ios' ? Math.max(insets.bottom, 16) : 16;

  // Load quiz and start attempt
  useEffect(() => {
    loadQuiz();
    
    // Handle back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleExit();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && !showResults) {
      timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && quiz && !showResults && questions.length > 0) {
      submitQuiz();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, showResults]);

  // Animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {toValue: 1, duration: 400, useNativeDriver: true}),
      Animated.timing(slideAnim, {toValue: 0, duration: 400, useNativeDriver: true}),
    ]).start();
  }, [currentIndex]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      
      // Get quiz with questions
      const quizRes = await quizzesApi.getById(quizId);
      if (!quizRes.success || !quizRes.data) {
        throw new Error('Quiz not found');
      }
      
      const quizData = quizRes.data;
      setQuiz(quizData);
      setQuestions(quizData.questions || []);
      setTimeLeft(quizData.timeLimitMinutes ? quizData.timeLimitMinutes * 60 : 0);
      
      // Start attempt
      if (currentStudent) {
        const attemptRes = await quizzesApi.startAttempt(quizId, currentStudent.id);
        if (attemptRes.success && attemptRes.data) {
          setAttempt(attemptRes.data);
        }
      }
    } catch (err: any) {
      console.log('Load quiz error:', err);
      Alert.alert('Error', err.message || 'Failed to load quiz');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNext = async () => {
    if (!selectedAnswer || !attempt || !questions[currentIndex]) return;

    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
    
    // Submit answer to API
    try {
      await quizzesApi.submitAnswer(
        attempt.id,
        questions[currentIndex].id,
        selectedAnswer,
        timeTaken
      );
    } catch (err) {
      console.log('Submit answer error:', err);
    }

    // Save locally
    setAnswers(prev => ({
      ...prev,
      [questions[currentIndex].id]: selectedAnswer,
    }));

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(answers[questions[currentIndex + 1]?.id] || null);
      setQuestionStartTime(Date.now());
      
      // Reset animation
      fadeAnim.setValue(0);
      slideAnim.setValue(30);
    } else {
      handleSubmitQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedAnswer(answers[questions[currentIndex - 1]?.id] || null);
      fadeAnim.setValue(0);
      slideAnim.setValue(-30);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!attempt) return;

    Alert.alert(
      'Submit Quiz',
      'Are you sure you want to submit? You cannot change your answers after submission.',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Submit', onPress: submitQuiz},
      ]
    );
  };

  const submitQuiz = async () => {
    if (!attempt) return;
    
    setSubmitting(true);
    try {
      const response = await quizzesApi.submit(attempt.id);
      if (response.success && response.data) {
        setResults(response.data);
        setShowResults(true);
      }
    } catch (err) {
      console.log('Submit quiz error:', err);
      Alert.alert('Error', 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExit = () => {
    Alert.alert(
      'Exit Quiz',
      'Are you sure you want to exit? Your progress will be lost.',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Exit', style: 'destructive', onPress: () => navigation.goBack()},
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getOptionLetter = (index: number) => {
    return String.fromCharCode(65 + index); // A, B, C, D...
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: background}]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primary} />
          <Text style={[styles.loadingText, {color: textSecondary}]}>Loading quiz...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (showResults && results) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: background}]} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.resultsContainer}>
          <View style={[styles.resultsCard, {backgroundColor: card}, Shadows.lg]}>
            <Text style={styles.resultsEmoji}>
              {results.isPassed ? '🎉' : '😔'}
            </Text>
            <Text style={[styles.resultsTitle, {color: text}]}>
              {results.isPassed ? 'Congratulations!' : 'Keep Learning!'}
            </Text>
            <Text style={[styles.resultsSubtitle, {color: textSecondary}]}>
              {results.isPassed ? 'You passed the quiz!' : "Don't worry, practice makes perfect!"}
            </Text>
            
            <View style={[styles.scoreCircle, {borderColor: results.isPassed ? success : error}]}>
              <Text style={[styles.scorePercent, {color: results.isPassed ? success : error}]}>
                {Math.round(results.percentage || 0)}%
              </Text>
              <Text style={[styles.scoreLabel, {color: textMuted}]}>Score</Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={[styles.statBox, {backgroundColor: `${success}15`}]}>
                <Text style={[styles.statValue, {color: success}]}>{results.correctAnswers}</Text>
                <Text style={[styles.statLabel, {color: textMuted}]}>Correct</Text>
              </View>
              <View style={[styles.statBox, {backgroundColor: `${error}15`}]}>
                <Text style={[styles.statValue, {color: error}]}>{results.wrongAnswers}</Text>
                <Text style={[styles.statLabel, {color: textMuted}]}>Wrong</Text>
              </View>
              <View style={[styles.statBox, {backgroundColor: `${primary}15`}]}>
                <Text style={[styles.statValue, {color: primary}]}>{results.xpEarned || 0}</Text>
                <Text style={[styles.statLabel, {color: textMuted}]}>XP Earned</Text>
              </View>
            </View>

            <View style={styles.resultsActions}>
              <Button
                title="Back to Quizzes"
                variant="outline"
                onPress={() => navigation.goBack()}
              />
              <Button
                title="Try Again"
                onPress={() => {
                  setShowResults(false);
                  setResults(null);
                  setCurrentIndex(0);
                  setAnswers({});
                  setSelectedAnswer(null);
                  loadQuiz();
                }}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <View style={[styles.container, {backgroundColor: background}]}>
      {/* Header with SafeArea for top only */}
      <SafeAreaView edges={['top']} style={{backgroundColor: primary}}>
        <View style={[styles.header, {backgroundColor: primary}]}>
          <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
            <Icon name="x" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.quizTitle} numberOfLines={1}>{quiz?.quizTitle}</Text>
            <Text style={styles.questionCount}>
              Question {currentIndex + 1} of {questions.length}
            </Text>
          </View>
          {timeLeft > 0 && (
            <View style={[styles.timerBadge, {backgroundColor: timeLeft < 60 ? error : 'rgba(255,255,255,0.2)'}]}>
              <Icon name="clock" size={14} color="#FFF" />
              <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            </View>
          )}
        </View>
      </SafeAreaView>

      {/* Progress Bar */}
      <View style={[styles.progressBar, {backgroundColor: border}]}>
        <View 
          style={[
            styles.progressFill, 
            {backgroundColor: primary, width: `${((currentIndex + 1) / questions.length) * 100}%`}
          ]} 
        />
      </View>

      {/* Question - ScrollView with bottom padding for footer */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.questionContainer, {paddingBottom: 100 + bottomPadding}]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{opacity: fadeAnim, transform: [{translateY: slideAnim}]}}>
          <View style={[styles.questionCard, {backgroundColor: card}, Shadows.md]}>
            <View style={[styles.questionBadge, {backgroundColor: primaryBg}]}>
              <Text style={[styles.questionBadgeText, {color: primary}]}>
                {currentQuestion?.questionType?.toUpperCase() || 'MCQ'}
              </Text>
            </View>
            <Text style={[styles.questionText, {color: text}]}>
              {currentQuestion?.questionText}
            </Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {currentQuestion?.options?.map((option: string, index: number) => {
              const isSelected = selectedAnswer === option;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: isSelected ? primaryBg : card,
                      borderColor: isSelected ? primary : border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                    Shadows.sm,
                  ]}
                  onPress={() => handleSelectAnswer(option)}
                  activeOpacity={0.8}>
                  <View style={[
                    styles.optionLetter,
                    {backgroundColor: isSelected ? primary : border}
                  ]}>
                    <Text style={[styles.optionLetterText, {color: isSelected ? '#FFF' : text}]}>
                      {getOptionLetter(index)}
                    </Text>
                  </View>
                  <Text style={[styles.optionText, {color: isSelected ? primary : text}]}>
                    {option}
                  </Text>
                  {isSelected && (
                    <Icon name="check-circle" size={20} color={primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Footer Navigation - Fixed at bottom with safe area */}
      <View style={[
        styles.footer, 
        {
          backgroundColor: card, 
          borderTopColor: border,
          paddingBottom: bottomPadding,
        }
      ]}>
        <TouchableOpacity
          style={[styles.navButton, {opacity: currentIndex === 0 ? 0.5 : 1}]}
          onPress={handlePrevious}
          disabled={currentIndex === 0}>
          <Icon name="chevron-left" size={20} color={primary} />
          <Text style={[styles.navButtonText, {color: primary}]}>Previous</Text>
        </TouchableOpacity>

        <View style={styles.questionDots}>
          {questions.slice(
            Math.max(0, currentIndex - 2),
            Math.min(questions.length, currentIndex + 3)
          ).map((_, i) => {
            const actualIndex = Math.max(0, currentIndex - 2) + i;
            return (
              <View
                key={actualIndex}
                style={[
                  styles.dot,
                  {
                    backgroundColor: actualIndex === currentIndex 
                      ? primary 
                      : answers[questions[actualIndex]?.id] 
                        ? success 
                        : border,
                  },
                ]}
              />
            );
          })}
        </View>

        <TouchableOpacity
          style={[
            styles.navButton,
            styles.nextButton,
            {
              backgroundColor: selectedAnswer ? primary : border,
              opacity: selectedAnswer ? 1 : 0.5,
            },
          ]}
          onPress={handleNext}
          disabled={!selectedAnswer || submitting}>
          {submitting ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Text style={styles.nextButtonText}>
                {currentIndex === questions.length - 1 ? 'Submit' : 'Next'}
              </Text>
              <Icon name="chevron-right" size={20} color="#FFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
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
    marginTop: Spacing.md, 
    fontSize: FontSizes.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  exitButton: {
    width: 40, 
    height: 40, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1, 
    alignItems: 'center',
  },
  quizTitle: {
    fontSize: FontSizes.base, 
    fontWeight: '600', 
    color: '#FFF',
  },
  questionCount: {
    fontSize: FontSizes.xs, 
    color: 'rgba(255,255,255,0.8)', 
    marginTop: 2,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  timerText: {
    fontSize: FontSizes.sm, 
    fontWeight: '700', 
    color: '#FFF',
  },
  progressBar: {
    height: 4,
  },
  progressFill: {
    height: '100%',
  },
  scrollView: {
    flex: 1,
  },
  questionContainer: {
    padding: Spacing.lg,
  },
  questionCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
  },
  questionBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  questionBadgeText: {
    fontSize: FontSizes.xs, 
    fontWeight: '700',
  },
  questionText: {
    fontSize: FontSizes.lg, 
    fontWeight: '500', 
    lineHeight: 28,
  },
  optionsContainer: {
    gap: Spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetterText: {
    fontSize: FontSizes.sm, 
    fontWeight: '700',
  },
  optionText: {
    flex: 1, 
    fontSize: FontSizes.base,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  navButton: {
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: Spacing.xs,
  },
  navButtonText: {
    fontSize: FontSizes.sm, 
    fontWeight: '600',
  },
  nextButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  nextButtonText: {
    fontSize: FontSizes.sm, 
    fontWeight: '600', 
    color: '#FFF',
  },
  questionDots: {
    flexDirection: 'row', 
    gap: Spacing.xs,
  },
  dot: {
    width: 8, 
    height: 8, 
    borderRadius: 4,
  },
  // Results styles
  resultsContainer: {
    flexGrow: 1, 
    justifyContent: 'center', 
    padding: Spacing.lg,
  },
  resultsCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius['2xl'],
    alignItems: 'center',
  },
  resultsEmoji: {
    fontSize: 64, 
    marginBottom: Spacing.md,
  },
  resultsTitle: {
    fontSize: FontSizes['2xl'], 
    fontWeight: '700', 
    marginBottom: Spacing.xs,
  },
  resultsSubtitle: {
    fontSize: FontSizes.base, 
    textAlign: 'center', 
    marginBottom: Spacing.xl,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  scorePercent: {
    fontSize: FontSizes['3xl'], 
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: FontSizes.sm,
  },
  statsGrid: {
    flexDirection: 'row', 
    gap: Spacing.md, 
    marginBottom: Spacing.xl,
  },
  statBox: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSizes.xl, 
    fontWeight: '700',
  },
  statLabel: {
    fontSize: FontSizes.xs, 
    marginTop: 2,
  },
  resultsActions: {
    flexDirection: 'row', 
    gap: Spacing.md, 
    width: '100%',
  },
});
