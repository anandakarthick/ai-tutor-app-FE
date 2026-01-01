/**
 * Doubt Screen - Modern Design
 * AI-powered doubt resolution with beautiful chat UI
 */

import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  Keyboard,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {Icon} from '../../components/ui';
import {BorderRadius, FontSizes, Spacing, Shadows} from '../../constants/theme';

const {width} = Dimensions.get('window');

type Message = {
  id: string;
  message: string;
  sender: 'user' | 'ai';
  timestamp: string;
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    message: "Hello! 👋 I'm your AI tutor. Ask me anything about your studies - Math, Science, English, or any subject. I'm here to help you understand better!",
    sender: 'ai',
    timestamp: '10:00 AM',
  },
];

const QUICK_QUESTIONS = [
  {id: '1', text: 'Explain Pythagorean theorem', emoji: '📐'},
  {id: '2', text: 'What is photosynthesis?', emoji: '🌱'},
  {id: '3', text: 'Help with quadratic equations', emoji: '🔢'},
  {id: '4', text: 'Explain Newton\'s laws', emoji: '🚀'},
];

const SUBJECT_CHIPS = [
  {id: 'math', name: 'Math', emoji: '📐', color: '#F97316'},
  {id: 'science', name: 'Science', emoji: '🔬', color: '#22C55E'},
  {id: 'english', name: 'English', emoji: '📖', color: '#3B82F6'},
  {id: 'physics', name: 'Physics', emoji: '⚛️', color: '#8B5CF6'},
];

export function DoubtScreen() {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const typingDot1 = useRef(new Animated.Value(0.3)).current;
  const typingDot2 = useRef(new Animated.Value(0.3)).current;
  const typingDot3 = useRef(new Animated.Value(0.3)).current;

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const primary = useThemeColor({}, 'primary');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const backgroundSecondary = useThemeColor({}, 'backgroundSecondary');
  const primaryBg = useThemeColor({}, 'primaryBackground');

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({animated: true});
        }, 100);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Typing animation
  useEffect(() => {
    let animation: Animated.CompositeAnimation;
    
    if (isTyping) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(typingDot1, {toValue: 1, duration: 400, useNativeDriver: true}),
          Animated.timing(typingDot1, {toValue: 0.3, duration: 400, useNativeDriver: true}),
        ]),
      );
      animation.start();
      
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(typingDot2, {toValue: 1, duration: 400, useNativeDriver: true}),
            Animated.timing(typingDot2, {toValue: 0.3, duration: 400, useNativeDriver: true}),
          ]),
        ).start();
      }, 150);
      
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(typingDot3, {toValue: 1, duration: 400, useNativeDriver: true}),
            Animated.timing(typingDot3, {toValue: 0.3, duration: 400, useNativeDriver: true}),
          ]),
        ).start();
      }, 300);
    }
    
    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [isTyping]);

  const handleSend = (customMessage?: string) => {
    const messageText = customMessage || inputText.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      message: messageText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({animated: true});
    }, 100);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Great question! Let me break this down for you step by step. 📚\n\nFirst, let's understand the core concept...",
        "I'd be happy to help you with this! 🎯\n\nHere's a simple explanation...",
        "That's an interesting topic! Let me explain it in a way that's easy to understand. ✨",
        "Perfect! This is a common question. Let me guide you through it. 🚀",
      ];
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        message: responses[Math.floor(Math.random() * responses.length)],
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: true});
      }, 100);
    }, 2000);
  };

  const handleQuickQuestion = (question: string) => {
    handleSend(question);
  };

  const renderMessage = ({item, index}: {item: Message; index: number}) => {
    const isUser = item.sender === 'user';
    const isFirst = index === 0 || messages[index - 1].sender !== item.sender;
    
    return (
      <Animated.View
        style={[
          styles.messageWrapper,
          isUser ? styles.userMessageWrapper : styles.aiMessageWrapper,
        ]}>
        {!isUser && isFirst && (
          <View style={styles.aiAvatarContainer}>
            <View style={[styles.aiAvatar, {backgroundColor: primary}]}>
              <Text style={styles.aiAvatarEmoji}>🤖</Text>
            </View>
            <View style={[styles.onlineIndicator, {backgroundColor: '#22C55E'}]} />
          </View>
        )}
        {!isUser && !isFirst && <View style={styles.avatarSpacer} />}
        
        <View
          style={[
            styles.messageBubble,
            isUser
              ? [styles.userBubble, {backgroundColor: primary}]
              : [styles.aiBubble, {backgroundColor: card, borderColor: border}],
            isFirst && (isUser ? styles.userBubbleFirst : styles.aiBubbleFirst),
          ]}>
          <Text style={[styles.messageText, {color: isUser ? '#FFF' : text}]}>
            {item.message}
          </Text>
          <Text
            style={[
              styles.timestamp,
              {color: isUser ? 'rgba(255,255,255,0.7)' : textMuted},
            ]}>
            {item.timestamp}
          </Text>
        </View>
      </Animated.View>
    );
  };

  const renderTypingIndicator = () => (
    <View style={styles.typingWrapper}>
      <View style={styles.aiAvatarContainer}>
        <View style={[styles.aiAvatar, {backgroundColor: primary}]}>
          <Text style={styles.aiAvatarEmoji}>🤖</Text>
        </View>
      </View>
      <View style={[styles.typingBubble, {backgroundColor: card, borderColor: border}]}>
        <View style={styles.typingDots}>
          <Animated.View
            style={[
              styles.typingDot,
              {backgroundColor: primary, opacity: typingDot1},
            ]}
          />
          <Animated.View
            style={[
              styles.typingDot,
              {backgroundColor: primary, opacity: typingDot2},
            ]}
          />
          <Animated.View
            style={[
              styles.typingDot,
              {backgroundColor: primary, opacity: typingDot3},
            ]}
          />
        </View>
        <Text style={[styles.typingText, {color: textMuted}]}>AI is thinking...</Text>
      </View>
    </View>
  );

  const showQuickActions = messages.length <= 1 && !keyboardVisible;

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: background}]}
      edges={['top']}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        
        {/* Header */}
        <Animated.View style={[styles.header, {opacity: fadeAnim}]}>
          <View style={[styles.headerGradient, {backgroundColor: primary}]}>
            <View style={styles.headerDecor1} />
            <View style={styles.headerDecor2} />
            
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Icon name="chevron-left" size={24} color="#FFF" />
            </TouchableOpacity>
            
            <View style={styles.headerContent}>
              <View style={styles.headerTitleRow}>
                <Text style={styles.headerTitle}>AI Tutor</Text>
                <View style={styles.onlineBadge}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.onlineText}>Online</Text>
                </View>
              </View>
              <Text style={styles.headerSubtitle}>Ask any doubt, anytime! 🚀</Text>
            </View>
            
            <TouchableOpacity style={styles.headerAction}>
              <Icon name="more-vertical" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Subject Chips - Hide when keyboard is visible */}
        {!keyboardVisible && (
          <Animated.View style={[styles.subjectContainer, {opacity: fadeAnim}]}>
            <FlatList
              horizontal
              data={SUBJECT_CHIPS}
              keyExtractor={item => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.subjectList}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.subjectChip,
                    {
                      backgroundColor: selectedSubject === item.id ? item.color : card,
                      borderColor: selectedSubject === item.id ? item.color : border,
                    },
                  ]}
                  onPress={() => setSelectedSubject(
                    selectedSubject === item.id ? null : item.id
                  )}>
                  <Text style={styles.subjectEmoji}>{item.emoji}</Text>
                  <Text
                    style={[
                      styles.subjectName,
                      {color: selectedSubject === item.id ? '#FFF' : text},
                    ]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </Animated.View>
        )}

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => {
            if (keyboardVisible) {
              flatListRef.current?.scrollToEnd({animated: true});
            }
          }}
          onLayout={() => flatListRef.current?.scrollToEnd({animated: false})}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={
            <>
              {isTyping && renderTypingIndicator()}
              {showQuickActions && (
                <View style={styles.quickActionsContainer}>
                  <Text style={[styles.quickActionsTitle, {color: textSecondary}]}>
                    Quick questions to get started 💡
                  </Text>
                  <View style={styles.quickActionsGrid}>
                    {QUICK_QUESTIONS.map(q => (
                      <TouchableOpacity
                        key={q.id}
                        style={[styles.quickAction, {backgroundColor: card, borderColor: border}]}
                        onPress={() => handleQuickQuestion(q.text)}>
                        <Text style={styles.quickActionEmoji}>{q.emoji}</Text>
                        <Text style={[styles.quickActionText, {color: text}]} numberOfLines={2}>
                          {q.text}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
              <View style={{height: Spacing.md}} />
            </>
          }
        />

        {/* Input */}
        <View style={[styles.inputContainer, {backgroundColor: card, borderTopColor: border}]}>
          <TouchableOpacity
            style={[styles.attachButton, {backgroundColor: primaryBg}]}>
            <Icon name="image" size={20} color={primary} />
          </TouchableOpacity>
          
          <View style={[styles.inputWrapper, {backgroundColor: backgroundSecondary}]}>
            <TextInput
              ref={inputRef}
              style={[styles.input, {color: text}]}
              placeholder="Type your doubt here..."
              placeholderTextColor={textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              textAlignVertical="center"
            />
          </View>
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: inputText.trim() ? primary : backgroundSecondary,
              },
              inputText.trim() && Shadows.md,
            ]}
            onPress={() => handleSend()}
            disabled={!inputText.trim()}>
            <Icon
              name={inputText.trim() ? 'send' : 'mic'}
              size={20}
              color={inputText.trim() ? '#FFF' : primary}
            />
          </TouchableOpacity>
        </View>
        
        {/* Extra padding for bottom safe area */}
        <SafeAreaView edges={['bottom']} style={{backgroundColor: card}} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  keyboardAvoid: {flex: 1},
  
  // Header
  header: {
    overflow: 'hidden',
  },
  headerGradient: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  headerDecor1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerDecor2: {
    position: 'absolute',
    bottom: -20,
    left: '30%',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {flex: 1, marginLeft: Spacing.sm},
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: '#FFF',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
  },
  onlineText: {
    fontSize: FontSizes.xs,
    color: '#FFF',
    fontWeight: '500',
  },
  headerSubtitle: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  headerAction: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Subject Chips
  subjectContainer: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  subjectList: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: Spacing.xs,
    marginRight: Spacing.sm,
  },
  subjectEmoji: {
    fontSize: 14,
  },
  subjectName: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  
  // Messages
  messagesContent: {
    padding: Spacing.base,
    flexGrow: 1,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
    alignItems: 'flex-end',
  },
  userMessageWrapper: {
    justifyContent: 'flex-end',
  },
  aiMessageWrapper: {
    justifyContent: 'flex-start',
  },
  aiAvatarContainer: {
    position: 'relative',
    marginRight: Spacing.sm,
  },
  avatarSpacer: {
    width: 40,
    marginRight: Spacing.sm,
  },
  aiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiAvatarEmoji: {
    fontSize: 20,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderRadius: BorderRadius.xl,
  },
  userBubble: {
    borderBottomRightRadius: BorderRadius.xs,
  },
  aiBubble: {
    borderWidth: 1,
    borderBottomLeftRadius: BorderRadius.xs,
  },
  userBubbleFirst: {
    borderBottomRightRadius: BorderRadius.xs,
  },
  aiBubbleFirst: {
    borderBottomLeftRadius: BorderRadius.xs,
  },
  messageText: {
    fontSize: FontSizes.base,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
    textAlign: 'right',
  },
  
  // Typing Indicator
  typingWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: Spacing.sm,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typingText: {
    fontSize: FontSizes.sm,
  },
  
  // Quick Actions
  quickActionsContainer: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  quickActionsTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  quickAction: {
    width: (width - Spacing.base * 2 - Spacing.md) / 2 - Spacing.md,
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  quickActionEmoji: {
    fontSize: 24,
  },
  quickActionText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    textAlign: 'center',
  },
  
  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.sm,
    paddingHorizontal: Spacing.base,
    borderTopWidth: 1,
    gap: Spacing.sm,
  },
  attachButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapper: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.base,
    minHeight: 44,
    maxHeight: 120,
    justifyContent: 'center',
  },
  input: {
    fontSize: FontSizes.base,
    maxHeight: 100,
    minHeight: 44,
    paddingTop: Platform.OS === 'ios' ? 12 : 10,
    paddingBottom: Platform.OS === 'ios' ? 12 : 10,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
