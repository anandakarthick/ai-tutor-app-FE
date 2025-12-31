/**
 * SubjectCard Component
 * Display subject with progress
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {useThemeColor} from '../../../hooks/useThemeColor';
import {ProgressRing} from '../ProgressRing';
import {Icon} from '../Icon';
import {
  BorderRadius,
  FontSizes,
  Shadows,
  Spacing,
  getSubjectColor,
} from '../../../constants/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

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
  const scale = useSharedValue(1);
  const colorScheme = useColorScheme() ?? 'light';

  const card = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');

  const subjectColor = getSubjectColor(subject, colorScheme);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, {damping: 15, stiffness: 300});
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {damping: 15, stiffness: 300});
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
      history: 'history',
      geography: 'globe',
    };
    return iconMap[subj.toLowerCase()] || 'book';
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      style={[
        styles.container,
        {backgroundColor: card},
        Shadows.md,
        animatedStyle,
      ]}>
      <View
        style={[
          styles.iconContainer,
          {backgroundColor: `${subjectColor}20`},
        ]}>
        <Icon
          name={icon || getSubjectIcon(subject)}
          size={24}
          color={subjectColor}
        />
      </View>
      <View style={styles.content}>
        <Text style={[styles.subject, {color: text}]} numberOfLines={1}>
          {subject}
        </Text>
        <Text style={[styles.chapters, {color: textSecondary}]}>
          {chaptersCompleted}/{totalChapters} chapters
        </Text>
      </View>
      <ProgressRing progress={progress} size="sm" showLabel={false} />
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
    marginRight: Spacing.md,
  },
  subject: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    marginBottom: 4,
  },
  chapters: {
    fontSize: FontSizes.sm,
  },
});
