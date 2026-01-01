/**
 * Chapter Screen
 * Shows lessons list for a chapter with search
 */

import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  TextInput,
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
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const success = useThemeColor({}, 'success');

  const lessons = LESSONS_DATA[chapter] || getDefaultLessons(chapter);

  // Filter lessons based on search
  const filteredLessons = lessons.filter((lesson: any) =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        
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

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[
            styles.searchBar, 
            {
              backgroundColor: card, 
              borderColor: isSearchFocused ? subjectColor : border,
            }
          ]}>
            <Icon name="search" size={18} color={isSearchFocused ? subjectColor : textMuted} />
            <TextInput
              style={[styles.searchInput, {color: text}]}
              placeholder="Search lessons..."
              placeholderTextColor={textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="x" size={18} color={textMuted} />
              </TouchableOpacity>
            )}
          </View>
          {searchQuery.length > 0 && (
            <Text style={[styles.searchResult, {color: textMuted}]}>
              {filteredLessons.length} lesson{filteredLessons.length !== 1 ? 's' : ''} found
            </Text>
          )}
        </View>

        {/* Lessons List */}
        <Text style={[styles.sectionTitle, {color: text}]}>
          Lessons 📖
        </Text>

        {filteredLessons.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={[styles.emptyText, {color: textMuted}]}>
              No lessons found for "{searchQuery}"
            </Text>
          </View>
        ) : (
          filteredLessons.map((lesson: any, index: number) => (
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
                    <Icon name="check" size={14} color="#FFF" />
                  ) : lesson.isLocked ? (
                    <Icon name="lock" size={12} color={textMuted} />
                  ) : (
                    <Icon
                      name={getTypeIcon(lesson.type)}
                      size={14}
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
                      size={14} 
                      color={subjectColor} 
                    />
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          ))
        )}

        <View style={{height: Spacing['2xl']}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 36,
    height: 36,
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
    fontSize: FontSizes.base,
    fontWeight: '700',
  },
  menuButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: Spacing.md,
  },
  progressCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },
  progressDecor1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  progressDecor2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  progressContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  progressLeft: {},
  progressTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 2,
  },
  progressSubtitle: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  progressCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercent: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: '#FFF',
  },
  progressBarContainer: {
    marginBottom: Spacing.sm,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 3,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  continueText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  searchContainer: {
    marginBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.sm,
    paddingVertical: 4,
  },
  searchResult: {
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    marginBottom: Spacing.md,
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
    fontSize: FontSizes.sm,
    textAlign: 'center',
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  lessonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitleRow: {
    marginBottom: 4,
  },
  lessonTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  durationText: {
    fontSize: FontSizes.xs,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
