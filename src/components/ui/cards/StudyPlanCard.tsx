/**
 * StudyPlanCard Component
 * Display today's study plan item
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
import {
  BorderRadius,
  FontSizes,
  Shadows,
  Spacing,
  getSubjectColor,
} from '../../../constants/theme';
import {Icon} from '../Icon';
import {Badge} from '../Badge';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface StudyPlanCardProps {
  topic: string;
  subject: string;
  chapter: string;
  duration: number;
  scheduledTime?: string;
  isCompleted?: boolean;
  isCurrent?: boolean;
  onPress?: () => void;
}

export function StudyPlanCard({
  topic,
  subject,
  chapter,
  duration,
  scheduledTime,
  isCompleted = false,
  isCurrent = false,
  onPress,
}: StudyPlanCardProps) {
  const scale = useSharedValue(1);
  const colorScheme = useColorScheme() ?? 'light';

  const card = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const success = useThemeColor({}, 'success');
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');

  const subjectColor = getSubjectColor(subject, colorScheme);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, {damping: 15, stiffness: 300});
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {damping: 15, stiffness: 300});
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      style={[
        styles.container,
        {backgroundColor: card, borderColor: isCurrent ? primary : border},
        isCurrent && styles.currentBorder,
        Shadows.sm,
        animatedStyle,
      ]}>
      <View
        style={[
          styles.indicator,
          {
            backgroundColor: isCompleted ? success : subjectColor,
            opacity: isCompleted ? 1 : 0.8,
          },
        ]}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {scheduledTime && (
              <Text style={[styles.time, {color: textMuted}]}>
                {scheduledTime}
              </Text>
            )}
            <Badge label={subject} variant="primary" size="sm" />
          </View>
          {isCompleted && (
            <View style={[styles.completedBadge, {backgroundColor: `${success}20`}]}>
              <Icon name="check-circle" size={16} color={success} />
            </View>
          )}
          {isCurrent && !isCompleted && (
            <Badge label="Now" variant="warning" size="sm" />
          )}
        </View>

        <Text
          style={[
            styles.topic,
            {color: text},
            isCompleted && styles.completedText,
          ]}
          numberOfLines={2}>
          {topic}
        </Text>

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Icon name="book" size={12} color={textMuted} />
            <Text style={[styles.metaText, {color: textSecondary}]}>
              {chapter}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="clock" size={12} color={textMuted} />
            <Text style={[styles.metaText, {color: textSecondary}]}>
              {duration} min
            </Text>
          </View>
        </View>
      </View>

      {!isCompleted && (
        <View style={styles.action}>
          <Icon name="chevron-right" size={16} color={textMuted} />
        </View>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
  },
  currentBorder: {
    borderWidth: 2,
  },
  indicator: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: Spacing.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  time: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
  },
  completedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topic: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaText: {
    fontSize: FontSizes.xs,
  },
  action: {
    padding: Spacing.base,
    justifyContent: 'center',
  },
});
