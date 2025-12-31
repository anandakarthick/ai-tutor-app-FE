/**
 * Button Component
 * Reusable button with multiple variants and states
 */

import React, {useRef} from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  Animated,
  type TouchableOpacityProps,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {Colors, BorderRadius, FontSizes, Spacing, Shadows} from '../../constants/theme';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success';
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
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const primary = useThemeColor({}, 'primary');
  const primaryLight = useThemeColor({}, 'primaryLight');
  const secondary = useThemeColor({}, 'secondary');
  const success = useThemeColor({}, 'success');
  const error = useThemeColor({}, 'error');
  const text = useThemeColor({}, 'text');
  const border = useThemeColor({}, 'border');
  const primaryBg = useThemeColor({}, 'primaryBackground');

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

  const getVariantStyles = (): {container: ViewStyle; text: TextStyle; shadow: any} => {
    const baseOpacity = disabled ? 0.5 : 1;

    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: primary,
            opacity: baseOpacity,
          },
          text: {color: '#FFFFFF'},
          shadow: Shadows.md,
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: primaryBg,
            opacity: baseOpacity,
          },
          text: {color: primary},
          shadow: Shadows.sm,
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: primary,
            opacity: baseOpacity,
          },
          text: {color: primary},
          shadow: Shadows.none,
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
            opacity: baseOpacity,
          },
          text: {color: primary},
          shadow: Shadows.none,
        };
      case 'danger':
        return {
          container: {
            backgroundColor: error,
            opacity: baseOpacity,
          },
          text: {color: '#FFFFFF'},
          shadow: Shadows.md,
        };
      case 'success':
        return {
          container: {
            backgroundColor: success,
            opacity: baseOpacity,
          },
          text: {color: '#FFFFFF'},
          shadow: Shadows.md,
        };
      default:
        return {
          container: {backgroundColor: primary},
          text: {color: '#FFFFFF'},
          shadow: Shadows.md,
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
            borderRadius: BorderRadius.md,
          },
          text: {fontSize: FontSizes.sm},
        };
      case 'lg':
        return {
          container: {
            paddingVertical: Spacing.base,
            paddingHorizontal: Spacing.xl,
            borderRadius: BorderRadius.xl,
          },
          text: {fontSize: FontSizes.md},
        };
      default:
        return {
          container: {
            paddingVertical: Spacing.md,
            paddingHorizontal: Spacing.lg,
            borderRadius: BorderRadius.lg,
          },
          text: {fontSize: FontSizes.base},
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <Animated.View style={[{transform: [{scale: scaleAnim}]}, variantStyles.shadow]}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[
          styles.container,
          variantStyles.container,
          sizeStyles.container,
          fullWidth && styles.fullWidth,
          style,
        ]}
        {...props}>
        {loading ? (
          <ActivityIndicator
            color={variantStyles.text.color as string}
            size="small"
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
      </TouchableOpacity>
    </Animated.View>
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
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  iconLeft: {
    marginRight: Spacing.sm,
  },
  iconRight: {
    marginLeft: Spacing.sm,
  },
});
