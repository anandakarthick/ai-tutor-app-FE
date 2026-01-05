/**
 * Learn Screen
 * Browse subjects and chapters - API Integrated
 */

import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {useStudent} from '../../context';
import {useSubjects} from '../../hooks/useApi';
import {progressApi} from '../../services/api';
import {Icon, ProgressBar} from '../../components/ui';
import {
  BorderRadius,
  FontSizes,
  Shadows,
  Spacing,
  getSubjectTheme,
} from '../../constants/theme';
import type {Subject} from '../../types/api';

// Subject emoji mapping
const SUBJECT_EMOJI: Record<string, string> = {
  Mathematics: '📐',
  Science: '🔬',
  English: '📖',
  Hindi: '📚',
  'Social Science': '🌍',
  Physics: '⚛️',
  Chemistry: '🧪',
  Biology: '🧬',
  History: '📜',
  Geography: '🗺️',
  default: '📘',
};

// Subject icon mapping
const SUBJECT_ICON: Record<string, string> = {
  Mathematics: 'function',
  Science: 'flask',
  English: 'book',
  Hindi: 'book',
  'Social Science': 'globe',
  Physics: 'atom',
  Chemistry: 'flask',
  Biology: 'heart',
  History: 'clock',
  Geography: 'map',
  default: 'book-open',
};

interface SubjectProgressData {
  subjectId: string;
  subjectName: string;
  totalTopics: number;
  completedTopics: number;
  totalTimeMinutes: number;
  avgProgress: number;
}

export function LearnScreen() {
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme() ?? 'light';
  const {currentStudent} = useStudent();

  // Fetch subjects based on student's class
  const {subjects, loading, error, refresh} = useSubjects(currentStudent?.classId);
  const [subjectProgress, setSubjectProgress] = useState<Record<string, SubjectProgressData>>({});
  const [progressLoading, setProgressLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const card = useThemeColor({}, 'card');
  const primary = useThemeColor({}, 'primary');
  const primaryBg = useThemeColor({}, 'primaryBackground');
  const border = useThemeColor({}, 'border');

  // Load progress for subjects
  const loadProgress = useCallback(async () => {
    if (!currentStudent?.id) {
      console.log('[LearnScreen] No student ID, skipping progress load');
      return;
    }
    
    setProgressLoading(true);
    try {
      console.log('[LearnScreen] Loading subject progress for student:', currentStudent.id);
      // Always skip cache to get fresh data
      const response = await progressApi.getOverall(currentStudent.id, true);
      console.log('[LearnScreen] Progress API response:', JSON.stringify(response, null, 2));
      
      if (response.success && response.data?.subjectProgress) {
        const progressMap: Record<string, SubjectProgressData> = {};
        
        response.data.subjectProgress.forEach((sp: SubjectProgressData) => {
          // Store the full progress data
          progressMap[sp.subjectId] = {
            ...sp,
            // Ensure avgProgress is a valid number between 0-100
            avgProgress: Math.min(100, Math.max(0, Number(sp.avgProgress) || 0)),
          };
          console.log(`[LearnScreen] Subject ${sp.subjectName} (${sp.subjectId}): ${sp.completedTopics}/${sp.totalTopics} topics, avgProgress=${sp.avgProgress}%`);
        });
        
        setSubjectProgress(progressMap);
        console.log('[LearnScreen] Progress map set with', Object.keys(progressMap).length, 'subjects');
      } else {
        console.log('[LearnScreen] No progress data found in response');
        setSubjectProgress({});
      }
    } catch (err: any) {
      console.log('[LearnScreen] Load progress error:', err.message || err);
      setSubjectProgress({});
    } finally {
      setProgressLoading(false);
    }
  }, [currentStudent?.id]);

  // Refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      console.log('[LearnScreen] Screen focused - refreshing data');
      if (currentStudent?.classId) {
        refresh();
        loadProgress();
      }
    }, [refresh, loadProgress, currentStudent?.classId])
  );

  const handleRefresh = useCallback(async () => {
    console.log('[LearnScreen] Pull-to-refresh triggered');
    setRefreshing(true);
    try {
      if (currentStudent?.classId) {
        await Promise.all([refresh(), loadProgress()]);
      }
    } catch (err) {
      console.log('[LearnScreen] Refresh error:', err);
    }
    setRefreshing(false);
  }, [refresh, loadProgress, currentStudent?.classId]);

  const handleSubjectPress = (subject: Subject) => {
    navigation.navigate('SubjectDetail', {
      subject: subject.displayName,
      subjectId: subject.id,
    });
  };

  const getEmoji = (name: string) => SUBJECT_EMOJI[name] || SUBJECT_EMOJI.default;
  const getIcon = (name: string) => SUBJECT_ICON[name] || SUBJECT_ICON.default;

  // Get progress percentage for a subject
  const getSubjectProgressPercent = (subjectId: string): number => {
    const progressData = subjectProgress[subjectId];
    if (!progressData) return 0;
    return Math.round(progressData.avgProgress);
  };

  // No student profile - show setup prompt
  if (!currentStudent) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: background}]} edges={['top']}>
        <View style={styles.header}>
          <Text style={[styles.title, {color: text}]}>Learn 📚</Text>
          <Text style={[styles.subtitle, {color: textSecondary}]}>
            Start your learning journey
          </Text>
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[primary]} />
          }>
          <View style={[styles.emptyCard, {backgroundColor: card}]}>
            <View style={[styles.emptyIcon, {backgroundColor: primaryBg}]}>
              <Text style={styles.emptyEmoji}>🎓</Text>
            </View>
            <Text style={[styles.emptyTitle, {color: text}]}>
              Complete Your Profile
            </Text>
            <Text style={[styles.emptyDescription, {color: textSecondary}]}>
              Set up your student profile to see subjects for your class and start learning!
            </Text>
            <TouchableOpacity
              style={[styles.actionButton, {backgroundColor: primary}]}
              onPress={() => navigation.navigate('Profile')}>
              <Icon name="user" size={18} color="#FFF" />
              <Text style={styles.actionButtonText}>Go to Profile</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Student exists but no class selected - prompt to complete setup
  if (!currentStudent.classId) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: background}]} edges={['top']}>
        <View style={styles.header}>
          <Text style={[styles.title, {color: text}]}>Learn 📚</Text>
          <Text style={[styles.subtitle, {color: textSecondary}]}>
            Hi, {currentStudent.studentName}!
          </Text>
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[primary]} />
          }>
          <View style={[styles.emptyCard, {backgroundColor: card}]}>
            <View style={[styles.emptyIcon, {backgroundColor: primaryBg}]}>
              <Text style={styles.emptyEmoji}>📝</Text>
            </View>
            <Text style={[styles.emptyTitle, {color: text}]}>
              Select Your Class
            </Text>
            <Text style={[styles.emptyDescription, {color: textSecondary}]}>
              Please select your board and class in your profile to see available subjects.
            </Text>
            <TouchableOpacity
              style={[styles.actionButton, {backgroundColor: primary}]}
              onPress={() => navigation.navigate('Profile')}>
              <Icon name="settings" size={18} color="#FFF" />
              <Text style={styles.actionButtonText}>Update Profile</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Loading state
  if (loading && subjects.length === 0) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: background}]} edges={['top']}>
        <View style={styles.header}>
          <Text style={[styles.title, {color: text}]}>Learn 📚</Text>
          <Text style={[styles.subtitle, {color: textSecondary}]}>
            {currentStudent?.class?.displayName || 'Loading...'}
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primary} />
          <Text style={[styles.loadingText, {color: textSecondary}]}>Loading subjects...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: background}]}
      edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.title, {color: text}]}>Learn 📚</Text>
            <Text style={[styles.subtitle, {color: textSecondary}]}>
              {currentStudent?.class?.displayName || 'Pick a subject to start'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.searchBtn, {backgroundColor: card}, Shadows.sm]}>
            <Icon name="search" size={20} color={primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[primary]} />
        }>
        {error ? (
          <View style={[styles.emptyCard, {backgroundColor: card}]}>
            <View style={[styles.emptyIcon, {backgroundColor: '#FEE2E2'}]}>
              <Text style={styles.emptyEmoji}>⚠️</Text>
            </View>
            <Text style={[styles.emptyTitle, {color: text}]}>
              Something went wrong
            </Text>
            <Text style={[styles.emptyDescription, {color: textSecondary}]}>
              {error}
            </Text>
            <TouchableOpacity
              style={[styles.actionButton, {backgroundColor: primary}]}
              onPress={handleRefresh}>
              <Icon name="refresh-cw" size={18} color="#FFF" />
              <Text style={styles.actionButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : subjects.length === 0 && !loading ? (
          <View style={[styles.emptyCard, {backgroundColor: card}]}>
            <View style={[styles.emptyIcon, {backgroundColor: primaryBg}]}>
              <Text style={styles.emptyEmoji}>📭</Text>
            </View>
            <Text style={[styles.emptyTitle, {color: text}]}>
              No Subjects Available
            </Text>
            <Text style={[styles.emptyDescription, {color: textSecondary}]}>
              No subjects found for your class. Please check back later or contact support.
            </Text>
            <TouchableOpacity
              style={[styles.actionButton, {backgroundColor: primary}]}
              onPress={handleRefresh}>
              <Icon name="refresh-cw" size={18} color="#FFF" />
              <Text style={styles.actionButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.subjectsGrid}>
            {subjects.map((subject, index) => {
              const subjectTheme = getSubjectTheme(subject.displayName, colorScheme);
              const progress = getSubjectProgressPercent(subject.id);
              const progressData = subjectProgress[subject.id];
              
              return (
                <SubjectGridCard
                  key={subject.id}
                  name={subject.displayName}
                  icon={getIcon(subject.displayName)}
                  emoji={getEmoji(subject.displayName)}
                  progress={progress}
                  completedTopics={progressData?.completedTopics || 0}
                  totalTopics={progressData?.totalTopics || 0}
                  chapters={subject.totalChapters || 0}
                  theme={subjectTheme}
                  cardColor={card}
                  textColor={text}
                  textSecondary={textSecondary}
                  isLoadingProgress={progressLoading}
                  onPress={() => handleSubjectPress(subject)}
                />
              );
            })}
          </View>
        )}
        <View style={{height: Spacing.xl}} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SubjectGridCard({
  name,
  icon,
  emoji,
  progress,
  completedTopics,
  totalTopics,
  chapters,
  theme,
  cardColor,
  textColor,
  textSecondary,
  isLoadingProgress,
  onPress,
}: {
  name: string;
  icon: string;
  emoji: string;
  progress: number;
  completedTopics: number;
  totalTopics: number;
  chapters: number;
  theme: {primary: string; background: string; icon: string};
  cardColor: string;
  textColor: string;
  textSecondary: string;
  isLoadingProgress?: boolean;
  onPress: () => void;
}) {
  const isCompleted = progress >= 100;
  const inProgress = progress > 0 && progress < 100;
  const successColor = '#22C55E';
  
  return (
    <View style={styles.subjectCardWrapper}>
      <TouchableOpacity
        style={[
          styles.subjectCard, 
          {backgroundColor: cardColor}, 
          isCompleted && {borderColor: successColor, borderWidth: 2},
          inProgress && {borderColor: theme.primary, borderWidth: 2},
          Shadows.md
        ]}
        activeOpacity={0.9}
        onPress={onPress}>
        <View style={styles.emojiCorner}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <View style={[styles.subjectIcon, {backgroundColor: theme.background}]}>
          <Icon name={icon} size={28} color={theme.icon} />
        </View>
        <Text style={[styles.subjectName, {color: textColor}]} numberOfLines={1}>
          {name}
        </Text>
        <Text style={[styles.subjectMeta, {color: textSecondary}]}>
          {chapters} chapters
        </Text>
        
        {/* Status Badge */}
        {isCompleted && (
          <View style={[styles.subjectStatusBadge, {backgroundColor: `${successColor}20`}]}>
            <Icon name="check-circle" size={10} color={successColor} />
            <Text style={[styles.subjectStatusText, {color: successColor}]}>Completed</Text>
          </View>
        )}
        {inProgress && (
          <View style={[styles.subjectStatusBadge, {backgroundColor: `${theme.primary}20`}]}>
            <Icon name="loader" size={10} color={theme.primary} />
            <Text style={[styles.subjectStatusText, {color: theme.primary}]}>
              {completedTopics}/{totalTopics} topics
            </Text>
          </View>
        )}
        
        <View style={styles.progressContainer}>
          {isLoadingProgress ? (
            <View style={styles.progressLoadingContainer}>
              <ActivityIndicator size="small" color={theme.primary} />
            </View>
          ) : (
            <>
              <ProgressBar 
                progress={progress} 
                size="sm" 
                showLabel={false} 
                color={isCompleted ? successColor : theme.primary} 
              />
              <Text style={[styles.progressText, {color: isCompleted ? successColor : theme.primary}]}>
                {progress}%
              </Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    </View>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  subtitle: {fontSize: FontSizes.base},
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingTop: 0,
    flexGrow: 1,
  },
  
  // Empty state styles
  emptyCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyEmoji: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
  
  // Subject grid styles
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  subjectCardWrapper: {width: '47%'},
  subjectCard: {
    padding: Spacing.base,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  emojiCorner: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
  },
  emoji: {
    fontSize: 16,
  },
  subjectIcon: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  subjectName: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  subjectMeta: {
    fontSize: FontSizes.xs,
    marginBottom: Spacing.sm,
  },
  subjectStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
    marginBottom: Spacing.sm,
  },
  subjectStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  progressContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressLoadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 20,
  },
  progressText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    minWidth: 30,
  },
});
