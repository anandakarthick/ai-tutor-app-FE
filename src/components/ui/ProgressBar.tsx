/**
 * ProgressBar Component - Orange Theme
 * Linear progress indicator
 */

import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated, type ViewStyle} from 'react-native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {BorderRadius, FontSizes, Spacing} from '../../constants/theme';

type ProgressBarSize = 'sm' | 'md' | 'lg';
type ProgressBarVariant = 'primary' | 'success' | 'warning' | 'error' | 'secondary';

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
  sm: 6,
  md: 10,
  lg: 14,
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
  const animatedProgress = useRef(new Animated.Value(0)).current;

  const primary = useThemeColor({}, 'primary');
  const secondary = useThemeColor({}, 'secondary');
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
      case 'secondary':
        return secondary;
      default:
        return primary; // Orange
    }
  };

  useEffect(() => {
    const clampedProgress = Math.min(100, Math.max(0, progress));
    if (animated) {
      Animated.timing(animatedProgress, {
        toValue: clampedProgress,
        duration: 800,
        useNativeDriver: false,
      }).start();
    } else {
      animatedProgress.setValue(clampedProgress);
    }
  }, [progress, animated, animatedProgress]);

  const height = heightMap[size];
  const color = getColor();

  const widthInterpolate = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, style]}>
      {(showLabel || label) && (
        <View style={styles.labelContainer}>
          {label && <Text style={[styles.label, {color: text}]}>{label}</Text>}
          {showLabel && (
            <Text style={[styles.percentage, {color: primary}]}>
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
              width: widthInterpolate,
            },
          ]}
        />
        {/* Shine effect */}
        <Animated.View
          style={[
            styles.shine,
            {
              height: height / 2,
              borderRadius: height / 4,
              width: widthInterpolate,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  percentage: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  track: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  shine: {
    position: 'absolute',
    left: 0,
    top: 1,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginLeft: 2,
  },
});
