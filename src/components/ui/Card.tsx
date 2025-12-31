/**
 * Card Component
 * Flexible card container with variants
 */

import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {useThemeColor} from '../../hooks/useThemeColor';
import {BorderRadius, Shadows, Spacing} from '../../constants/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type CardVariant = 'elevated' | 'outlined' | 'filled';

interface CardProps extends ViewProps {
  variant?: CardVariant;
  padding?: keyof typeof Spacing | number;
  onPress?: () => void;
  disabled?: boolean;
}

export function Card({
  children,
  variant = 'elevated',
  padding = 'base',
  onPress,
  disabled = false,
  style,
  ...props
}: CardProps) {
  const scale = useSharedValue(1);

  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const backgroundSecondary = useThemeColor({}, 'backgroundSecondary');

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98, {damping: 15, stiffness: 300});
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {damping: 15, stiffness: 300});
  };

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: card,
          borderWidth: 1,
          borderColor: border,
        };
      case 'filled':
        return {
          backgroundColor: backgroundSecondary,
        };
      case 'elevated':
      default:
        return {
          backgroundColor: card,
          ...Shadows.md,
        };
    }
  };

  const paddingValue = typeof padding === 'number' ? padding : Spacing[padding];

  const cardContent = (
    <View
      style={[styles.card, getVariantStyles(), {padding: paddingValue}, style]}
      {...props}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <AnimatedTouchable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.9}
        style={animatedStyle}>
        {cardContent}
      </AnimatedTouchable>
    );
  }

  return cardContent;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
});
