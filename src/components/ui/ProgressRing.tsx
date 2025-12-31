/**
 * ProgressRing Component
 * Circular progress indicator with orange theme
 */

import React, {useEffect, useRef, useState} from 'react';
import {View, Text, StyleSheet, Animated, type ViewStyle} from 'react-native';
import Svg, {Circle, Defs, LinearGradient, Stop} from 'react-native-svg';
import {useThemeColor} from '../../hooks/useThemeColor';
import {FontSizes} from '../../constants/theme';

type ProgressRingSize = 'sm' | 'md' | 'lg' | 'xl';
type ProgressRingVariant = 'primary' | 'success' | 'warning' | 'error' | 'secondary';

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
  const [displayProgress, setDisplayProgress] = useState(0);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const backgroundTertiary = useThemeColor({}, 'backgroundTertiary');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');

  const dimension = sizeMap[size];
  const stroke = strokeWidth || strokeWidthMap[size];
  const radius = (dimension - stroke) / 2;
  const circumference = radius * 2 * Math.PI;

  const getColors = (): {start: string; end: string} => {
    switch (variant) {
      case 'success':
        return {start: '#22C55E', end: '#16A34A'};
      case 'warning':
        return {start: '#FBBF24', end: '#F59E0B'};
      case 'error':
        return {start: '#F87171', end: '#EF4444'};
      case 'secondary':
        return {start: '#3B82F6', end: '#2563EB'};
      default:
        // Orange gradient
        return {start: '#FB923C', end: '#F97316'};
    }
  };

  useEffect(() => {
    const clampedProgress = Math.min(100, Math.max(0, progress));
    
    if (animated) {
      animatedValue.setValue(displayProgress);
      Animated.timing(animatedValue, {
        toValue: clampedProgress,
        duration: 800,
        useNativeDriver: false,
      }).start();

      const listener = animatedValue.addListener(({value}) => {
        setDisplayProgress(value);
      });

      return () => {
        animatedValue.removeListener(listener);
      };
    } else {
      setDisplayProgress(clampedProgress);
    }
  }, [progress, animated]);

  const colors = getColors();
  const center = dimension / 2;
  const strokeDashoffset = circumference - (displayProgress / 100) * circumference;

  return (
    <View
      style={[styles.container, {width: dimension, height: dimension}, style]}>
      <Svg width={dimension} height={dimension}>
        <Defs>
          <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.start} />
            <Stop offset="100%" stopColor={colors.end} />
          </LinearGradient>
        </Defs>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundTertiary}
          strokeWidth={stroke}
          fill="transparent"
        />
        {/* Progress circle with gradient */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
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
                    : size === 'lg'
                    ? FontSizes.xl
                    : FontSizes['2xl'],
              },
            ]}>
            {Math.round(displayProgress)}%
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
