/**
 * Chapter Screen
 * Shows lessons/topics list for a chapter - API Integrated
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
import {contentApi} from '../../services/api';
import {Icon, Badge} from '../../components/ui';
import {BorderRadius, FontSizes, Spacing, Shadows} from '../../constants/theme';
import type {Topic} from '../../types/api';

export function ChapterScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {subject, chapter, chapterId, subjectColor} = route.params;
  const {currentStudent} = useStudent();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTopicId, setCurrentTopicId] = useState<string | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const success = useThemeColor({}, 'success');

  // Load topics from API with student progress
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('[ChapterScreen] Loading topics for chapter:', chapterId, 'student:', currentStudent?.id);
      const response = await contentApi.topics.getByChapter(chapterId, currentStudent?.id);
      console.log('[ChapterScreen] Topics response:', response);
      if (response.success && response.data) {
        setTopics(response.data);
        
        // Find first incomplete topic
        const firstIncomplete = response.data.find((t: Topic) => !t.isCompleted);
        if (firstIncomplete) {
          setCurrentTopicId(firstIncomplete.id);
        }
      }
    } catch (err) {
      console.log('Load topics error:', err);
    } finally {
      setLoading(false);
    }
  }, [chapterId, currentStudent?.id]);

  // Refresh data when screen is focused (after returning from lesson)
  useFocusEffect(
    useCallback(() => {
      console.log('[ChapterScreen] Screen focused - refreshing data');
      loadData();
    }, [loadData])
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Filter topics based on search
  const filteredTopics = topics.filter((topic) =>
    topic.topicTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completedTopics = topics.filter(t => t.isCompleted).length;
  const progress = topics.length > 0 
    ? Math.round((completedTopics / topics.length) * 100) 
    : 0;

  const handleTopicPress = (topic: Topic) => {
    navigation.navigate('Lesson', {
      subject,
      chapter,
      lesson: topic.topicTitle,
      lessonId: topic.id,
      topicId: topic.id,
      subjectColor,
      lessonType: topic.contentType || 'lesson',
      isAlreadyCompleted: topic.isCompleted || false, // Pass completion status
    });
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'video': return 'play';
      case 'quiz': return 'file-text';
      case 'notes': return 'book';
      default: return 'play';
    }
  };

  const getTypeLabel = (type?: string) => {
    switch (type) {
      case 'video': return 'Lesson';
      case 'quiz': return 'Quiz';
      case 'notes': return 'Notes';
      default: return 'Lesson';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: background}]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={subjectColor || '#F97316'} />
          <Text style={[styles.loadingText, {color: textMuted}]}>Loading lessons...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[subjectColor]} />
        }>
        
        {/* Progress Card */}
        <Animated.View style={[styles.progressCard, {backgroundColor: subjectColor, opacity: fadeAnim}]}>
          <View style={styles.progressDecor1} />
          <View style={styles.progressDecor2} />
          
          <View style={styles.progressContent}>
            <View style={styles.progressLeft}>
              <Text style={styles.progressTitle}>Chapter Progress</Text>
              <Text style={styles.progressSubtitle}>
                {completedTopics} of {topics.length} lessons completed
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
          {currentTopicId && (
            <TouchableOpacity 
              style={styles.continueButton}
              onPress={() => {
                const currentTopic = topics.find(t => t.id === currentTopicId);
                if (currentTopic) handleTopicPress(currentTopic);
              }}>
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
              {filteredTopics.length} lesson{filteredTopics.length !== 1 ? 's' : ''} found
            </Text>
          )}
        </View>

        {/* Topics List */}
        <Text style={[styles.sectionTitle, {color: text}]}>
          Lessons 📖
        </Text>

        {filteredTopics.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={[styles.emptyText, {color: textMuted}]}>
              {searchQuery ? `No lessons found for "${searchQuery}"` : 'No lessons available'}
            </Text>
          </View>
        ) : (
          filteredTopics.map((topic, index) => {
            const isCompleted = topic.isCompleted;
            const isCurrent = topic.id === currentTopicId;
            
            return (
              <Animated.View key={topic.id} style={{opacity: fadeAnim}}>
                <TouchableOpacity
                  style={[
                    styles.lessonCard,
                    {
                      backgroundColor: card,
                      borderColor: isCurrent ? subjectColor : border,
                      borderWidth: isCurrent ? 2 : 1,
                    },
                    Shadows.sm,
                  ]}
                  onPress={() => handleTopicPress(topic)}>
                  
                  {/* Lesson Number/Icon */}
                  <View
                    style={[
                      styles.lessonIcon,
                      {
                        backgroundColor: isCompleted
                          ? success
                          : isCurrent
                          ? subjectColor
                          : `${subjectColor}15`,
                      },
                    ]}>
                    {isCompleted ? (
                      <Icon name="check" size={14} color="#FFF" />
                    ) : (
                      <Icon
                        name={getTypeIcon(topic.contentType)}
                        size={14}
                        color={isCurrent ? '#FFF' : subjectColor}
                      />
                    )}
                  </View>

                  {/* Lesson Info */}
                  <View style={styles.lessonInfo}>
                    <View style={styles.lessonTitleRow}>
                      <Text style={[styles.lessonTitle, {color: text}]} numberOfLines={2}>
                        {topic.topicTitle}
                      </Text>
                    </View>
                    <View style={styles.lessonMeta}>
                      <Badge 
                        label={getTypeLabel(topic.contentType)} 
                        variant={topic.contentType === 'quiz' ? 'info' : topic.contentType === 'notes' ? 'success' : 'primary'} 
                        size="sm" 
                      />
                      <View style={styles.durationBadge}>
                        <Icon name="clock" size={10} color={textMuted} />
                        <Text style={[styles.durationText, {color: textMuted}]}>
                          {topic.estimatedDuration || 15} min
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Play/Status Icon */}
                  <View style={[styles.playButton, {backgroundColor: `${subjectColor}15`}]}>
                    <Icon 
                      name={isCompleted ? 'refresh-cw' : 'play'} 
                      size={14} 
                      color={subjectColor} 
                    />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })
        )}

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
