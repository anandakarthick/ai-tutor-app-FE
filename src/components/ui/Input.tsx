/**
 * Input Component
 * Text input with label, error states, and icons
 */

import React, {useState} from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import {useThemeColor} from '../../hooks/useThemeColor';
import {BorderRadius, FontSizes, Spacing} from '../../constants/theme';
import {Icon} from './Icon';

const AnimatedView = Animated.createAnimatedComponent(View);

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useSharedValue(0);

  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const background = useThemeColor({}, 'backgroundSecondary');
  const border = useThemeColor({}, 'border');
  const primary = useThemeColor({}, 'primary');
  const errorColor = useThemeColor({}, 'error');

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      borderColor: error
        ? errorColor
        : interpolateColor(focusAnim.value, [0, 1], [border, primary]),
      borderWidth: withTiming(focusAnim.value === 1 ? 2 : 1.5, {duration: 150}),
    };
  });

  const handleFocus = (e: any) => {
    setIsFocused(true);
    focusAnim.value = withTiming(1, {duration: 200});
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    focusAnim.value = withTiming(0, {duration: 200});
    onBlur?.(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, {color: text}]}>{label}</Text>}
      <AnimatedView
        style={[
          styles.inputContainer,
          {backgroundColor: background},
          animatedContainerStyle,
        ]}>
        {leftIcon && (
          <View style={styles.leftIcon}>
            <Icon
              name={leftIcon}
              size={20}
              color={isFocused ? primary : textMuted}
            />
          </View>
        )}
        <TextInput
          style={[
            styles.input,
            {color: text},
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            style,
          ]}
          placeholderTextColor={textMuted}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}>
            <Icon name={rightIcon} size={20} color={textMuted} />
          </TouchableOpacity>
        )}
      </AnimatedView>
      {(error || hint) && (
        <Text
          style={[
            styles.helperText,
            {color: error ? errorColor : textSecondary},
          ]}>
          {error || hint}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.base,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontSize: FontSizes.base,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
  },
  inputWithLeftIcon: {
    paddingLeft: Spacing.xs,
  },
  inputWithRightIcon: {
    paddingRight: Spacing.xs,
  },
  leftIcon: {
    paddingLeft: Spacing.md,
  },
  rightIcon: {
    paddingRight: Spacing.md,
    padding: Spacing.sm,
  },
  helperText: {
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});
