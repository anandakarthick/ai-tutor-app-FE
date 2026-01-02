/**
 * Subject Detail Screen
 * Shows chapters list - API Integrated
 */

import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute, useFocusEffect} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {useStudent} from '../../context';
import {contentApi, progressApi} from '../../services/api';
import {Icon, Badge} from '../../components/ui';
import {BorderRadius, FontSizes, Spacing, Shadows} from '../../constants/theme';
import type {Chapter, Book} from '../../types/api';

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: '#F97316',
  Science: '#22C55E',
  English: '#8B5CF6',
  Physics: '#3B82F6',
  Chemistry: '#14B8A6',
  Biology: '#84CC16',
  History: '#D97706',
  Geography: '#06B6D4',
  Hindi: '#EC4899',
  'Social Science': '#8B5CF6',
};

const SUBJECT_EMOJI: Record<string, string> = {
  Mathematics: '📐',
  Science: '🔬',
  English: '📖',
  Hindi: '📚',
  'Social Science': '🌍',
  Physics: '⚛️',
  Chemistry: '🧪',
  Biology: '🧬',
};

export function SubjectDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {subject, subjectId} = route.params || {};
  const {currentStudent} = useStudent();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chapterProgress, setChapterProgress] = useState<Record<string, number>>({});
  const [currentChapterId, setCurrentChapterId] = useState<string | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const success = useThemeColor({}, 'success');
  const primary = useThemeColor({}, 'primary');

  const subjectColor = SUBJECT_COLORS[subject] || '#F97316';
  const subjectEmoji = SUBJECT_EMOJI[subject] || '📘';

  // Load chapters from API with student progress
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('[SubjectDetailScreen] Loading data for subject:', subjectId, 'student:', currentStudent?.id);
      
      // First get books for this subject
      const booksRes = await contentApi.books.getBySubject(subjectId);
      if (booksRes.success && booksRes.data && booksRes.data.length > 0) {
        setBooks(booksRes.data);
        
        // Get chapters for the first book with student progress
        const bookId = booksRes.data[0].id;
        const chaptersRes = await contentApi.chapters.getByBook(bookId, currentStudent?.id);
        console.log('[SubjectDetailScreen] Chapters response:', chaptersRes);
        
        if (chaptersRes.success && chaptersRes.data) {
          setChapters(chaptersRes.data);
          
          // Find current chapter (first incomplete)
          const firstIncomplete = chaptersRes.data.find((c: any) => !c.isCompleted);
          if (firstIncomplete) {
            setCurrentChapterId(firstIncomplete.id);
          } else if (chaptersRes.data.length > 0) {
            // All complete, set first as current
            setCurrentChapterId(null);
          }
        }
      }
    } catch (err) {
      console.log('Load chapters error:', err);
    } finally {
      setLoading(false);
    }
  }, [subjectId, currentStudent?.id]);

  // Refresh data when screen is focused (after returning from chapter)
  useFocusEffect(
    useCallback(() => {
      console.log('[SubjectDetailScreen] Screen focused - refreshing data');
      loadData();
    }, [loadData])
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Filter chapters based on search
  const filteredChapters = chapters.filter((chapter) =>
    chapter.chapterTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChapterPress = (chapter: Chapter) => {
    navigation.navigate('Chapter', {
      subject,
      chapter: chapter.chapterTitle,
      chapterId: chapter.id,
      subjectColor,
    });
  };

  const completedChapters = chapters.filter(c => c.isCompleted).length;
  const totalChapters = chapters.length;
  
  // Calculate overall progress based on chapter progress
  const overallProgress = totalChapters > 0 
    ? Math.round(chapters.reduce((sum, c) => sum + (c.progress || 0), 0) / totalChapters)
    : 0;

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: background}]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={subjectColor} />
          <Text style={[styles.loadingText, {color: textMuted}]}>Loading chapters...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.subjectEmoji}>{subjectEmoji}</Text>
          <Text style={styles.subjectTitle}>{subject}</Text>
          <Text style={styles.subjectMeta}>
            {totalChapters} Chapters • {books[0]?.bookTitle || 'Textbook'}
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
              {completedChapters} of {totalChapters} chapters completed
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
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[subjectColor]} />
        }>
        
        <Text style={[styles.sectionTitle, {color: text}]}>
          Course Content 📚
        </Text>

        {filteredChapters.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={[styles.emptyText, {color: textMuted}]}>
              {searchQuery ? `No chapters found for "${searchQuery}"` : 'No chapters available'}
            </Text>
          </View>
        ) : (
          filteredChapters.map((chapter, index) => {
            const isCompleted = chapter.isCompleted === true;
            const progress = chapter.progress || 0;
            const inProgress = progress > 0 && !isCompleted;
            const completedTopics = chapter.completedTopics || 0;
            const totalTopics = chapter.totalTopics || 0;
            
            console.log(`[SubjectDetailScreen] Chapter ${index + 1}: progress=${progress}, isCompleted=${isCompleted}, inProgress=${inProgress}`);
            
            return (
              <Animated.View
                key={chapter.id}
                style={[{
                  opacity: fadeAnim,
                  transform: [{translateY: slideAnim}],
                }]}>
                <TouchableOpacity
                  style={[
                    styles.chapterCard,
                    {
                      backgroundColor: card,
                      borderColor: isCompleted ? success : (inProgress ? subjectColor : border),
                      borderWidth: isCompleted || inProgress ? 2 : 1,
                    },
                    Shadows.sm,
                  ]}
                  onPress={() => handleChapterPress(chapter)}>
                  
                  {/* Chapter Number */}
                  <View
                    style={[
                      styles.chapterNumber,
                      {
                        backgroundColor: isCompleted
                          ? success
                          : inProgress
                          ? subjectColor
                          : `${subjectColor}20`,
                      },
                    ]}>
                    {isCompleted ? (
                      <Icon name="check" size={16} color="#FFF" />
                    ) : (
                      <Text
                        style={[
                          styles.chapterNumberText,
                          {color: inProgress ? '#FFF' : subjectColor},
                        ]}>
                        {index + 1}
                      </Text>
                    )}
                  </View>

                  {/* Chapter Info */}
                  <View style={styles.chapterInfo}>
                    <Text 
                      style={[styles.chapterTitle, {color: text}]} 
                      numberOfLines={2}>
                      {chapter.chapterTitle}
                    </Text>
                    
                    {/* Status Badge */}
                    <View style={styles.statusRow}>
                      {isCompleted && (
                        <View style={[styles.statusBadge, {backgroundColor: `${success}20`}]}>
                          <Icon name="check-circle" size={12} color={success} />
                          <Text style={[styles.statusText, {color: success}]}>Completed</Text>
                        </View>
                      )}
                      {inProgress && (
                        <View style={[styles.statusBadge, {backgroundColor: `${subjectColor}20`}]}>
                          <Icon name="loader" size={12} color={subjectColor} />
                          <Text style={[styles.statusText, {color: subjectColor}]}>In Progress</Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.chapterMeta}>
                      <View style={styles.metaItem}>
                        <Icon name="book-open" size={12} color={textMuted} />
                        <Text style={[styles.metaText, {color: textMuted}]}>
                          {completedTopics}/{totalTopics} lessons
                        </Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Icon name="clock" size={12} color={textMuted} />
                        <Text style={[styles.metaText, {color: textMuted}]}>
                          {chapter.estimatedDuration || Math.round((chapter.estimatedHours || 0.5) * 60)} min
                        </Text>
                      </View>
                    </View>
                    
                    {/* Chapter Progress Bar */}
                    {progress > 0 && (
                      <View style={styles.chapterProgress}>
                        <View style={[styles.chapterProgressBg, {backgroundColor: `${subjectColor}20`}]}>
                          <View 
                            style={[
                              styles.chapterProgressFill, 
                              {backgroundColor: isCompleted ? success : subjectColor, width: `${progress}%`}
                            ]} 
                          />
                        </View>
                        <Text style={[styles.chapterProgressText, {color: isCompleted ? success : subjectColor}]}>
                          {progress}%
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Arrow */}
                  <Icon name="chevron-right" size={20} color={textMuted} />
                </TouchableOpacity>
              </Animated.View>
            );
          })
        )}

        <View style={{height: Spacing['3xl']}} />
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
  chapterTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
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
