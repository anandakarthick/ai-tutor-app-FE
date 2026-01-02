/**
 * Lesson Screen - AI Teaching with Line-by-Line Animation + Voice
 * Uses Claude API for interactive teaching with optional TTS
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
  Easing,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {useStudent} from '../../context';
import {contentApi, learningApi} from '../../services/api';
import {Icon, Button} from '../../components/ui';
import {BorderRadius, FontSizes, Spacing} from '../../constants/theme';
import type {Topic, ContentBlock} from '../../types/api';

// Try to import TTS, but make it optional
let Tts: any = null;
try {
  Tts = require('react-native-tts').default;
} catch (e) {
  console.log('TTS not available:', e);
}

// Initialize TTS if available
const initTTS = async () => {
  if (!Tts) return false;
  
  try {
    await Tts.setDefaultLanguage('en-IN');
    await Tts.setDefaultRate(0.45);
    await Tts.setDefaultPitch(1.1);
    
    const voices = await Tts.voices();
    const indianVoice = voices?.find((v: any) => 
      v.language?.includes('en-IN') || 
      v.language?.includes('en_IN') ||
      v.name?.toLowerCase().includes('india')
    );
    if (indianVoice) {
      await Tts.setDefaultVoice(indianVoice.id);
    }
    return true;
  } catch (error) {
    console.log('TTS init error:', error);
    return false;
  }
};

// Safe TTS speak function
const safeTtsSpeak = async (text: string) => {
  if (!Tts) return;
  try {
    await Tts.speak(text);
  } catch (e) {
    console.log('TTS speak error:', e);
  }
};

// Safe TTS stop function
const safeTtsStop = () => {
  if (!Tts) return;
  try {
    Tts.stop();
  } catch (e) {
    console.log('TTS stop error:', e);
  }
};

// AI Avatar Component with animation
function AIAvatar({isTyping, isSpeaking, color}: {isTyping: boolean; isSpeaking: boolean; color: string}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isTyping || isSpeaking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 600,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      pulseAnim.setValue(1);
      rotateAnim.setValue(0);
    }
  }, [isTyping, isSpeaking]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.avatarContainer}>
      <Animated.View
        style={[
          styles.avatarOuter,
          {
            backgroundColor: `${color}20`,
            transform: [{scale: pulseAnim}],
          },
        ]}>
        <View style={[styles.avatarInner, {backgroundColor: color}]}>
          <Text style={styles.avatarEmoji}>{isSpeaking ? '🗣️' : '🤖'}</Text>
        </View>
      </Animated.View>
      {(isTyping || isSpeaking) && (
        <Animated.View style={[styles.sparkle, {transform: [{rotate}]}]}>
          <Text style={styles.sparkleEmoji}>✨</Text>
        </Animated.View>
      )}
    </View>
  );
}

// Sound Wave Animation for speaking
function SoundWave({color, isActive}: {color: string; isActive: boolean}) {
  const bar1 = useRef(new Animated.Value(0.3)).current;
  const bar2 = useRef(new Animated.Value(0.5)).current;
  const bar3 = useRef(new Animated.Value(0.7)).current;
  const bar4 = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (isActive) {
      const animateBar = (bar: Animated.Value, duration: number) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(bar, {toValue: 1, duration, useNativeDriver: true}),
            Animated.timing(bar, {toValue: 0.2, duration, useNativeDriver: true}),
          ])
        ).start();
      };
      animateBar(bar1, 300);
      animateBar(bar2, 400);
      animateBar(bar3, 350);
      animateBar(bar4, 450);
    } else {
      bar1.setValue(0.3);
      bar2.setValue(0.5);
      bar3.setValue(0.7);
      bar4.setValue(0.4);
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <View style={styles.soundWaveContainer}>
      {[bar1, bar2, bar3, bar4].map((bar, i) => (
        <Animated.View
          key={i}
          style={[
            styles.soundBar,
            {
              backgroundColor: color,
              transform: [{scaleY: bar}],
            },
          ]}
        />
      ))}
    </View>
  );
}

// Typing Indicator
function TypingIndicator({color}: {color: string}) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {toValue: 1, duration: 300, useNativeDriver: true}),
          Animated.timing(dot, {toValue: 0, duration: 300, useNativeDriver: true}),
        ])
      ).start();
    };
    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, []);

  return (
    <View style={styles.typingContainer}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View
          key={i}
          style={[
            styles.typingDot,
            {
              backgroundColor: color,
              transform: [{translateY: dot.interpolate({inputRange: [0, 1], outputRange: [0, -8]})}],
            },
          ]}
        />
      ))}
    </View>
  );
}

export function LessonScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {subject, chapter, lesson, topicId, subjectColor, isAlreadyCompleted} = route.params;
  const {currentStudent} = useStudent();
  
  const [topic, setTopic] = useState<Topic | null>(null);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(isAlreadyCompleted || false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // AI Teaching states
  const [aiText, setAiText] = useState('');
  const [fullAiText, setFullAiText] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [aiTeachingStarted, setAiTeachingStarted] = useState(false);
  const [aiTeachingComplete, setAiTeachingComplete] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  
  // Voice states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const aiScrollRef = useRef<ScrollView>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const success = useThemeColor({}, 'success');
  const primary = useThemeColor({}, 'primary');

  // Initialize TTS on mount
  useEffect(() => {
    const setupTTS = async () => {
      const available = await initTTS();
      setVoiceAvailable(available);
      
      if (Tts) {
        try {
          Tts.addEventListener('tts-start', () => setIsSpeaking(true));
          Tts.addEventListener('tts-finish', () => setIsSpeaking(false));
          Tts.addEventListener('tts-cancel', () => setIsSpeaking(false));
        } catch (e) {
          console.log('TTS event listener error:', e);
        }
      }
    };
    
    setupTTS();
    
    return () => {
      safeTtsStop();
    };
  }, []);

  // Load topic and content
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      const topicRes = await contentApi.topics.getById(topicId);
      if (topicRes.success && topicRes.data) {
        setTopic(topicRes.data);
      }
      
      const contentRes = await contentApi.topics.getContent(topicId);
      if (contentRes.success && contentRes.data) {
        setContentBlocks(contentRes.data);
      }
      
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
  }, [topicId, currentStudent]);

  useEffect(() => {
    loadData();
    return () => {
      if (sessionId) {
        learningApi.endSession(sessionId, 10).catch(console.log);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      safeTtsStop();
    };
  }, [loadData]);

  useEffect(() => {
    Animated.timing(fadeAnim, {toValue: 1, duration: 500, useNativeDriver: true}).start();
  }, []);

  // Animate text appearing sentence by sentence with optional voice
  const animateTextWithVoice = useCallback((fullText: string) => {
    // Split into sentences
    const sentences = fullText.split(/(?<=[.!?\n])\s+/).filter(s => s.trim().length > 0);
    let currentIndex = 0;
    let displayedText = '';
    
    const showNextSentence = () => {
      if (currentIndex >= sentences.length) {
        setIsAiTyping(false);
        setAiTeachingComplete(true);
        setIsSpeaking(false);
        return;
      }
      
      const sentence = sentences[currentIndex];
      displayedText += (currentIndex > 0 ? ' ' : '') + sentence;
      setAiText(displayedText);
      
      // Scroll to bottom
      setTimeout(() => aiScrollRef.current?.scrollToEnd({animated: true}), 100);
      
      // Speak the sentence if voice is enabled and available
      if (voiceEnabled && voiceAvailable) {
        const cleanSentence = sentence
          .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Remove emojis
          .replace(/\*\*/g, '')
          .replace(/\*/g, '')
          .replace(/#/g, '')
          .trim();
        
        if (cleanSentence.length > 0) {
          safeTtsSpeak(cleanSentence);
        }
      }
      
      currentIndex++;
      
      // Calculate delay based on sentence length (slower for longer sentences)
      const wordCount = sentence.split(/\s+/).length;
      const delay = Math.max(2000, wordCount * 350); // Min 2s, ~350ms per word
      
      typingTimeoutRef.current = setTimeout(showNextSentence, delay);
    };
    
    showNextSentence();
  }, [voiceEnabled, voiceAvailable]);

  // Toggle voice
  const toggleVoice = () => {
    if (isSpeaking) {
      safeTtsStop();
      setIsSpeaking(false);
    }
    setVoiceEnabled(!voiceEnabled);
  };

  // Pause/Resume
  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      // Continue from where we left off
      if (!aiTeachingComplete) {
        const remainingSentences = fullAiText.substring(aiText.length).trim();
        if (remainingSentences) {
          setIsAiTyping(true);
          animateTextWithVoice(remainingSentences);
        }
      }
    } else {
      setIsPaused(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      safeTtsStop();
      setIsSpeaking(false);
      setIsAiTyping(false);
    }
  };

  // Start AI Teaching
  const startAITeaching = async () => {
    if (!topic || !currentStudent) return;
    
    setAiTeachingStarted(true);
    setIsLoadingAi(true);
    setAiText('');
    
    try {
      const contentSummary = contentBlocks
        .map(block => typeof block.content === 'string' ? block.content : 
          Array.isArray(block.content) ? block.content.join('\n') : '')
        .filter(Boolean)
        .join('\n\n');

      if (sessionId) {
        console.log('[LessonScreen] Using session for AI teaching:', sessionId);
        const response = await learningApi.sendMessage(
          sessionId,
          `Please teach me about "${topic.topicTitle}" in ${subject}. Here's the content:\n\n${contentSummary || topic.description || 'Basic concepts'}`
        );

        setIsLoadingAi(false);
        
        if (response.success && response.data?.aiMessage?.content) {
          const aiResponse = response.data.aiMessage.content;
          setFullAiText(aiResponse);
          setIsAiTyping(true);
          animateTextWithVoice(aiResponse);
          return;
        }
      }
      
      console.log('[LessonScreen] Using fallback teaching content');
      setIsLoadingAi(false);
      const fallbackText = generateFallbackTeaching(topic.topicTitle, subject, contentSummary);
      setFullAiText(fallbackText);
      setIsAiTyping(true);
      animateTextWithVoice(fallbackText);
      
    } catch (error) {
      console.error('AI Teaching error:', error);
      setIsLoadingAi(false);
      
      const fallbackText = generateFallbackTeaching(
        topic?.topicTitle || lesson, 
        subject, 
        topic?.description || ''
      );
      setFullAiText(fallbackText);
      setIsAiTyping(true);
      animateTextWithVoice(fallbackText);
    }
  };

  // Generate fallback teaching content
  const generateFallbackTeaching = (topicTitle: string, subj: string, content: string) => {
    const studentName = currentStudent?.studentName || 'there';
    const greetings = ['Hey', 'Hi', 'Hello', 'Namaste'];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    const contentLines = content.split('\n').filter(line => line.trim().length > 10);
    const keyPoints = contentLines.slice(0, 4).map(line => {
      const trimmed = line.trim();
      return trimmed.length > 80 ? trimmed.substring(0, 80) + '...' : trimmed;
    });

    return `${greeting} ${studentName}! I'm Buddy, your AI learning companion.

Today we are learning about ${topicTitle}.

Let me explain this to you step by step.

${keyPoints.length > 0 ? `Here are the key concepts you need to understand.\n\n${keyPoints.map((p, i) => `Point ${i + 1}. ${p}`).join('\n\n')}\n\n` : ''}This is an important topic in ${subj}.

Understanding ${topicTitle} will help you build a strong foundation.

Here is a memory trick for you.

Try to relate ${topicTitle} to something you see in everyday life.

The best way to remember is to find real examples around you.

Now here is a quick challenge.

Can you think of one real world example where ${topicTitle.toLowerCase()} applies?

Take a moment to think about it.

You are doing amazing ${studentName}!

Keep asking questions and stay curious.

That is the secret to becoming a great learner.

You can now mark this lesson as complete!`;  
  };

  const handleComplete = async () => {
    try {
      safeTtsStop();
      if (sessionId) {
        await learningApi.endSession(sessionId, 20);
      }
      if (currentStudent) {
        await learningApi.updateProgress(currentStudent.id, topicId, 100);
      }
      setIsCompleted(true);
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error) {
      console.log('Error completing lesson:', error);
      setIsCompleted(true);
      setTimeout(() => navigation.goBack(), 1500);
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
        <TouchableOpacity style={styles.backButton} onPress={() => { safeTtsStop(); navigation.goBack(); }}>
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
        {/* Voice Toggle - only show if TTS is available */}
        {voiceAvailable && (
          <TouchableOpacity 
            style={[styles.voiceButton, {backgroundColor: voiceEnabled ? `${subjectColor}20` : `${textMuted}20`}]}
            onPress={toggleVoice}>
            <Icon name={voiceEnabled ? "volume-2" : "volume-x"} size={20} color={voiceEnabled ? subjectColor : textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* AI Teaching Section - Top Half */}
      <View style={[styles.aiSection, {backgroundColor: `${subjectColor}08`, borderBottomColor: border}]}>
        <View style={styles.aiHeader}>
          <AIAvatar isTyping={isAiTyping} isSpeaking={isSpeaking} color={subjectColor} />
          <View style={styles.aiHeaderText}>
            <Text style={[styles.aiName, {color: text}]}>🎓 Buddy AI Tutor</Text>
            <View style={styles.aiStatusRow}>
              <Text style={[styles.aiStatus, {color: isSpeaking || isAiTyping ? subjectColor : textMuted}]}>
                {isLoadingAi ? '🧠 Thinking...' : isSpeaking ? '🔊 Speaking...' : isAiTyping ? '✍️ Teaching...' : aiTeachingComplete ? '✅ Done!' : '👋 Ready'}
              </Text>
              {voiceAvailable && <SoundWave color={subjectColor} isActive={isSpeaking} />}
            </View>
          </View>
          
          {/* Controls */}
          {!aiTeachingStarted ? (
            <TouchableOpacity
              style={[styles.startTeachingBtn, {backgroundColor: subjectColor}]}
              onPress={startAITeaching}>
              <Icon name="play" size={16} color="#FFF" />
              <Text style={styles.startTeachingText}>Start Lesson</Text>
            </TouchableOpacity>
          ) : aiTeachingStarted && !aiTeachingComplete && (
            <TouchableOpacity
              style={[styles.pauseBtn, {backgroundColor: isPaused ? success : `${subjectColor}20`}]}
              onPress={togglePause}>
              <Icon name={isPaused ? "play" : "pause"} size={16} color={isPaused ? "#FFF" : subjectColor} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          ref={aiScrollRef}
          style={styles.aiContent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.aiContentInner}>
          {!aiTeachingStarted ? (
            <View style={styles.aiPlaceholder}>
              <Text style={styles.aiPlaceholderEmoji}>🎓</Text>
              <Text style={[styles.aiPlaceholderText, {color: textSecondary}]}>
                Tap "Start Lesson" to begin!
              </Text>
              <Text style={[styles.aiPlaceholderSubtext, {color: textMuted}]}>
                {voiceAvailable ? `🔊 Voice is ${voiceEnabled ? 'ON' : 'OFF'}` : '📖 Reading mode'}
              </Text>
            </View>
          ) : isLoadingAi ? (
            <View style={styles.aiPlaceholder}>
              <ActivityIndicator size="large" color={subjectColor} />
              <Text style={[styles.aiPlaceholderText, {color: textSecondary, marginTop: 16}]}>
                Preparing your lesson...
              </Text>
            </View>
          ) : (
            <View style={styles.aiTextContainer}>
              <Text style={[styles.aiText, {color: text}]}>{aiText}</Text>
              {isAiTyping && !isPaused && <TypingIndicator color={subjectColor} />}
              {isPaused && (
                <View style={[styles.pausedBadge, {backgroundColor: `${textMuted}20`}]}>
                  <Icon name="pause" size={14} color={textMuted} />
                  <Text style={[styles.pausedText, {color: textMuted}]}>Paused - Tap play to continue</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>

      {/* Content Section - Bottom Half */}
      <ScrollView
        style={styles.contentSection}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentInner}>
        
        {/* Quick Summary Card */}
        <View style={[styles.summaryCard, {backgroundColor: card, borderColor: border}]}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryEmoji}>📚</Text>
            <Text style={[styles.summaryTitle, {color: text}]}>Lesson Content</Text>
          </View>
          
          {contentBlocks.length > 0 ? (
            contentBlocks.slice(0, 3).map((block, index) => (
              <View key={index} style={styles.summaryItem}>
                <View style={[styles.summaryBullet, {backgroundColor: subjectColor}]} />
                <Text style={[styles.summaryText, {color: textSecondary}]} numberOfLines={2}>
                  {typeof block.content === 'string' ? block.content : 'Content block'}
                </Text>
              </View>
            ))
          ) : (
            <Text style={[styles.summaryText, {color: textSecondary}]}>
              {topic?.description || 'Lesson content will be displayed here.'}
            </Text>
          )}
          
          {contentBlocks.length > 3 && (
            <Text style={[styles.moreContent, {color: subjectColor}]}>
              +{contentBlocks.length - 3} more sections
            </Text>
          )}
        </View>

        {/* Learning Goals */}
        <View style={[styles.keyPointsCard, {backgroundColor: `${success}10`, borderColor: success}]}>
          <Text style={[styles.keyPointsTitle, {color: success}]}>🎯 Learning Goals</Text>
          <Text style={[styles.keyPointsText, {color: textSecondary}]}>
            {aiTeachingComplete 
              ? '✅ Lesson completed! You can now mark this as done.'
              : 'Complete the AI lesson above to finish this topic!'}
          </Text>
        </View>

        {/* Complete Button */}
        <View style={styles.completeContainer}>
          {!isCompleted ? (
            <Button
              title={aiTeachingComplete ? "Mark as Complete ✅" : "Complete Lesson First"}
              onPress={handleComplete}
              fullWidth
              size="lg"
              disabled={!aiTeachingComplete}
            />
          ) : (
            <View style={[styles.completedBadge, {backgroundColor: success}]}>
              <Icon name="check-circle" size={24} color="#FFF" />
              <Text style={styles.completedText}>Lesson Completed! 🎉</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  loadingText: {marginTop: Spacing.md, fontSize: FontSizes.sm},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  backButton: {width: 36, height: 36, alignItems: 'center', justifyContent: 'center'},
  headerContent: {flex: 1, marginHorizontal: Spacing.sm},
  headerChapter: {fontSize: FontSizes.xs, fontWeight: '600', marginBottom: 2},
  headerLesson: {fontSize: FontSizes.sm, fontWeight: '700'},
  voiceButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // AI Section
  aiSection: {height: '48%', borderBottomWidth: 1},
  aiHeader: {flexDirection: 'row', alignItems: 'center', padding: Spacing.sm, gap: Spacing.sm},
  avatarContainer: {position: 'relative'},
  avatarOuter: {width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center'},
  avatarInner: {width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center'},
  avatarEmoji: {fontSize: 24},
  sparkle: {position: 'absolute', top: -5, right: -5},
  sparkleEmoji: {fontSize: 16},
  aiHeaderText: {flex: 1},
  aiName: {fontSize: FontSizes.sm, fontWeight: '700'},
  aiStatusRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  aiStatus: {fontSize: FontSizes.xs, fontWeight: '500'},
  soundWaveContainer: {flexDirection: 'row', alignItems: 'center', gap: 2, height: 16},
  soundBar: {width: 3, height: 16, borderRadius: 2},
  startTeachingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: 6,
  },
  startTeachingText: {color: '#FFF', fontSize: FontSizes.sm, fontWeight: '700'},
  pauseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiContent: {flex: 1, paddingHorizontal: Spacing.md},
  aiContentInner: {paddingBottom: Spacing.md},
  aiPlaceholder: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xl},
  aiPlaceholderEmoji: {fontSize: 48, marginBottom: Spacing.md},
  aiPlaceholderText: {fontSize: FontSizes.sm, fontWeight: '600', textAlign: 'center', marginBottom: 4},
  aiPlaceholderSubtext: {fontSize: FontSizes.xs, textAlign: 'center', marginTop: 8},
  aiTextContainer: {paddingTop: Spacing.xs},
  aiText: {fontSize: FontSizes.sm, lineHeight: 26},
  typingContainer: {flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.sm, paddingLeft: 4},
  typingDot: {width: 8, height: 8, borderRadius: 4},
  pausedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginTop: Spacing.md,
    alignSelf: 'flex-start',
  },
  pausedText: {fontSize: FontSizes.xs, fontWeight: '600'},

  // Content Section
  contentSection: {flex: 1},
  contentInner: {padding: Spacing.md, paddingBottom: Spacing.xl},
  summaryCard: {borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.md},
  summaryHeader: {flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm},
  summaryEmoji: {fontSize: 20},
  summaryTitle: {fontSize: FontSizes.sm, fontWeight: '700'},
  summaryItem: {flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.xs},
  summaryBullet: {width: 6, height: 6, borderRadius: 3, marginTop: 6, marginRight: Spacing.sm},
  summaryText: {flex: 1, fontSize: FontSizes.xs, lineHeight: 18},
  moreContent: {fontSize: FontSizes.xs, fontWeight: '600', marginTop: Spacing.xs},
  keyPointsCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  keyPointsTitle: {fontSize: FontSizes.sm, fontWeight: '700', marginBottom: Spacing.xs},
  keyPointsText: {fontSize: FontSizes.xs, lineHeight: 18},
  completeContainer: {marginTop: Spacing.sm},
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  completedText: {fontSize: FontSizes.base, fontWeight: '700', color: '#FFF'},
});
