/**
 * Lesson Screen - Textbook Content with Audio Narration
 * Like Udemy learning experience
 */

import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {Icon, Badge, Button} from '../../components/ui';
import {BorderRadius, FontSizes, Spacing, Shadows} from '../../constants/theme';

const {width} = Dimensions.get('window');

// Mock textbook content
const LESSON_CONTENT: Record<string, any> = {
  'Elimination Method': {
    title: 'Elimination Method',
    subtitle: 'Solving Pair of Linear Equations',
    duration: '18 min',
    sections: [
      {
        type: 'heading',
        content: '📚 What is Elimination Method?',
      },
      {
        type: 'paragraph',
        content: 'The elimination method is an algebraic technique used to solve a system of linear equations. In this method, we eliminate one variable by adding or subtracting the equations, making it easier to find the value of the remaining variable.',
      },
      {
        type: 'highlight',
        content: '💡 Key Idea: We multiply one or both equations by suitable numbers so that the coefficients of one variable become equal (or negative of each other), then add or subtract to eliminate that variable.',
      },
      {
        type: 'heading',
        content: '📝 Steps to Solve',
      },
      {
        type: 'list',
        items: [
          'Step 1: Write both equations in standard form (ax + by = c)',
          'Step 2: Multiply equations to make coefficients of one variable equal',
          'Step 3: Add or subtract equations to eliminate one variable',
          'Step 4: Solve for the remaining variable',
          'Step 5: Substitute back to find the other variable',
          'Step 6: Verify your solution in both original equations',
        ],
      },
      {
        type: 'heading',
        content: '✏️ Solved Example',
      },
      {
        type: 'example',
        title: 'Example 1',
        problem: 'Solve the following system of equations:\n2x + 3y = 8  ... (1)\n4x + y = 14  ... (2)',
        solution: [
          'Multiply equation (2) by 3:\n12x + 3y = 42  ... (3)',
          'Subtract equation (1) from (3):\n12x + 3y - 2x - 3y = 42 - 8\n10x = 34\nx = 3.4',
          'Substitute x = 3.4 in equation (1):\n2(3.4) + 3y = 8\n6.8 + 3y = 8\n3y = 1.2\ny = 0.4',
          'Solution: x = 3.4, y = 0.4',
        ],
      },
      {
        type: 'heading',
        content: '🎯 Practice Problem',
      },
      {
        type: 'practice',
        content: 'Try solving this yourself:\n\n3x + 2y = 12\nx + y = 5\n\nTap "Show Answer" when you\'re ready!',
        answer: 'Solution: x = 2, y = 3\n\nMultiply eq(2) by 2: 2x + 2y = 10\nSubtract from eq(1): x = 2\nSubstitute: y = 3',
      },
      {
        type: 'heading',
        content: '📌 Key Points to Remember',
      },
      {
        type: 'keypoints',
        points: [
          'Always check your solution in both equations',
          'Choose which variable to eliminate based on easier calculations',
          'If coefficients are already equal, directly add or subtract',
          'Watch out for sign errors when subtracting equations',
        ],
      },
    ],
  },
  'default': {
    title: 'Lesson Content',
    subtitle: 'Study Material',
    duration: '15 min',
    sections: [
      {
        type: 'heading',
        content: '📚 Introduction',
      },
      {
        type: 'paragraph',
        content: 'This lesson covers important concepts that will help you understand the topic better. Pay attention to the key points and examples provided.',
      },
      {
        type: 'highlight',
        content: '💡 Remember: Understanding the basics is crucial before moving to advanced topics.',
      },
      {
        type: 'heading',
        content: '📝 Main Content',
      },
      {
        type: 'paragraph',
        content: 'The main concepts of this lesson include various aspects that are essential for your understanding. Each concept builds upon the previous one, so make sure to follow along carefully.',
      },
      {
        type: 'list',
        items: [
          'Concept 1: Foundation principles',
          'Concept 2: Application methods',
          'Concept 3: Problem-solving techniques',
          'Concept 4: Real-world examples',
        ],
      },
      {
        type: 'heading',
        content: '📌 Summary',
      },
      {
        type: 'keypoints',
        points: [
          'Review the key concepts regularly',
          'Practice with examples',
          'Ask doubts if anything is unclear',
          'Test your understanding with quizzes',
        ],
      },
    ],
  },
};

export function LessonScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {subject, chapter, lesson, lessonId, subjectColor} = route.params;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(180); // 3 minutes demo
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const success = useThemeColor({}, 'success');

  const lessonData = LESSON_CONTENT[lesson] || LESSON_CONTENT['default'];

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

  const handleComplete = () => {
    setIsCompleted(true);
    setTimeout(() => {
      navigation.goBack();
    }, 1500);
  };

  const progress = (currentTime / totalDuration) * 100;

  const renderSection = (section: any, index: number) => {
    switch (section.type) {
      case 'heading':
        return (
          <Text key={index} style={[styles.sectionHeading, {color: text}]}>
            {section.content}
          </Text>
        );
      
      case 'paragraph':
        return (
          <Text key={index} style={[styles.paragraph, {color: textSecondary}]}>
            {section.content}
          </Text>
        );
      
      case 'highlight':
        return (
          <View key={index} style={[styles.highlightBox, {backgroundColor: `${subjectColor}15`, borderLeftColor: subjectColor}]}>
            <Text style={[styles.highlightText, {color: text}]}>
              {section.content}
            </Text>
          </View>
        );
      
      case 'list':
        return (
          <View key={index} style={styles.listContainer}>
            {section.items.map((item: string, i: number) => (
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
              <Text style={styles.exampleTitle}>{section.title}</Text>
            </View>
            <View style={styles.exampleContent}>
              <Text style={[styles.exampleProblem, {color: text}]}>
                {section.problem}
              </Text>
              <View style={[styles.solutionDivider, {backgroundColor: border}]} />
              <Text style={[styles.solutionLabel, {color: subjectColor}]}>Solution:</Text>
              {section.solution.map((step: string, i: number) => (
                <Text key={i} style={[styles.solutionStep, {color: textSecondary}]}>
                  {step}
                </Text>
              ))}
            </View>
          </View>
        );
      
      case 'practice':
        return (
          <View key={index} style={[styles.practiceBox, {backgroundColor: `${success}10`, borderColor: success}]}>
            <Text style={[styles.practiceText, {color: text}]}>
              {section.content}
            </Text>
            {!showAnswer ? (
              <TouchableOpacity 
                style={[styles.showAnswerButton, {backgroundColor: success}]}
                onPress={() => setShowAnswer(true)}>
                <Text style={styles.showAnswerText}>Show Answer 👀</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.answerBox, {backgroundColor: '#FFF', borderColor: success}]}>
                <Text style={[styles.answerText, {color: textSecondary}]}>
                  {section.answer}
                </Text>
              </View>
            )}
          </View>
        );
      
      case 'keypoints':
        return (
          <View key={index} style={styles.keypointsContainer}>
            {section.points.map((point: string, i: number) => (
              <View key={i} style={[styles.keypointItem, {backgroundColor: `${subjectColor}10`}]}>
                <Text style={styles.keypointIcon}>✓</Text>
                <Text style={[styles.keypointText, {color: text}]}>{point}</Text>
              </View>
            ))}
          </View>
        );
      
      default:
        return null;
    }
  };

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
            {lessonData.title}
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
          <Text style={styles.lessonTitleText}>{lessonData.title}</Text>
          <Text style={styles.lessonSubtitleText}>{lessonData.subtitle}</Text>
          <View style={styles.lessonMeta}>
            <Badge label={`⏱️ ${lessonData.duration}`} variant="default" size="sm" />
          </View>
        </Animated.View>

        {/* Content Sections */}
        <View style={styles.contentContainer}>
          {lessonData.sections.map((section: any, index: number) => 
            renderSection(section, index)
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
            <View style={[styles.completedBadge, {backgroundColor: success}]}>
              <Icon name="check-circle" size={24} color="#FFF" />
              <Text style={styles.completedText}>Lesson Completed! 🎉</Text>
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
    fontFamily: 'monospace',
    marginBottom: Spacing.sm,
  },
  solutionDivider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  solutionLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  solutionStep: {
    fontSize: FontSizes.xs,
    lineHeight: 18,
    marginBottom: Spacing.xs,
    fontFamily: 'monospace',
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
    fontFamily: 'monospace',
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
  // Audio Player - Compact
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
