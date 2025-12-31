/**
 * ProgressRing Component
 * Circular progress indicator
 */

import React, {useEffect} from 'react';
import {View, Text, StyleSheet, type ViewStyle} from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, {Circle} from 'react-native-svg';
import {useThemeColor} from '../../hooks/useThemeColor';
import {FontSizes} from '../../constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type ProgressRingSize = 'sm' | 'md' | 'lg' | 'xl';
type ProgressRingVariant = 'primary' | 'success' | 'warning' | 'error';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: ProgressRingSize;
  variant?: ProgressRingVariant;
  strokeWidth?: number;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  style?: ViewStyle;
}

const sizeMap: Record<ProgressRingSize, number> = {
  sm: 48,
  md: 64,
  lg: 96,
  xl: 128,
};

const strokeWidthMap: Record<ProgressRingSize, number> = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 10,
};

export function ProgressRing({
  progress,
  size = 'md',
  variant = 'primary',
  strokeWidth,
  showLabel = true,
  label,
  animated = true,
  style,
}: ProgressRingProps) {
  const animatedProgress = useSharedValue(0);

  const primary = useThemeColor({}, 'primary');
  const success = useThemeColor({}, 'success');
  const warning = useThemeColor({}, 'warning');
  const error = useThemeColor({}, 'error');
  const backgroundTertiary = useThemeColor({}, 'backgroundTertiary');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');

  const dimension = sizeMap[size];
  const stroke = strokeWidth || strokeWidthMap[size];
  const radius = (dimension - stroke) / 2;
  const circumference = radius * 2 * Math.PI;

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
        duration: 800,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      animatedProgress.value = clampedProgress;
    }
  }, [progress, animated, animatedProgress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset:
      circumference - (animatedProgress.value / 100) * circumference,
  }));

  const color = getColor();
  const center = dimension / 2;

  return (
    <View
      style={[styles.container, {width: dimension, height: dimension}, style]}>
      <Svg width={dimension} height={dimension}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundTertiary}
          strokeWidth={stroke}
          fill="transparent"
        />
        {/* Progress circle */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text
            style={[
              styles.percentage,
              {
                color: text,
                fontSize:
                  size === 'sm'
                    ? FontSizes.xs
                    : size === 'md'
                    ? FontSizes.sm
                    : FontSizes.xl,
              },
            ]}>
            {Math.round(progress)}%
          </Text>
          {label && (
            <Text
              style={[
                styles.label,
                {
                  color: textSecondary,
                  fontSize:
                    size === 'sm'
                      ? 8
                      : size === 'md'
                      ? FontSizes.xs
                      : FontSizes.sm,
                },
              ]}>
              {label}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentage: {
    fontWeight: '700',
  },
  label: {
    fontWeight: '500',
    marginTop: 2,
  },
});
