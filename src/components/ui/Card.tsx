/**
 * Card Component
 * Flexible card container with variants
 */

import React, {useRef} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {BorderRadius, Shadows, Spacing} from '../../constants/theme';

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
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const backgroundSecondary = useThemeColor({}, 'backgroundSecondary');

  const handlePressIn = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
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
      <Animated.View style={{transform: [{scale: scaleAnim}]}}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          activeOpacity={0.9}>
          {cardContent}
        </TouchableOpacity>
      </Animated.View>
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
