/**
 * SubjectCard Component
 * Display subject with progress
 */

import React, {useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  useColorScheme,
} from 'react-native';
import {useThemeColor} from '../../../hooks/useThemeColor';
import {ProgressRing} from '../ProgressRing';
import {Icon} from '../Icon';
import {
  BorderRadius,
  FontSizes,
  Shadows,
  Spacing,
  getSubjectTheme,
} from '../../../constants/theme';

interface SubjectCardProps {
  subject: string;
  chaptersCompleted: number;
  totalChapters: number;
  progress: number;
  icon?: string;
  onPress?: () => void;
}

export function SubjectCard({
  subject,
  chaptersCompleted,
  totalChapters,
  progress,
  icon,
  onPress,
}: SubjectCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const colorScheme = useColorScheme() ?? 'light';

  const card = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');

  const subjectTheme = getSubjectTheme(subject, colorScheme);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getSubjectIcon = (subj: string): string => {
    const iconMap: Record<string, string> = {
      mathematics: 'function',
      math: 'function',
      science: 'flask',
      physics: 'atom',
      chemistry: 'flask',
      biology: 'leaf',
      english: 'book',
      hindi: 'book',
      history: 'history',
      geography: 'globe',
      'social science': 'globe',
      socialscience: 'globe',
    };
    return iconMap[subj.toLowerCase()] || 'book';
  };

  const getSubjectEmoji = (subj: string): string => {
    const emojiMap: Record<string, string> = {
      mathematics: '📐',
      math: '📐',
      science: '🔬',
      physics: '⚛️',
      chemistry: '🧪',
      biology: '🧬',
      english: '📖',
      hindi: '📚',
      history: '🏛️',
      geography: '🌍',
      'social science': '🌐',
      socialscience: '🌐',
    };
    return emojiMap[subj.toLowerCase()] || '📘';
  };

  return (
    <Animated.View style={{transform: [{scale: scaleAnim}]}}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={[styles.container, {backgroundColor: card}, Shadows.md]}>
        <View
          style={[
            styles.iconContainer,
            {backgroundColor: subjectTheme.background},
          ]}>
          <Icon
            name={icon || getSubjectIcon(subject)}
            size={24}
            color={subjectTheme.icon}
          />
        </View>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={[styles.subject, {color: text}]} numberOfLines={1}>
              {subject}
            </Text>
            <Text style={styles.emoji}>{getSubjectEmoji(subject)}</Text>
          </View>
          <Text style={[styles.chapters, {color: textSecondary}]}>
            {chaptersCompleted}/{totalChapters} chapters completed
          </Text>
        </View>
        <ProgressRing 
          progress={progress} 
          size="sm" 
          showLabel={false}
          variant={progress >= 50 ? 'success' : 'primary'}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
    marginRight: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  subject: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    marginBottom: 4,
  },
  emoji: {
    fontSize: 14,
    marginBottom: 4,
  },
  chapters: {
    fontSize: FontSizes.sm,
  },
});
