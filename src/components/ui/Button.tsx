/**
 * Button Component
 * Reusable button with multiple variants and states
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  type TouchableOpacityProps,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {useThemeColor} from '../../hooks/useThemeColor';
import {Colors, BorderRadius, FontSizes, Spacing} from '../../constants/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  ...props
}: ButtonProps) {
  const scale = useSharedValue(1);

  const primary = useThemeColor({}, 'primary');
  const error = useThemeColor({}, 'error');
  const text = useThemeColor({}, 'text');
  const border = useThemeColor({}, 'border');

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, {damping: 15, stiffness: 300});
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {damping: 15, stiffness: 300});
  };

  const getVariantStyles = (): {container: ViewStyle; text: TextStyle} => {
    const baseOpacity = disabled ? 0.5 : 1;

    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: primary,
            opacity: baseOpacity,
          },
          text: {color: '#FFFFFF'},
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: Colors.light.primaryBackground,
            opacity: baseOpacity,
          },
          text: {color: primary},
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: border,
            opacity: baseOpacity,
          },
          text: {color: text},
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
            opacity: baseOpacity,
          },
          text: {color: primary},
        };
      case 'danger':
        return {
          container: {
            backgroundColor: error,
            opacity: baseOpacity,
          },
          text: {color: '#FFFFFF'},
        };
      default:
        return {
          container: {backgroundColor: primary},
          text: {color: '#FFFFFF'},
        };
    }
  };

  const getSizeStyles = (): {container: ViewStyle; text: TextStyle} => {
    switch (size) {
      case 'sm':
        return {
          container: {
            paddingVertical: Spacing.sm,
            paddingHorizontal: Spacing.base,
            borderRadius: BorderRadius.base,
          },
          text: {fontSize: FontSizes.sm},
        };
      case 'lg':
        return {
          container: {
            paddingVertical: Spacing.base,
            paddingHorizontal: Spacing.xl,
            borderRadius: BorderRadius.lg,
          },
          text: {fontSize: FontSizes.lg},
        };
      default:
        return {
          container: {
            paddingVertical: Spacing.md,
            paddingHorizontal: Spacing.lg,
            borderRadius: BorderRadius.md,
          },
          text: {fontSize: FontSizes.base},
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <AnimatedTouchable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.container,
        variantStyles.container,
        sizeStyles.container,
        fullWidth && styles.fullWidth,
        animatedStyle,
        style,
      ]}
      {...props}>
      {loading ? (
        <ActivityIndicator
          color={variantStyles.text.color as string}
          size={size === 'sm' ? 'small' : 'small'}
        />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text style={[styles.text, variantStyles.text, sizeStyles.text]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: Spacing.sm,
  },
  iconRight: {
    marginLeft: Spacing.sm,
  },
});
