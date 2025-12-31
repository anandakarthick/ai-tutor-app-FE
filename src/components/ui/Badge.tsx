/**
 * Badge Component
 * Status indicators and labels
 */

import React from 'react';
import {View, Text, StyleSheet, type ViewStyle} from 'react-native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {BorderRadius, FontSizes, Spacing} from '../../constants/theme';

type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function Badge({
  label,
  variant = 'default',
  size = 'md',
  icon,
  style,
}: BadgeProps) {
  const primary = useThemeColor({}, 'primary');
  const primaryBackground = useThemeColor({}, 'primaryBackground');
  const success = useThemeColor({}, 'success');
  const successBackground = useThemeColor({}, 'successBackground');
  const warning = useThemeColor({}, 'warning');
  const warningBackground = useThemeColor({}, 'warningBackground');
  const error = useThemeColor({}, 'error');
  const errorBackground = useThemeColor({}, 'errorBackground');
  const info = useThemeColor({}, 'info');
  const infoBackground = useThemeColor({}, 'infoBackground');
  const text = useThemeColor({}, 'text');
  const backgroundTertiary = useThemeColor({}, 'backgroundTertiary');

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {backgroundColor: primaryBackground, color: primary};
      case 'success':
        return {backgroundColor: successBackground, color: success};
      case 'warning':
        return {backgroundColor: warningBackground, color: warning};
      case 'error':
        return {backgroundColor: errorBackground, color: error};
      case 'info':
        return {backgroundColor: infoBackground, color: info};
      default:
        return {backgroundColor: backgroundTertiary, color: text};
    }
  };

  const variantStyles = getVariantStyles();
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variantStyles.backgroundColor,
          paddingVertical: isSmall ? 2 : Spacing.xs,
          paddingHorizontal: isSmall ? Spacing.sm : Spacing.md,
        },
        style,
      ]}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text
        style={[
          styles.label,
          {
            color: variantStyles.color,
            fontSize: isSmall ? FontSizes.xs : FontSizes.sm,
          },
        ]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: Spacing.xs,
  },
  label: {
    fontWeight: '600',
  },
});
