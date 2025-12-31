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
  getSubjectColor,
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

  const subjectColor = getSubjectColor(subject, colorScheme);

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
      history: 'history',
      geography: 'globe',
    };
    return iconMap[subj.toLowerCase()] || 'book';
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
      </TouchableOpacity>
    </Animated.View>
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
