/**
 * Doubt Screen - AI-powered doubt resolution
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
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {useDoubts} from '../../hooks';
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
    timestamp: 'Now',
  },
];

const QUICK_QUESTIONS = [
  {id: '1', text: 'Explain Pythagorean theorem', emoji: '📐'},
  {id: '2', text: 'What is photosynthesis?', emoji: '🌱'},
  {id: '3', text: 'Help with quadratic equations', emoji: '🔢'},
  {id: '4', text: "Explain Newton's laws", emoji: '🚀'},
];

const SUBJECT_CHIPS = [
  {id: 'math', name: 'Math', emoji: '📐', color: '#F97316'},
  {id: 'science', name: 'Science', emoji: '🔬', color: '#22C55E'},
  {id: 'english', name: 'English', emoji: '📖', color: '#3B82F6'},
  {id: 'physics', name: 'Physics', emoji: '⚛️', color: '#8B5CF6'},
];

export function DoubtScreen() {
  const navigation = useNavigation();
  const {createDoubt, creating} = useDoubts();
  
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
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

    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Typing animation
  useEffect(() => {
    if (!isTyping) return;
    
    const animate = () => {
      Animated.sequence([
        Animated.timing(typingDot1, {toValue: 1, duration: 300, useNativeDriver: true}),
        Animated.timing(typingDot1, {toValue: 0.3, duration: 300, useNativeDriver: true}),
      ]).start();
      
      setTimeout(() => {
        Animated.sequence([
          Animated.timing(typingDot2, {toValue: 1, duration: 300, useNativeDriver: true}),
          Animated.timing(typingDot2, {toValue: 0.3, duration: 300, useNativeDriver: true}),
        ]).start();
      }, 100);
      
      setTimeout(() => {
        Animated.sequence([
          Animated.timing(typingDot3, {toValue: 1, duration: 300, useNativeDriver: true}),
          Animated.timing(typingDot3, {toValue: 0.3, duration: 300, useNativeDriver: true}),
        ]).start();
      }, 200);
    };
    
    animate();
    const interval = setInterval(animate, 900);
    return () => clearInterval(interval);
  }, [isTyping]);

  const handleSend = async (customMessage?: string) => {
    const messageText = customMessage || inputText.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      message: messageText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    
    setTimeout(() => flatListRef.current?.scrollToEnd({animated: true}), 100);

    try {
      // Create doubt via API
      const doubt = await createDoubt(messageText);
      
      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        message: doubt?.aiAnswer || "I'm processing your question. Let me think about this... 🤔\n\nThis is a great question! Here's what you need to know...",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      // Fallback response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        message: "I understand your question! Let me help you with this. 📚\n\nCould you provide more details so I can give you a better explanation?",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
      };
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsTyping(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({animated: true}), 100);
    }
  };

  const renderMessage = ({item, index}: {item: Message; index: number}) => {
    const isUser = item.sender === 'user';
    const isFirst = index === 0 || messages[index - 1].sender !== item.sender;
    
    return (
      <View style={[styles.messageWrapper, isUser ? styles.userMessageWrapper : styles.aiMessageWrapper]}>
        {!isUser && isFirst && (
          <View style={styles.aiAvatarContainer}>
            <View style={[styles.aiAvatar, {backgroundColor: primary}]}>
              <Text style={styles.aiAvatarEmoji}>🤖</Text>
            </View>
          </View>
        )}
        {!isUser && !isFirst && <View style={styles.avatarSpacer} />}
        
        <View
          style={[
            styles.messageBubble,
            isUser ? [styles.userBubble, {backgroundColor: primary}] : [styles.aiBubble, {backgroundColor: card, borderColor: border}],
          ]}>
          <Text style={[styles.messageText, {color: isUser ? '#FFF' : text}]}>{item.message}</Text>
          <Text style={[styles.timestamp, {color: isUser ? 'rgba(255,255,255,0.7)' : textMuted}]}>
            {item.timestamp}
          </Text>
        </View>
      </View>
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
          <Animated.View style={[styles.typingDot, {backgroundColor: primary, opacity: typingDot1}]} />
          <Animated.View style={[styles.typingDot, {backgroundColor: primary, opacity: typingDot2}]} />
          <Animated.View style={[styles.typingDot, {backgroundColor: primary, opacity: typingDot3}]} />
        </View>
        <Text style={[styles.typingText, {color: textMuted}]}>AI is thinking...</Text>
      </View>
    </View>
  );

  const showQuickActions = messages.length <= 1 && !keyboardVisible;

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: background}]} edges={['top']}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        
        {/* Header */}
        <View style={[styles.header, {backgroundColor: primary}]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="chevron-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>AI Tutor</Text>
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.headerAction}>
            <Icon name="more-vertical" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Subject Chips */}
        {!keyboardVisible && (
          <View style={[styles.subjectContainer, {borderBottomColor: border}]}>
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
                  onPress={() => setSelectedSubject(selectedSubject === item.id ? null : item.id)}>
                  <Text style={styles.subjectEmoji}>{item.emoji}</Text>
                  <Text style={[styles.subjectName, {color: selectedSubject === item.id ? '#FFF' : text}]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={
            <>
              {isTyping && renderTypingIndicator()}
              {showQuickActions && (
                <View style={styles.quickActionsContainer}>
                  <Text style={[styles.quickActionsTitle, {color: textSecondary}]}>
                    Quick questions 💡
                  </Text>
                  <View style={styles.quickActionsGrid}>
                    {QUICK_QUESTIONS.map(q => (
                      <TouchableOpacity
                        key={q.id}
                        style={[styles.quickAction, {backgroundColor: card, borderColor: border}]}
                        onPress={() => handleSend(q.text)}>
                        <Text style={styles.quickActionEmoji}>{q.emoji}</Text>
                        <Text style={[styles.quickActionText, {color: text}]} numberOfLines={2}>
                          {q.text}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </>
          }
        />

        {/* Input */}
        <View style={[styles.inputContainer, {backgroundColor: card, borderTopColor: border}]}>
          <TouchableOpacity style={[styles.attachButton, {backgroundColor: primaryBg}]}>
            <Icon name="image" size={20} color={primary} />
          </TouchableOpacity>
          
          <View style={[styles.inputWrapper, {backgroundColor: backgroundSecondary}]}>
            <TextInput
              style={[styles.input, {color: text}]}
              placeholder="Type your doubt..."
              placeholderTextColor={textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!creating}
            />
          </View>
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              {backgroundColor: inputText.trim() ? primary : backgroundSecondary},
            ]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || creating}>
            {creating ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Icon name="send" size={20} color={inputText.trim() ? '#FFF' : primary} />
            )}
          </TouchableOpacity>
        </View>
        
        <SafeAreaView edges={['bottom']} style={{backgroundColor: card}} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  keyboardAvoid: {flex: 1},
  header: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {width: 40, height: 40, alignItems: 'center', justifyContent: 'center'},
  headerContent: {flex: 1, marginLeft: Spacing.sm},
  headerTitle: {fontSize: FontSizes.xl, fontWeight: '700', color: '#FFF'},
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  onlineDot: {width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80'},
  onlineText: {fontSize: FontSizes.xs, color: 'rgba(255,255,255,0.8)'},
  headerAction: {width: 40, height: 40, alignItems: 'center', justifyContent: 'center'},
  subjectContainer: {paddingVertical: Spacing.md, borderBottomWidth: 1},
  subjectList: {paddingHorizontal: Spacing.base, gap: Spacing.sm},
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
  subjectEmoji: {fontSize: 14},
  subjectName: {fontSize: FontSizes.sm, fontWeight: '600'},
  messagesContent: {padding: Spacing.base, flexGrow: 1},
  messageWrapper: {flexDirection: 'row', marginBottom: Spacing.sm, alignItems: 'flex-end'},
  userMessageWrapper: {justifyContent: 'flex-end'},
  aiMessageWrapper: {justifyContent: 'flex-start'},
  aiAvatarContainer: {marginRight: Spacing.sm},
  avatarSpacer: {width: 40, marginRight: Spacing.sm},
  aiAvatar: {width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center'},
  aiAvatarEmoji: {fontSize: 20},
  messageBubble: {maxWidth: '75%', paddingVertical: Spacing.md, paddingHorizontal: Spacing.base, borderRadius: BorderRadius.xl},
  userBubble: {borderBottomRightRadius: BorderRadius.xs},
  aiBubble: {borderWidth: 1, borderBottomLeftRadius: BorderRadius.xs},
  messageText: {fontSize: FontSizes.base, lineHeight: 22},
  timestamp: {fontSize: FontSizes.xs, marginTop: Spacing.xs, textAlign: 'right'},
  typingWrapper: {flexDirection: 'row', alignItems: 'flex-end', marginBottom: Spacing.sm},
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  typingDots: {flexDirection: 'row', gap: 4},
  typingDot: {width: 8, height: 8, borderRadius: 4},
  typingText: {fontSize: FontSizes.sm},
  quickActionsContainer: {marginTop: Spacing.xl, paddingTop: Spacing.lg},
  quickActionsTitle: {fontSize: FontSizes.sm, fontWeight: '600', marginBottom: Spacing.md},
  quickActionsGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md},
  quickAction: {
    width: (width - Spacing.base * 2 - Spacing.md) / 2 - Spacing.md,
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  quickActionEmoji: {fontSize: 24},
  quickActionText: {fontSize: FontSizes.sm, fontWeight: '500', textAlign: 'center'},
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.sm,
    paddingHorizontal: Spacing.base,
    borderTopWidth: 1,
    gap: Spacing.sm,
  },
  attachButton: {width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center'},
  inputWrapper: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.base,
    minHeight: 44,
    justifyContent: 'center',
  },
  input: {fontSize: FontSizes.base, maxHeight: 100, minHeight: 44, paddingVertical: 12},
  sendButton: {width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center'},
});
