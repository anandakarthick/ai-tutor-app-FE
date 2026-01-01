/**
 * Chapter Screen
 * Shows lessons list for a chapter
 */

import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {Icon, Badge} from '../../components/ui';
import {BorderRadius, FontSizes, Spacing, Shadows} from '../../constants/theme';

// Mock lessons data
const LESSONS_DATA: Record<string, any[]> = {
  'Real Numbers': [
    {id: '1', title: 'Introduction to Real Numbers', duration: '15 min', type: 'video', isCompleted: true},
    {id: '2', title: 'Euclid\'s Division Lemma', duration: '20 min', type: 'video', isCompleted: true},
    {id: '3', title: 'The Fundamental Theorem of Arithmetic', duration: '25 min', type: 'video', isCompleted: true},
    {id: '4', title: 'Practice Problems', duration: '10 min', type: 'quiz', isCompleted: true},
    {id: '5', title: 'Revisiting Irrational Numbers', duration: '18 min', type: 'video', isCompleted: true},
    {id: '6', title: 'Revisiting Rational Numbers', duration: '15 min', type: 'video', isCompleted: true},
    {id: '7', title: 'Summary & Key Points', duration: '10 min', type: 'notes', isCompleted: true},
    {id: '8', title: 'Chapter Test', duration: '30 min', type: 'quiz', isCompleted: true},
  ],
  'Pair of Linear Equations': [
    {id: '1', title: 'Introduction to Linear Equations', duration: '15 min', type: 'video', isCompleted: true},
    {id: '2', title: 'Graphical Method of Solution', duration: '22 min', type: 'video', isCompleted: true},
    {id: '3', title: 'Algebraic Methods', duration: '25 min', type: 'video', isCompleted: true},
    {id: '4', title: 'Substitution Method', duration: '20 min', type: 'video', isCompleted: true},
    {id: '5', title: 'Elimination Method', duration: '18 min', type: 'video', isCurrent: true},
    {id: '6', title: 'Cross-Multiplication Method', duration: '20 min', type: 'video', isLocked: false},
    {id: '7', title: 'Practice Problems', duration: '15 min', type: 'quiz', isLocked: false},
    {id: '8', title: 'Equations Reducible to Linear Form', duration: '22 min', type: 'video', isLocked: false},
    {id: '9', title: 'Summary & Key Points', duration: '10 min', type: 'notes', isLocked: false},
    {id: '10', title: 'Chapter Test', duration: '30 min', type: 'quiz', isLocked: true},
  ],
  'Chemical Reactions and Equations': [
    {id: '1', title: 'Introduction to Chemical Reactions', duration: '18 min', type: 'video', isCompleted: true},
    {id: '2', title: 'Chemical Equations', duration: '20 min', type: 'video', isCompleted: true},
    {id: '3', title: 'Writing Chemical Equations', duration: '22 min', type: 'video', isCompleted: true},
    {id: '4', title: 'Balancing Chemical Equations', duration: '25 min', type: 'video', isCurrent: true},
    {id: '5', title: 'Types of Chemical Reactions', duration: '30 min', type: 'video', isLocked: false},
    {id: '6', title: 'Practice Problems', duration: '15 min', type: 'quiz', isLocked: false},
  ],
};

const getDefaultLessons = (chapterTitle: string) => [
  {id: '1', title: `Introduction to ${chapterTitle}`, duration: '15 min', type: 'video', isCompleted: true},
  {id: '2', title: 'Key Concepts Explained', duration: '20 min', type: 'video', isCompleted: true},
  {id: '3', title: 'Detailed Analysis', duration: '25 min', type: 'video', isCurrent: true},
  {id: '4', title: 'Practice Problems', duration: '15 min', type: 'quiz', isLocked: false},
  {id: '5', title: 'Summary & Notes', duration: '10 min', type: 'notes', isLocked: false},
  {id: '6', title: 'Chapter Test', duration: '30 min', type: 'quiz', isLocked: true},
];

export function ChapterScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {subject, chapter, chapterId, subjectColor} = route.params;
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const success = useThemeColor({}, 'success');

  const lessons = LESSONS_DATA[chapter] || getDefaultLessons(chapter);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const completedLessons = lessons.filter((l: any) => l.isCompleted).length;
  const progress = Math.round((completedLessons / lessons.length) * 100);

  const handleLessonPress = (lesson: any) => {
    if (lesson.isLocked) return;
    navigation.navigate('Lesson', {
      subject,
      chapter,
      lesson: lesson.title,
      lessonId: lesson.id,
      subjectColor,
      lessonType: lesson.type,
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return 'play';
      case 'quiz': return 'file-text';
      case 'notes': return 'book';
      default: return 'play';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'video': return 'Lesson';
      case 'quiz': return 'Quiz';
      case 'notes': return 'Notes';
      default: return 'Lesson';
    }
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: background}]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, {borderBottomColor: border}]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerSubject, {color: subjectColor}]}>{subject}</Text>
          <Text style={[styles.headerTitle, {color: text}]} numberOfLines={1}>
            {chapter}
          </Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Icon name="more-vertical" size={24} color={textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        
        {/* Progress Card */}
        <Animated.View style={[styles.progressCard, {backgroundColor: subjectColor, opacity: fadeAnim}]}>
          <View style={styles.progressDecor1} />
          <View style={styles.progressDecor2} />
          
          <View style={styles.progressContent}>
            <View style={styles.progressLeft}>
              <Text style={styles.progressTitle}>Chapter Progress</Text>
              <Text style={styles.progressSubtitle}>
                {completedLessons} of {lessons.length} lessons completed
              </Text>
            </View>
            <View style={styles.progressCircle}>
              <Text style={styles.progressPercent}>{progress}%</Text>
            </View>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, {width: `${progress}%`}]} />
            </View>
          </View>
          
          {/* Continue Button */}
          {lessons.find((l: any) => l.isCurrent) && (
            <TouchableOpacity 
              style={styles.continueButton}
              onPress={() => handleLessonPress(lessons.find((l: any) => l.isCurrent))}>
              <Icon name="play" size={16} color={subjectColor} />
              <Text style={[styles.continueText, {color: subjectColor}]}>Continue Learning</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Lessons List */}
        <Text style={[styles.sectionTitle, {color: text}]}>
          Lessons 📖
        </Text>

        {lessons.map((lesson: any, index: number) => (
          <Animated.View key={lesson.id} style={{opacity: fadeAnim}}>
            <TouchableOpacity
              style={[
                styles.lessonCard,
                {
                  backgroundColor: card,
                  borderColor: lesson.isCurrent ? subjectColor : border,
                  borderWidth: lesson.isCurrent ? 2 : 1,
                  opacity: lesson.isLocked ? 0.5 : 1,
                },
                Shadows.sm,
              ]}
              onPress={() => handleLessonPress(lesson)}
              disabled={lesson.isLocked}>
              
              {/* Lesson Number/Icon */}
              <View
                style={[
                  styles.lessonIcon,
                  {
                    backgroundColor: lesson.isCompleted
                      ? success
                      : lesson.isCurrent
                      ? subjectColor
                      : `${subjectColor}15`,
                  },
                ]}>
                {lesson.isCompleted ? (
                  <Icon name="check" size={16} color="#FFF" />
                ) : lesson.isLocked ? (
                  <Icon name="lock" size={14} color={textMuted} />
                ) : (
                  <Icon
                    name={getTypeIcon(lesson.type)}
                    size={16}
                    color={lesson.isCurrent ? '#FFF' : subjectColor}
                  />
                )}
              </View>

              {/* Lesson Info */}
              <View style={styles.lessonInfo}>
                <View style={styles.lessonTitleRow}>
                  <Text style={[styles.lessonTitle, {color: text}]} numberOfLines={2}>
                    {lesson.title}
                  </Text>
                </View>
                <View style={styles.lessonMeta}>
                  <Badge 
                    label={getTypeLabel(lesson.type)} 
                    variant={lesson.type === 'quiz' ? 'info' : lesson.type === 'notes' ? 'success' : 'primary'} 
                    size="sm" 
                  />
                  <View style={styles.durationBadge}>
                    <Icon name="clock" size={10} color={textMuted} />
                    <Text style={[styles.durationText, {color: textMuted}]}>
                      {lesson.duration}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Play/Status Icon */}
              {!lesson.isLocked && (
                <View style={[styles.playButton, {backgroundColor: `${subjectColor}15`}]}>
                  <Icon 
                    name={lesson.isCompleted ? 'refresh-cw' : 'play'} 
                    size={16} 
                    color={subjectColor} 
                  />
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}

        <View style={{height: Spacing['3xl']}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    marginHorizontal: Spacing.sm,
  },
  headerSubject: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  progressCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    position: 'relative',
    overflow: 'hidden',
  },
  progressDecor1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  progressDecor2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  progressContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  progressLeft: {},
  progressTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercent: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: '#FFF',
  },
  progressBarContainer: {
    marginBottom: Spacing.md,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 4,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  continueText: {
    fontSize: FontSizes.base,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    marginBottom: Spacing.lg,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  lessonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitleRow: {
    marginBottom: Spacing.xs,
  },
  lessonTitle: {
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: FontSizes.xs,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
