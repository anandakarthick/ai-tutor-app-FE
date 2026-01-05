/**
 * Lesson Screen - AI Teaching + Doubt Chat
 * Top: AI Teaching with text animation
 * Bottom: Chat with text input (voice via native keyboard)
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
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {useStudent} from '../../context';
import {contentApi, learningApi} from '../../services/api';
import {Icon, Button} from '../../components/ui';
import {BorderRadius, FontSizes, Spacing} from '../../constants/theme';
import type {Topic, ContentBlock} from '../../types/api';

// Chat Message Type
interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

// AI Avatar Component
function AIAvatar({isActive, isSpeaking, color}: {isActive: boolean; isSpeaking: boolean; color: string}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive || isSpeaking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {toValue: 1.15, duration: 600, easing: Easing.ease, useNativeDriver: true}),
          Animated.timing(pulseAnim, {toValue: 1, duration: 600, easing: Easing.ease, useNativeDriver: true}),
        ])
      ).start();
      Animated.loop(
        Animated.timing(rotateAnim, {toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: true})
      ).start();
    } else {
      pulseAnim.setValue(1);
      rotateAnim.setValue(0);
    }
  }, [isActive, isSpeaking]);

  const rotate = rotateAnim.interpolate({inputRange: [0, 1], outputRange: ['0deg', '360deg']});

  return (
    <View style={styles.avatarContainer}>
      <Animated.View style={[styles.avatarOuter, {backgroundColor: `${color}20`, transform: [{scale: pulseAnim}]}]}>
        <View style={[styles.avatarInner, {backgroundColor: color}]}>
          <Text style={styles.avatarEmoji}>{isSpeaking ? '🗣️' : '🤖'}</Text>
        </View>
      </Animated.View>
      {(isActive || isSpeaking) && (
        <Animated.View style={[styles.sparkle, {transform: [{rotate}]}]}>
          <Text style={styles.sparkleEmoji}>✨</Text>
        </Animated.View>
      )}
    </View>
  );
}

// Sound Wave Animation
function SoundWave({color, isActive}: {color: string; isActive: boolean}) {
  const bars = [
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.5)).current,
    useRef(new Animated.Value(0.7)).current,
    useRef(new Animated.Value(0.4)).current,
  ];

  useEffect(() => {
    if (isActive) {
      bars.forEach((bar, i) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(bar, {toValue: 1, duration: 300 + i * 50, useNativeDriver: true}),
            Animated.timing(bar, {toValue: 0.2, duration: 300 + i * 50, useNativeDriver: true}),
          ])
        ).start();
      });
    } else {
      bars.forEach((bar, i) => bar.setValue(0.3 + i * 0.1));
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <View style={styles.soundWaveContainer}>
      {bars.map((bar, i) => (
        <Animated.View
          key={i}
          style={[styles.soundBar, {backgroundColor: color, transform: [{scaleY: bar}]}]}
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
          style={[styles.typingDot, {backgroundColor: color, transform: [{translateY: dot.interpolate({inputRange: [0, 1], outputRange: [0, -6]})}]}]}
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
  const [isPaused, setIsPaused] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Chat states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAiReplying, setIsAiReplying] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const aiScrollRef = useRef<ScrollView>(null);
  const chatScrollRef = useRef<ScrollView>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<TextInput>(null);

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const success = useThemeColor({}, 'success');
  const primary = useThemeColor({}, 'primary');

  // Handle keyboard
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setTimeout(() => chatScrollRef.current?.scrollToEnd({animated: true}), 100);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
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
    };
  }, [loadData]);

  useEffect(() => {
    Animated.timing(fadeAnim, {toValue: 1, duration: 500, useNativeDriver: true}).start();
  }, []);

  // Animate text sentence by sentence
  const animateText = useCallback((fullText: string) => {
    const sentences = fullText.split(/(?<=[.!?\n])\s+/).filter(s => s.trim().length > 0);
    let currentIndex = 0;
    let displayedText = '';

    const showNextSentence = () => {
      if (currentIndex >= sentences.length) {
        setIsAiTyping(false);
        setIsSpeaking(false);
        setAiTeachingComplete(true);
        return;
      }

      const sentence = sentences[currentIndex];
      displayedText += (currentIndex > 0 ? ' ' : '') + sentence;
      setAiText(displayedText);
      setIsSpeaking(true);
      
      setTimeout(() => aiScrollRef.current?.scrollToEnd({animated: true}), 100);

      currentIndex++;
      
      // Calculate delay based on sentence length
      const wordCount = sentence.split(/\s+/).length;
      const delay = Math.max(2000, wordCount * 350);
      
      typingTimeoutRef.current = setTimeout(showNextSentence, delay);
    };

    showNextSentence();
  }, []);

  // Pause/Resume teaching
  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      if (!aiTeachingComplete) {
        const remaining = fullAiText.substring(aiText.length).trim();
        if (remaining) {
          setIsAiTyping(true);
          animateText(remaining);
        }
      }
    } else {
      setIsPaused(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      setIsAiTyping(false);
      setIsSpeaking(false);
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
        .map(block => (typeof block.content === 'string' ? block.content : Array.isArray(block.content) ? block.content.join('\n') : ''))
        .filter(Boolean)
        .join('\n\n');

      if (sessionId) {
        const response = await learningApi.sendMessage(
          sessionId,
          `Please teach me about "${topic.topicTitle}" in ${subject}. Content:\n\n${contentSummary || topic.description || 'Basic concepts'}`
        );
        setIsLoadingAi(false);
        if (response.success && response.data?.aiMessage?.content) {
          const aiResponse = response.data.aiMessage.content;
          setFullAiText(aiResponse);
          setIsAiTyping(true);
          animateText(aiResponse);
          return;
        }
      }

      setIsLoadingAi(false);
      const fallbackText = generateFallbackTeaching(topic.topicTitle, subject, contentSummary);
      setFullAiText(fallbackText);
      setIsAiTyping(true);
      animateText(fallbackText);
    } catch (error) {
      console.error('AI Teaching error:', error);
      setIsLoadingAi(false);
      const fallbackText = generateFallbackTeaching(topic?.topicTitle || lesson, subject, topic?.description || '');
      setFullAiText(fallbackText);
      setIsAiTyping(true);
      animateText(fallbackText);
    }
  };

  // Generate fallback teaching
  const generateFallbackTeaching = (topicTitle: string, subj: string, content: string) => {
    const studentName = currentStudent?.studentName || 'there';
    const greetings = ['Hey', 'Hi', 'Hello'];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    const contentLines = content.split('\n').filter(line => line.trim().length > 10);
    const keyPoints = contentLines.slice(0, 3).map(line => line.trim().substring(0, 80));

    return `${greeting} ${studentName}! I'm Buddy, your AI tutor.

Today we're learning about ${topicTitle}.

${keyPoints.length > 0 ? `Here are the key points. ${keyPoints.join('. ')}. ` : ''}This topic is important in ${subj}.

Try to think of real-world examples as you learn.

Feel free to ask me any questions in the chat below!

You're doing great, ${studentName}!`;
  };

  // Send chat message
  const sendMessage = async () => {
    const messageText = inputText.trim();
    if (!messageText || !sessionId) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsAiReplying(true);
    Keyboard.dismiss();

    setTimeout(() => chatScrollRef.current?.scrollToEnd({animated: true}), 100);

    try {
      const response = await learningApi.sendMessage(sessionId, messageText);

      if (response.success && response.data?.aiMessage?.content) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: response.data.aiMessage.content,
          timestamp: new Date(),
        };
        setChatMessages(prev => [...prev, aiMessage]);
      } else {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: `That's a great question about ${topic?.topicTitle}! Let me help you understand this better. Could you tell me more specifically what part is confusing?`,
          timestamp: new Date(),
        };
        setChatMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.log('Chat error:', error);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: "I'm here to help! Please try asking your question again.",
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsAiReplying(false);
      setTimeout(() => chatScrollRef.current?.scrollToEnd({animated: true}), 100);
    }
  };

  // Handle complete
  const handleComplete = async () => {
    try {
      if (sessionId) {
        await learningApi.endSession(sessionId, 20);
      }
      if (currentStudent) {
        await learningApi.updateProgress(currentStudent.id, topicId, 100);
      }
      setIsCompleted(true);
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error) {
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
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerChapter, {color: subjectColor}]} numberOfLines={1}>{chapter}</Text>
          <Text style={[styles.headerLesson, {color: text}]} numberOfLines={1}>{topic?.topicTitle || lesson}</Text>
        </View>
        {aiTeachingComplete && !isCompleted && (
          <TouchableOpacity style={[styles.completeBtn, {backgroundColor: success}]} onPress={handleComplete}>
            <Icon name="check" size={16} color="#FFF" />
            <Text style={styles.completeBtnText}>Done</Text>
          </TouchableOpacity>
        )}
        {isCompleted && (
          <View style={[styles.completedBadgeSmall, {backgroundColor: success}]}>
            <Icon name="check-circle" size={16} color="#FFF" />
          </View>
        )}
      </View>

      {/* AI Teaching Section */}
      <View style={[styles.aiSection, {backgroundColor: `${subjectColor}08`, borderBottomColor: border}]}>
        <View style={styles.aiHeader}>
          <AIAvatar isActive={isAiTyping || isLoadingAi} isSpeaking={isSpeaking} color={subjectColor} />
          <View style={styles.aiHeaderText}>
            <Text style={[styles.aiName, {color: text}]}>🎓 Buddy AI Tutor</Text>
            <View style={styles.statusRow}>
              <Text style={[styles.aiStatus, {color: isSpeaking || isAiTyping ? subjectColor : textMuted}]}>
                {isLoadingAi ? '🧠 Thinking...' : isSpeaking ? '🗣️ Speaking...' : isAiTyping ? '✍️ Teaching...' : aiTeachingComplete ? '✅ Ready to help!' : '👋 Tap Start'}
              </Text>
              <SoundWave color={subjectColor} isActive={isSpeaking} />
            </View>
          </View>
          {!aiTeachingStarted ? (
            <TouchableOpacity style={[styles.startBtn, {backgroundColor: subjectColor}]} onPress={startAITeaching}>
              <Icon name="play" size={16} color="#FFF" />
              <Text style={styles.startBtnText}>Start</Text>
            </TouchableOpacity>
          ) : !aiTeachingComplete && (
            <TouchableOpacity style={[styles.pauseBtn, {backgroundColor: isPaused ? success : `${subjectColor}20`}]} onPress={togglePause}>
              <Icon name={isPaused ? 'play' : 'pause'} size={16} color={isPaused ? '#FFF' : subjectColor} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView ref={aiScrollRef} style={styles.aiContent} showsVerticalScrollIndicator={false}>
          {!aiTeachingStarted ? (
            <View style={styles.aiPlaceholder}>
              <Text style={styles.aiPlaceholderEmoji}>🎓</Text>
              <Text style={[styles.aiPlaceholderText, {color: textSecondary}]}>Tap "Start" to begin your lesson!</Text>
              <Text style={[styles.aiPlaceholderSubtext, {color: textMuted}]}>I'll explain step by step</Text>
            </View>
          ) : isLoadingAi ? (
            <View style={styles.aiPlaceholder}>
              <ActivityIndicator size="large" color={subjectColor} />
              <Text style={[styles.aiPlaceholderText, {color: textSecondary, marginTop: 12}]}>Preparing lesson...</Text>
            </View>
          ) : (
            <View style={styles.aiTextContainer}>
              <Text style={[styles.aiText, {color: text}]}>{aiText}</Text>
              {isAiTyping && !isPaused && <TypingIndicator color={subjectColor} />}
              {isPaused && (
                <View style={[styles.pausedBadge, {backgroundColor: `${textMuted}20`}]}>
                  <Icon name="pause" size={12} color={textMuted} />
                  <Text style={[styles.pausedText, {color: textMuted}]}>Paused</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>

      {/* Chat Section */}
      <KeyboardAvoidingView 
        style={styles.chatSection} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        
        <View style={[styles.chatHeader, {borderBottomColor: border}]}>
          <Icon name="message-circle" size={18} color={subjectColor} />
          <Text style={[styles.chatHeaderText, {color: text}]}>Ask Doubts</Text>
          {chatMessages.length > 0 && (
            <View style={[styles.messageBadge, {backgroundColor: subjectColor}]}>
              <Text style={styles.messageBadgeText}>{chatMessages.length}</Text>
            </View>
          )}
        </View>

        <ScrollView
          ref={chatScrollRef}
          style={styles.chatMessages}
          contentContainerStyle={styles.chatMessagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {chatMessages.length === 0 ? (
            <View style={styles.chatEmptyState}>
              <Text style={styles.chatEmptyEmoji}>💬</Text>
              <Text style={[styles.chatEmptyText, {color: textSecondary}]}>Have a doubt? Ask me!</Text>
              <Text style={[styles.chatEmptySubtext, {color: textMuted}]}>Type your question below</Text>
            </View>
          ) : (
            chatMessages.map(msg => (
              <View
                key={msg.id}
                style={[
                  styles.chatBubble,
                  msg.role === 'user' ? styles.userBubble : styles.aiBubble,
                  {backgroundColor: msg.role === 'user' ? subjectColor : card},
                ]}>
                {msg.role === 'ai' && (
                  <View style={styles.bubbleHeader}>
                    <Text style={styles.bubbleAvatar}>🤖</Text>
                    <Text style={[styles.bubbleName, {color: subjectColor}]}>Buddy</Text>
                  </View>
                )}
                <Text style={[styles.bubbleText, {color: msg.role === 'user' ? '#FFF' : text}]}>{msg.content}</Text>
              </View>
            ))
          )}
          {isAiReplying && (
            <View style={[styles.chatBubble, styles.aiBubble, {backgroundColor: card}]}>
              <View style={styles.bubbleHeader}>
                <Text style={styles.bubbleAvatar}>🤖</Text>
                <Text style={[styles.bubbleName, {color: subjectColor}]}>Buddy</Text>
              </View>
              <TypingIndicator color={subjectColor} />
            </View>
          )}
        </ScrollView>

        {/* Chat Input */}
        <View style={[styles.chatInputContainer, {backgroundColor: card, borderTopColor: border}]}>
          <TextInput
            ref={inputRef}
            style={[styles.chatInput, {backgroundColor: background, color: text, borderColor: border}]}
            placeholder="Type your doubt here..."
            placeholderTextColor={textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isAiReplying}
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            style={[styles.sendBtn, {backgroundColor: inputText.trim() ? subjectColor : `${textMuted}30`}]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isAiReplying}>
            <Icon name="send" size={20} color={inputText.trim() ? '#FFF' : textMuted} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  loadingText: {marginTop: Spacing.md, fontSize: FontSizes.sm},

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  backButton: {width: 40, height: 40, alignItems: 'center', justifyContent: 'center'},
  headerContent: {flex: 1, marginHorizontal: Spacing.sm},
  headerChapter: {fontSize: FontSizes.xs, fontWeight: '600', marginBottom: 2},
  headerLesson: {fontSize: FontSizes.sm, fontWeight: '700'},
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  completeBtnText: {color: '#FFF', fontSize: FontSizes.xs, fontWeight: '700'},
  completedBadgeSmall: {width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center'},

  // AI Section
  aiSection: {height: '38%', borderBottomWidth: 1},
  aiHeader: {flexDirection: 'row', alignItems: 'center', padding: Spacing.sm, gap: Spacing.sm},
  avatarContainer: {position: 'relative'},
  avatarOuter: {width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center'},
  avatarInner: {width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center'},
  avatarEmoji: {fontSize: 22},
  sparkle: {position: 'absolute', top: -4, right: -4},
  sparkleEmoji: {fontSize: 14},
  aiHeaderText: {flex: 1},
  aiName: {fontSize: FontSizes.sm, fontWeight: '700'},
  statusRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  aiStatus: {fontSize: FontSizes.xs, fontWeight: '500'},
  soundWaveContainer: {flexDirection: 'row', alignItems: 'center', gap: 2, height: 16},
  soundBar: {width: 3, height: 16, borderRadius: 2},
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    gap: 6,
  },
  startBtnText: {color: '#FFF', fontSize: FontSizes.sm, fontWeight: '700'},
  pauseBtn: {width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center'},
  aiContent: {flex: 1, paddingHorizontal: Spacing.md},
  aiPlaceholder: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xl},
  aiPlaceholderEmoji: {fontSize: 48, marginBottom: Spacing.sm},
  aiPlaceholderText: {fontSize: FontSizes.sm, fontWeight: '600', textAlign: 'center'},
  aiPlaceholderSubtext: {fontSize: FontSizes.xs, textAlign: 'center', marginTop: 6},
  aiTextContainer: {paddingVertical: Spacing.sm, paddingBottom: Spacing.lg},
  aiText: {fontSize: FontSizes.sm, lineHeight: 26},
  typingContainer: {flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.sm},
  typingDot: {width: 8, height: 8, borderRadius: 4},
  pausedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
  },
  pausedText: {fontSize: FontSizes.xs, fontWeight: '600'},

  // Chat Section
  chatSection: {flex: 1},
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  chatHeaderText: {flex: 1, fontSize: FontSizes.sm, fontWeight: '700'},
  messageBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  messageBadgeText: {color: '#FFF', fontSize: 11, fontWeight: '700'},
  chatMessages: {flex: 1},
  chatMessagesContent: {padding: Spacing.md, paddingBottom: Spacing.sm, flexGrow: 1},
  chatEmptyState: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xl},
  chatEmptyEmoji: {fontSize: 40, marginBottom: Spacing.sm},
  chatEmptyText: {fontSize: FontSizes.sm, fontWeight: '600', textAlign: 'center'},
  chatEmptySubtext: {fontSize: FontSizes.xs, textAlign: 'center', marginTop: 4},
  chatBubble: {
    maxWidth: '85%',
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  userBubble: {alignSelf: 'flex-end', borderBottomRightRadius: 4},
  aiBubble: {alignSelf: 'flex-start', borderBottomLeftRadius: 4},
  bubbleHeader: {flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4},
  bubbleAvatar: {fontSize: 14},
  bubbleName: {fontSize: FontSizes.xs, fontWeight: '600'},
  bubbleText: {fontSize: FontSizes.sm, lineHeight: 22},

  // Chat Input
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderTopWidth: 1,
    gap: 10,
  },
  chatInput: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    borderWidth: 1.5,
    borderRadius: 23,
    paddingHorizontal: Spacing.md,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: FontSizes.sm,
    textAlignVertical: 'center',
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
