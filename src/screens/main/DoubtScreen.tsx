/**
 * Doubt Screen
 * AI-powered doubt resolution with chat
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
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {Icon} from '../../components/ui';
import {BorderRadius, FontSizes, Spacing} from '../../constants/theme';

type Message = {
  id: string;
  message: string;
  sender: 'user' | 'ai';
  timestamp: string;
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    message:
      "Hi! I'm your AI tutor. I'm here to help you understand any topic or solve your doubts. What would you like to learn about today?",
    sender: 'ai',
    timestamp: '10:00 AM',
  },
];

export function DoubtScreen() {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const primary = useThemeColor({}, 'primary');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const backgroundSecondary = useThemeColor({}, 'backgroundSecondary');

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSend = () => {
    if (!inputText.trim()) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      message: inputText.trim(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        message:
          "That's a great question! Let me help you understand this better. Could you tell me what specific part is confusing you?",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const renderMessage = ({item}: {item: Message}) => {
    const isUser = item.sender === 'user';
    return (
      <View
        style={[styles.messageContainer, isUser && styles.userMessageContainer]}>
        {!isUser && (
          <View style={[styles.aiAvatar, {backgroundColor: primary}]}>
            <Text style={styles.aiAvatarText}>AI</Text>
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser
              ? {backgroundColor: primary}
              : {backgroundColor: card, borderWidth: 1, borderColor: border},
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
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: background}]}
      edges={['top', 'bottom']}>
      {/* Header */}
      <Animated.View
        style={[styles.header, {borderBottomColor: border, opacity: fadeAnim}]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, {color: text}]}>Ask a Doubt 💬</Text>
        </View>
        <TouchableOpacity style={styles.headerAction}>
          <Icon name="more-vertical" size={24} color={textSecondary} />
        </TouchableOpacity>
      </Animated.View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListFooterComponent={
          isTyping ? (
            <View style={styles.typingContainer}>
              <View style={[styles.aiAvatar, {backgroundColor: primary}]}>
                <Text style={styles.aiAvatarText}>AI</Text>
              </View>
              <View style={[styles.typingBubble, {backgroundColor: card}]}>
                <Text style={[styles.typingText, {color: textMuted}]}>
                  Typing...
                </Text>
              </View>
            </View>
          ) : null
        }
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View
          style={[
            styles.inputContainer,
            {backgroundColor: card, borderTopColor: border},
          ]}>
          <TouchableOpacity
            style={[styles.attachButton, {backgroundColor: backgroundSecondary}]}>
            <Icon name="camera" size={20} color={textMuted} />
          </TouchableOpacity>
          <View style={[styles.inputWrapper, {backgroundColor: backgroundSecondary}]}>
            <TextInput
              style={[styles.input, {color: text}]}
              placeholder="Type your doubt here..."
              placeholderTextColor={textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
          </View>
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: inputText.trim()
                  ? primary
                  : backgroundSecondary,
              },
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}>
            <Icon
              name={inputText.trim() ? 'send' : 'mic'}
              size={20}
              color={inputText.trim() ? '#FFF' : primary}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {flex: 1},
  headerTitle: {fontSize: FontSizes.lg, fontWeight: '700'},
  headerAction: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesContent: {padding: Spacing.base},
  messageContainer: {flexDirection: 'row', marginBottom: Spacing.md},
  userMessageContainer: {flexDirection: 'row-reverse'},
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  aiAvatarText: {color: '#FFF', fontSize: FontSizes.xs, fontWeight: '700'},
  messageBubble: {
    maxWidth: '75%',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderRadius: BorderRadius.lg,
  },
  messageText: {fontSize: FontSizes.base, lineHeight: 22},
  timestamp: {
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
    textAlign: 'right',
  },
  typingContainer: {flexDirection: 'row', marginBottom: Spacing.md},
  typingBubble: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderRadius: BorderRadius.lg,
  },
  typingText: {fontSize: FontSizes.sm},
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.base,
    borderTopWidth: 1,
    gap: Spacing.sm,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapper: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    minHeight: 40,
    maxHeight: 120,
    justifyContent: 'center',
  },
  input: {fontSize: FontSizes.base, maxHeight: 100},
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
