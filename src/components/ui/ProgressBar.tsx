/**
 * ProgressBar Component
 * Linear progress indicator
 */

import React, {useEffect} from 'react';
import {View, Text, StyleSheet, type ViewStyle} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {useThemeColor} from '../../hooks/useThemeColor';
import {BorderRadius, FontSizes, Spacing} from '../../constants/theme';

type ProgressBarSize = 'sm' | 'md' | 'lg';
type ProgressBarVariant = 'primary' | 'success' | 'warning' | 'error';

interface ProgressBarProps {
  progress: number; // 0-100
  size?: ProgressBarSize;
  variant?: ProgressBarVariant;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  style?: ViewStyle;
}

const heightMap: Record<ProgressBarSize, number> = {
  sm: 4,
  md: 8,
  lg: 12,
};

export function ProgressBar({
  progress,
  size = 'md',
  variant = 'primary',
  showLabel = false,
  label,
  animated = true,
  style,
}: ProgressBarProps) {
  const animatedProgress = useSharedValue(0);

  const primary = useThemeColor({}, 'primary');
  const success = useThemeColor({}, 'success');
  const warning = useThemeColor({}, 'warning');
  const error = useThemeColor({}, 'error');
  const backgroundTertiary = useThemeColor({}, 'backgroundTertiary');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');

  const getColor = () => {
    switch (variant) {
      case 'success':
        return success;
      case 'warning':
        return warning;
      case 'error':
        return error;
      default:
        return primary;
    }
  };

  useEffect(() => {
    const clampedProgress = Math.min(100, Math.max(0, progress));
    if (animated) {
      animatedProgress.value = withTiming(clampedProgress, {
        duration: 600,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      animatedProgress.value = clampedProgress;
    }
  }, [progress, animated, animatedProgress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value}%`,
  }));

  const height = heightMap[size];
  const color = getColor();

  return (
    <View style={[styles.container, style]}>
      {(showLabel || label) && (
        <View style={styles.labelContainer}>
          {label && <Text style={[styles.label, {color: text}]}>{label}</Text>}
          {showLabel && (
            <Text style={[styles.percentage, {color: textSecondary}]}>
              {Math.round(progress)}%
            </Text>
          )}
        </View>
      )}
      <View
        style={[
          styles.track,
          {
            height,
            backgroundColor: backgroundTertiary,
            borderRadius: height / 2,
          },
        ]}>
        <Animated.View
          style={[
            styles.fill,
            {
              height,
              backgroundColor: color,
              borderRadius: height / 2,
            },
            animatedStyle,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  percentage: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
