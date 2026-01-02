/**
 * Learn Screen
 * Browse subjects and chapters - API Integrated
 */

import React, {useEffect, useRef, useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
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

export function LearnScreen() {
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme() ?? 'light';
  const {currentStudent} = useStudent();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Fetch subjects based on student's class
  const {subjects, loading, error, refresh} = useSubjects(currentStudent?.classId);
  const [subjectProgress, setSubjectProgress] = useState<Record<string, number>>({});
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
    if (!currentStudent) return;
    try {
      console.log('[LearnScreen] Loading subject progress for student:', currentStudent.id);
      const response = await progressApi.getOverall(currentStudent.id);
      if (response.success && response.data?.subjectProgress) {
        const progressMap: Record<string, number> = {};
        response.data.subjectProgress.forEach(sp => {
          progressMap[sp.subjectId] = sp.avgProgress || 0;
        });
        setSubjectProgress(progressMap);
      }
    } catch (err) {
      console.log('[LearnScreen] Load progress error:', err);
    }
  }, [currentStudent]);

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

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
      <Animated.View
        style={[
          styles.header,
          {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
        ]}>
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
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[primary]} />
        }>
        {subjects.length === 0 && !loading ? (
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
          <Animated.View
            style={[
              styles.subjectsGrid,
              {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
            ]}>
            {subjects.map((subject, index) => {
              const subjectTheme = getSubjectTheme(subject.displayName, colorScheme);
              const progress = subjectProgress[subject.id] || 0;
              return (
                <SubjectGridCard
                  key={subject.id}
                  name={subject.displayName}
                  icon={getIcon(subject.displayName)}
                  emoji={getEmoji(subject.displayName)}
                  progress={Math.round(progress)}
                  chapters={subject.totalChapters || 0}
                  theme={subjectTheme}
                  cardColor={card}
                  textColor={text}
                  textSecondary={textSecondary}
                  delay={index * 50}
                  onPress={() => handleSubjectPress(subject)}
                />
              );
            })}
          </Animated.View>
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
  chapters,
  theme,
  cardColor,
  textColor,
  textSecondary,
  delay,
  onPress,
}: {
  name: string;
  icon: string;
  emoji: string;
  progress: number;
  chapters: number;
  theme: {primary: string; background: string; icon: string};
  cardColor: string;
  textColor: string;
  textSecondary: string;
  delay: number;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        delay,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.subjectCardWrapper,
        {transform: [{scale: scaleAnim}], opacity: opacityAnim},
      ]}>
      <TouchableOpacity
        style={[styles.subjectCard, {backgroundColor: cardColor}, Shadows.md]}
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
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
        <View style={styles.progressContainer}>
          <ProgressBar progress={progress} size="sm" showLabel={false} />
          <Text style={[styles.progressText, {color: theme.primary}]}>
            {progress}%
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
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
    marginBottom: Spacing.md,
  },
  progressContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    minWidth: 30,
  },
});
