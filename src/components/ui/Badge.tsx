/**
 * Badge Component
 * Status indicator labels
 */

import React from 'react';
import {View, Text, StyleSheet, type ViewStyle} from 'react-native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {BorderRadius, FontSizes, Spacing} from '../../constants/theme';
import {Icon} from './Icon';

type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'secondary'
  | 'level';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: string;
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
  const primaryBg = useThemeColor({}, 'primaryBackground');
  const secondary = useThemeColor({}, 'secondary');
  const success = useThemeColor({}, 'success');
  const successLight = useThemeColor({}, 'successLight');
  const warning = useThemeColor({}, 'warning');
  const error = useThemeColor({}, 'error');
  const errorLight = useThemeColor({}, 'errorLight');
  const info = useThemeColor({}, 'info');
  const infoLight = useThemeColor({}, 'infoLight');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const backgroundSecondary = useThemeColor({}, 'backgroundSecondary');

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: primaryBg,
          textColor: primary,
        };
      case 'secondary':
        return {
          backgroundColor: `${secondary}20`,
          textColor: secondary,
        };
      case 'success':
        return {
          backgroundColor: successLight,
          textColor: success,
        };
      case 'warning':
        return {
          backgroundColor: '#FEF3C7',
          textColor: '#B45309',
        };
      case 'level':
        return {
          backgroundColor: '#FEF3C7',
          textColor: '#B45309',
          borderColor: '#FCD34D',
        };
      case 'error':
        return {
          backgroundColor: errorLight,
          textColor: error,
        };
      case 'info':
        return {
          backgroundColor: infoLight,
          textColor: info,
        };
      default:
        return {
          backgroundColor: backgroundSecondary,
          textColor: textSecondary,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const isSmall = size === 'sm';
  const hasBorder = variant === 'level';

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: variantStyles.backgroundColor},
        hasBorder && {borderWidth: 1.5, borderColor: '#FCD34D'},
        isSmall ? styles.containerSm : styles.containerMd,
        style,
      ]}>
      {icon && (
        <Icon
          name={icon}
          size={isSmall ? 10 : 12}
          color={variantStyles.textColor}
        />
      )}
      <Text
        style={[
          styles.label,
          {color: variantStyles.textColor},
          isSmall ? styles.labelSm : styles.labelMd,
        ]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
  },
  containerSm: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.base,
  },
  containerMd: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  label: {
    fontWeight: '700',
  },
  labelSm: {
    fontSize: FontSizes.xs,
  },
  labelMd: {
    fontSize: FontSizes.sm,
  },
});
