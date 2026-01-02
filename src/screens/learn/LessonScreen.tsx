/**
 * Lesson Screen - Topic Content with Audio Narration
 * API Integrated
 */

import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {useStudent} from '../../context';
import {contentApi, learningApi} from '../../services/api';
import {Icon, Badge, Button} from '../../components/ui';
import {BorderRadius, FontSizes, Spacing, Shadows} from '../../constants/theme';
import type {Topic, ContentBlock} from '../../types/api';

export function LessonScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {subject, chapter, lesson, topicId, subjectColor, isAlreadyCompleted} = route.params;
  const {currentStudent} = useStudent();
  
  const [topic, setTopic] = useState<Topic | null>(null);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(180);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showAnswer, setShowAnswer] = useState<Record<string, boolean>>({});
  const [isCompleted, setIsCompleted] = useState(isAlreadyCompleted || false); // Initialize from route params
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const success = useThemeColor({}, 'success');
  const primary = useThemeColor({}, 'primary');

  // Load topic and content from API
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('[LessonScreen] Loading data, isAlreadyCompleted:', isAlreadyCompleted);
      
      // Get topic details
      const topicRes = await contentApi.topics.getById(topicId);
      if (topicRes.success && topicRes.data) {
        setTopic(topicRes.data);
        setTotalDuration((topicRes.data.estimatedDuration || 15) * 60);
      }
      
      // Get content blocks
      const contentRes = await contentApi.topics.getContent(topicId);
      if (contentRes.success && contentRes.data) {
        setContentBlocks(contentRes.data);
      }
      
      // Start learning session
      if (currentStudent) {
        const sessionRes = await learningApi.startSession(currentStudent.id, topicId);
        if (sessionRes.success && sessionRes.data) {
          setSessionId(sessionRes.data.id);
        }
      }
    } catch (err) {
      console.log('Load lesson error:', err);
    } finally {
      setLoading(false);
    }
  }, [topicId, currentStudent, isAlreadyCompleted]);

  useEffect(() => {
    loadData();
    
    return () => {
      // End session on unmount
      if (sessionId) {
        learningApi.endSession(sessionId, 10).catch(console.log);
      }
    };
  }, [loadData]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Simulate audio playback
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentTime < totalDuration) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return totalDuration;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, currentTime, totalDuration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (forward: boolean) => {
    setCurrentTime(prev => {
      const newTime = forward ? prev + 10 : prev - 10;
      return Math.max(0, Math.min(newTime, totalDuration));
    });
  };

  const toggleSpeed = () => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
  };

  const handleComplete = async () => {
    try {
      console.log('[LessonScreen] Marking lesson as complete');
      console.log('[LessonScreen] sessionId:', sessionId);
      console.log('[LessonScreen] studentId:', currentStudent?.id);
      console.log('[LessonScreen] topicId:', topicId);
      
      // End the learning session
      if (sessionId) {
        console.log('[LessonScreen] Ending session...');
        const endRes = await learningApi.endSession(sessionId, 20);
        console.log('[LessonScreen] End session response:', endRes);
      }
      
      // Update progress to 100%
      if (currentStudent) {
        console.log('[LessonScreen] Updating progress to 100%...');
        const progressRes = await learningApi.updateProgress(currentStudent.id, topicId, 100);
        console.log('[LessonScreen] Update progress response:', progressRes);
      }
      
      setIsCompleted(true);
      console.log('[LessonScreen] Lesson marked as complete, navigating back...');
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error) {
      console.log('[LessonScreen] Error completing lesson:', error);
      // Still mark as completed locally and navigate back
      setIsCompleted(true);
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    }
  };

  const progress = (currentTime / totalDuration) * 100;

  const renderContentBlock = (block: ContentBlock, index: number) => {
    switch (block.blockType) {
      case 'heading':
        return (
          <Text key={index} style={[styles.sectionHeading, {color: text}]}>
            {block.content}
          </Text>
        );
      
      case 'paragraph':
      case 'text':
        return (
          <Text key={index} style={[styles.paragraph, {color: textSecondary}]}>
            {block.content}
          </Text>
        );
      
      case 'highlight':
      case 'important':
        return (
          <View key={index} style={[styles.highlightBox, {backgroundColor: `${subjectColor}15`, borderLeftColor: subjectColor}]}>
            <Text style={[styles.highlightText, {color: text}]}>
              💡 {block.content}
            </Text>
          </View>
        );
      
      case 'list':
        const items = typeof block.content === 'string' 
          ? block.content.split('\n').filter(Boolean)
          : Array.isArray(block.content) ? block.content : [];
        return (
          <View key={index} style={styles.listContainer}>
            {items.map((item: string, i: number) => (
              <View key={i} style={styles.listItem}>
                <View style={[styles.listBullet, {backgroundColor: subjectColor}]} />
                <Text style={[styles.listText, {color: textSecondary}]}>{item}</Text>
              </View>
            ))}
          </View>
        );
      
      case 'example':
        return (
          <View key={index} style={[styles.exampleBox, {backgroundColor: card, borderColor: border}]}>
            <View style={[styles.exampleHeader, {backgroundColor: subjectColor}]}>
              <Icon name="file-text" size={16} color="#FFF" />
              <Text style={styles.exampleTitle}>Example</Text>
            </View>
            <View style={styles.exampleContent}>
              <Text style={[styles.exampleProblem, {color: text}]}>
                {block.content}
              </Text>
            </View>
          </View>
        );
      
      case 'practice':
      case 'question':
        const blockId = block.id || String(index);
        return (
          <View key={index} style={[styles.practiceBox, {backgroundColor: `${success}10`, borderColor: success}]}>
            <Text style={[styles.practiceText, {color: text}]}>
              🎯 {block.content}
            </Text>
            {block.answer && (
              !showAnswer[blockId] ? (
                <TouchableOpacity 
                  style={[styles.showAnswerButton, {backgroundColor: success}]}
                  onPress={() => setShowAnswer(prev => ({...prev, [blockId]: true}))}>
                  <Text style={styles.showAnswerText}>Show Answer 👀</Text>
                </TouchableOpacity>
              ) : (
                <View style={[styles.answerBox, {backgroundColor: '#FFF', borderColor: success}]}>
                  <Text style={[styles.answerText, {color: textSecondary}]}>
                    {block.answer}
                  </Text>
                </View>
              )
            )}
          </View>
        );
      
      case 'keypoints':
      case 'summary':
        const points = typeof block.content === 'string'
          ? block.content.split('\n').filter(Boolean)
          : Array.isArray(block.content) ? block.content : [];
        return (
          <View key={index} style={styles.keypointsContainer}>
            {points.map((point: string, i: number) => (
              <View key={i} style={[styles.keypointItem, {backgroundColor: `${subjectColor}10`}]}>
                <Text style={styles.keypointIcon}>✓</Text>
                <Text style={[styles.keypointText, {color: text}]}>{point}</Text>
              </View>
            ))}
          </View>
        );
      
      default:
        return (
          <Text key={index} style={[styles.paragraph, {color: textSecondary}]}>
            {typeof block.content === 'string' ? block.content : JSON.stringify(block.content)}
          </Text>
        );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: background}]} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={subjectColor || primary} />
          <Text style={[styles.loadingText, {color: textMuted}]}>Loading lesson...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: background}]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, {borderBottomColor: border}]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerChapter, {color: subjectColor}]} numberOfLines={1}>
            {chapter}
          </Text>
          <Text style={[styles.headerLesson, {color: text}]} numberOfLines={1}>
            {topic?.topicTitle || lesson}
          </Text>
        </View>
        <TouchableOpacity style={styles.bookmarkButton}>
          <Icon name="bookmark" size={22} color={textMuted} />
        </TouchableOpacity>
      </View>

      {/* Textbook Content */}
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        
        {/* Lesson Title Card */}
        <Animated.View style={[styles.lessonTitleCard, {backgroundColor: subjectColor, opacity: fadeAnim}]}>
          <View style={styles.lessonTitleDecor1} />
          <View style={styles.lessonTitleDecor2} />
          <Text style={styles.lessonTitleEmoji}>📖</Text>
          <Text style={styles.lessonTitleText}>{topic?.topicTitle || lesson}</Text>
          <Text style={styles.lessonSubtitleText}>{subject}</Text>
          <View style={styles.lessonMeta}>
            <Badge label={`⏱️ ${topic?.estimatedDuration || 15} min`} variant="default" size="sm" />
          </View>
        </Animated.View>

        {/* Content Sections */}
        <View style={styles.contentContainer}>
          {contentBlocks.length > 0 ? (
            contentBlocks.map((block, index) => renderContentBlock(block, index))
          ) : (
            // Default content if no blocks
            <>
              <Text style={[styles.sectionHeading, {color: text}]}>
                📚 {topic?.topicTitle || lesson}
              </Text>
              <Text style={[styles.paragraph, {color: textSecondary}]}>
                {topic?.description || 'Content for this lesson is being prepared. Please check back later or contact your instructor.'}
              </Text>
              <View style={[styles.highlightBox, {backgroundColor: `${subjectColor}15`, borderLeftColor: subjectColor}]}>
                <Text style={[styles.highlightText, {color: text}]}>
                  💡 This lesson is part of {chapter}. Complete all lessons to master this chapter.
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Mark Complete Button */}
        <View style={styles.completeContainer}>
          {!isCompleted ? (
            <Button
              title="Mark as Complete ✅"
              onPress={handleComplete}
              fullWidth
              size="lg"
            />
          ) : (
            <View>
              <View style={[styles.completedBadge, {backgroundColor: success}]}>
                <Icon name="check-circle" size={24} color="#FFF" />
                <Text style={styles.completedText}>Lesson Completed! 🎉</Text>
              </View>
              <TouchableOpacity 
                style={[styles.reviseButton, {backgroundColor: card, borderColor: primary}]}
                onPress={() => navigation.goBack()}>
                <Icon name="refresh-cw" size={16} color={primary} />
                <Text style={[styles.reviseText, {color: primary}]}>Back to Chapter</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Audio Player - Fixed at bottom */}
      <View style={[styles.audioPlayer, {backgroundColor: card, borderTopColor: border}]}>
        {/* Progress Bar */}
        <View style={styles.audioProgressContainer}>
          <View style={[styles.audioProgressBg, {backgroundColor: `${subjectColor}20`}]}>
            <View style={[styles.audioProgressFill, {backgroundColor: subjectColor, width: `${progress}%`}]} />
          </View>
          <View style={styles.audioTimeRow}>
            <Text style={[styles.audioTime, {color: textMuted}]}>{formatTime(currentTime)}</Text>
            <Text style={[styles.audioTime, {color: textMuted}]}>{formatTime(totalDuration)}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.audioControls}>
          {/* Speed */}
          <TouchableOpacity style={[styles.speedButton, {backgroundColor: `${subjectColor}15`}]} onPress={toggleSpeed}>
            <Text style={[styles.speedText, {color: subjectColor}]}>{playbackSpeed}x</Text>
          </TouchableOpacity>

          {/* Rewind */}
          <TouchableOpacity style={styles.seekButton} onPress={() => handleSeek(false)}>
            <Icon name="refresh-cw" size={18} color={textSecondary} style={{transform: [{scaleX: -1}]}} />
            <Text style={[styles.seekText, {color: textMuted}]}>10</Text>
          </TouchableOpacity>

          {/* Play/Pause */}
          <TouchableOpacity 
            style={[styles.playButton, {backgroundColor: subjectColor}, Shadows.md]} 
            onPress={handlePlayPause}>
            <Icon name={isPlaying ? 'pause' : 'play'} size={24} color="#FFF" />
          </TouchableOpacity>

          {/* Forward */}
          <TouchableOpacity style={styles.seekButton} onPress={() => handleSeek(true)}>
            <Icon name="refresh-cw" size={18} color={textSecondary} />
            <Text style={[styles.seekText, {color: textMuted}]}>10</Text>
          </TouchableOpacity>

          {/* Volume */}
          <TouchableOpacity style={[styles.volumeButton, {backgroundColor: `${subjectColor}15`}]}>
            <Icon name="volume-2" size={18} color={subjectColor} />
          </TouchableOpacity>
        </View>

        {/* Now Playing Label */}
        <View style={styles.nowPlaying}>
          <View style={[styles.nowPlayingDot, {backgroundColor: isPlaying ? success : textMuted}]} />
          <Text style={[styles.nowPlayingText, {color: textMuted}]}>
            {isPlaying ? '🔊 Playing...' : '🎧 Tap play to listen'}
          </Text>
        </View>
      </View>
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
  headerChapter: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    marginBottom: 2,
  },
  headerLesson: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  bookmarkButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  lessonTitleCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },
  lessonTitleDecor1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  lessonTitleDecor2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  lessonTitleEmoji: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  lessonTitleText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  lessonSubtitleText: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: Spacing.sm,
  },
  lessonMeta: {},
  contentContainer: {
    marginBottom: Spacing.sm,
  },
  sectionHeading: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  paragraph: {
    fontSize: FontSizes.sm,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  highlightBox: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
    marginBottom: Spacing.md,
  },
  highlightText: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
    fontWeight: '500',
  },
  listContainer: {
    marginBottom: Spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  listBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: Spacing.sm,
  },
  listText: {
    flex: 1,
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
  exampleBox: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  exampleTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: '#FFF',
  },
  exampleContent: {
    padding: Spacing.sm,
  },
  exampleProblem: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
  practiceBox: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginBottom: Spacing.md,
  },
  practiceText: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  showAnswerButton: {
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  showAnswerText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: '#FFF',
  },
  answerBox: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
  answerText: {
    fontSize: FontSizes.xs,
    lineHeight: 18,
  },
  keypointsContainer: {
    marginBottom: Spacing.sm,
  },
  keypointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  keypointIcon: {
    fontSize: 14,
    marginRight: Spacing.sm,
  },
  keypointText: {
    flex: 1,
    fontSize: FontSizes.xs,
    fontWeight: '500',
  },
  completeContainer: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  completedText: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: '#FFF',
  },
  reviseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  reviseText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  audioPlayer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
    borderTopWidth: 1,
  },
  audioProgressContainer: {
    marginBottom: Spacing.xs,
  },
  audioProgressBg: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  audioProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  audioTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  audioTime: {
    fontSize: 10,
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  speedButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  speedText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
  },
  seekButton: {
    alignItems: 'center',
  },
  seekText: {
    fontSize: 9,
    marginTop: 1,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nowPlaying: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Spacing.xs,
    gap: Spacing.xs,
  },
  nowPlayingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  nowPlayingText: {
    fontSize: 10,
  },
});
