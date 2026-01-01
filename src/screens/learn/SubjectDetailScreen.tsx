/**
 * Subject Detail Screen
 * Shows chapters list like Udemy course with search
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

// Mock chapters data
const CHAPTERS_DATA: Record<string, any> = {
  Mathematics: {
    totalChapters: 15,
    completedChapters: 3,
    totalDuration: '45 hours',
    chapters: [
      {
        id: '1',
        title: 'Real Numbers',
        lessons: 8,
        duration: '2.5 hrs',
        progress: 100,
        isCompleted: true,
      },
      {
        id: '2',
        title: 'Polynomials',
        lessons: 6,
        duration: '2 hrs',
        progress: 100,
        isCompleted: true,
      },
      {
        id: '3',
        title: 'Pair of Linear Equations',
        lessons: 10,
        duration: '3.5 hrs',
        progress: 60,
        isCurrent: true,
      },
      {
        id: '4',
        title: 'Quadratic Equations',
        lessons: 8,
        duration: '3 hrs',
        progress: 0,
        isLocked: false,
      },
      {
        id: '5',
        title: 'Arithmetic Progressions',
        lessons: 7,
        duration: '2.5 hrs',
        progress: 0,
        isLocked: false,
      },
      {
        id: '6',
        title: 'Triangles',
        lessons: 9,
        duration: '3 hrs',
        progress: 0,
        isLocked: true,
      },
    ],
  },
  Science: {
    totalChapters: 16,
    completedChapters: 2,
    totalDuration: '50 hours',
    chapters: [
      {
        id: '1',
        title: 'Chemical Reactions and Equations',
        lessons: 10,
        duration: '3 hrs',
        progress: 100,
        isCompleted: true,
      },
      {
        id: '2',
        title: 'Acids, Bases and Salts',
        lessons: 12,
        duration: '4 hrs',
        progress: 100,
        isCompleted: true,
      },
      {
        id: '3',
        title: 'Metals and Non-metals',
        lessons: 8,
        duration: '3 hrs',
        progress: 40,
        isCurrent: true,
      },
      {
        id: '4',
        title: 'Carbon and its Compounds',
        lessons: 10,
        duration: '3.5 hrs',
        progress: 0,
        isLocked: false,
      },
    ],
  },
  English: {
    totalChapters: 12,
    completedChapters: 4,
    totalDuration: '30 hours',
    chapters: [
      {
        id: '1',
        title: 'A Letter to God',
        lessons: 5,
        duration: '1.5 hrs',
        progress: 100,
        isCompleted: true,
      },
      {
        id: '2',
        title: 'Nelson Mandela',
        lessons: 6,
        duration: '2 hrs',
        progress: 100,
        isCompleted: true,
      },
      {
        id: '3',
        title: 'Two Stories about Flying',
        lessons: 5,
        duration: '1.5 hrs',
        progress: 100,
        isCompleted: true,
      },
      {
        id: '4',
        title: 'From the Diary of Anne Frank',
        lessons: 6,
        duration: '2 hrs',
        progress: 100,
        isCompleted: true,
      },
      {
        id: '5',
        title: 'The Hundred Dresses',
        lessons: 7,
        duration: '2 hrs',
        progress: 30,
        isCurrent: true,
      },
    ],
  },
};

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: '#F97316',
  Science: '#22C55E',
  English: '#8B5CF6',
  Physics: '#3B82F6',
  Chemistry: '#14B8A6',
  Biology: '#84CC16',
  History: '#D97706',
  Geography: '#06B6D4',
};

export function SubjectDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {subject} = route.params || {subject: 'Mathematics'};
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const success = useThemeColor({}, 'success');

  const subjectColor = SUBJECT_COLORS[subject] || '#F97316';
  const subjectData = CHAPTERS_DATA[subject] || CHAPTERS_DATA.Mathematics;

  // Filter chapters based on search
  const filteredChapters = subjectData.chapters.filter((chapter: any) =>
    chapter.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleChapterPress = (chapter: any) => {
    if (chapter.isLocked) return;
    navigation.navigate('Chapter', {
      subject,
      chapter: chapter.title,
      chapterId: chapter.id,
      subjectColor,
    });
  };

  const overallProgress = Math.round(
    (subjectData.completedChapters / subjectData.totalChapters) * 100
  );

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: background}]} edges={['top']}>
      {/* Header with gradient */}
      <View style={[styles.header, {backgroundColor: subjectColor}]}>
        <View style={styles.headerDecor1} />
        <View style={styles.headerDecor2} />
        
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="chevron-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton}>
            <Icon name="more-vertical" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <Animated.View style={[styles.headerContent, {opacity: fadeAnim}]}>
          <Text style={styles.subjectEmoji}>
            {subject === 'Mathematics' ? '📐' : 
             subject === 'Science' ? '🔬' : 
             subject === 'English' ? '📖' : '📚'}
          </Text>
          <Text style={styles.subjectTitle}>{subject}</Text>
          <Text style={styles.subjectMeta}>
            {subjectData.totalChapters} Chapters • {subjectData.totalDuration}
          </Text>
          
          {/* Progress */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Overall Progress</Text>
              <Text style={styles.progressValue}>{overallProgress}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <Animated.View 
                style={[
                  styles.progressBarFill, 
                  {width: `${overallProgress}%`}
                ]} 
              />
            </View>
            <Text style={styles.progressDetail}>
              {subjectData.completedChapters} of {subjectData.totalChapters} chapters completed
            </Text>
          </View>
        </Animated.View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, {backgroundColor: background}]}>
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
            placeholder="Search chapters..."
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
            {filteredChapters.length} chapter{filteredChapters.length !== 1 ? 's' : ''} found
          </Text>
        )}
      </View>

      {/* Chapters List */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        
        <Text style={[styles.sectionTitle, {color: text}]}>
          Course Content 📚
        </Text>

        {filteredChapters.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={[styles.emptyText, {color: textMuted}]}>
              No chapters found for "{searchQuery}"
            </Text>
          </View>
        ) : (
          filteredChapters.map((chapter: any, index: number) => (
            <Animated.View
              key={chapter.id}
              style={[
                {
                  opacity: fadeAnim,
                  transform: [{translateY: slideAnim}],
                },
              ]}>
              <TouchableOpacity
                style={[
                  styles.chapterCard,
                  {
                    backgroundColor: card,
                    borderColor: chapter.isCurrent ? subjectColor : border,
                    borderWidth: chapter.isCurrent ? 2 : 1,
                    opacity: chapter.isLocked ? 0.6 : 1,
                  },
                  Shadows.sm,
                ]}
                onPress={() => handleChapterPress(chapter)}
                disabled={chapter.isLocked}>
                
                {/* Chapter Number */}
                <View
                  style={[
                    styles.chapterNumber,
                    {
                      backgroundColor: chapter.isCompleted
                        ? success
                        : chapter.isCurrent
                        ? subjectColor
                        : `${subjectColor}20`,
                    },
                  ]}>
                  {chapter.isCompleted ? (
                    <Icon name="check" size={16} color="#FFF" />
                  ) : chapter.isLocked ? (
                    <Icon name="lock" size={14} color={subjectColor} />
                  ) : (
                    <Text
                      style={[
                        styles.chapterNumberText,
                        {color: chapter.isCurrent ? '#FFF' : subjectColor},
                      ]}>
                      {subjectData.chapters.indexOf(chapter) + 1}
                    </Text>
                  )}
                </View>

                {/* Chapter Info */}
                <View style={styles.chapterInfo}>
                  <View style={styles.chapterTitleRow}>
                    <Text 
                      style={[styles.chapterTitle, {color: text}]} 
                      numberOfLines={2}>
                      {chapter.title}
                    </Text>
                    {chapter.isCurrent && (
                      <Badge label="In Progress" variant="warning" size="sm" />
                    )}
                  </View>
                  <View style={styles.chapterMeta}>
                    <View style={styles.metaItem}>
                      <Icon name="book-open" size={12} color={textMuted} />
                      <Text style={[styles.metaText, {color: textMuted}]}>
                        {chapter.lessons} lessons
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Icon name="clock" size={12} color={textMuted} />
                      <Text style={[styles.metaText, {color: textMuted}]}>
                        {chapter.duration}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Chapter Progress */}
                  {chapter.progress > 0 && !chapter.isCompleted && (
                    <View style={styles.chapterProgress}>
                      <View style={[styles.chapterProgressBg, {backgroundColor: `${subjectColor}20`}]}>
                        <View 
                          style={[
                            styles.chapterProgressFill, 
                            {backgroundColor: subjectColor, width: `${chapter.progress}%`}
                          ]} 
                        />
                      </View>
                      <Text style={[styles.chapterProgressText, {color: textMuted}]}>
                        {chapter.progress}%
                      </Text>
                    </View>
                  )}
                </View>

                {/* Arrow */}
                {!chapter.isLocked && (
                  <Icon name="chevron-right" size={20} color={textMuted} />
                )}
              </TouchableOpacity>
            </Animated.View>
          ))
        )}

        <View style={{height: Spacing['3xl']}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {
    paddingBottom: Spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  headerDecor1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerDecor2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  subjectEmoji: {
    fontSize: 40,
    marginBottom: Spacing.xs,
  },
  subjectTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  subjectMeta: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: Spacing.md,
  },
  progressContainer: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  progressLabel: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  progressValue: {
    fontSize: FontSizes.xs,
    color: '#FFF',
    fontWeight: '700',
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
  progressDetail: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
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
  content: {flex: 1},
  scrollContent: {
    paddingHorizontal: Spacing.md,
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
  chapterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  chapterNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  chapterNumberText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  chapterInfo: {
    flex: 1,
  },
  chapterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  chapterTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    flex: 1,
  },
  chapterMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: FontSizes.xs,
  },
  chapterProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    gap: Spacing.sm,
  },
  chapterProgressBg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  chapterProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  chapterProgressText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
});
