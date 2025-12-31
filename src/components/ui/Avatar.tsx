/**
 * Avatar Component
 * User profile image with fallback
 */

import React from 'react';
import {View, Text, StyleSheet, Image, type ViewStyle} from 'react-native';
import {useThemeColor} from '../../hooks/useThemeColor';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  source?: string | null;
  name?: string;
  size?: AvatarSize;
  style?: ViewStyle;
}

const sizeMap: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

const fontSizeMap: Record<AvatarSize, number> = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 20,
  xl: 28,
};

export function Avatar({source, name, size = 'md', style}: AvatarProps) {
  const primaryLight = useThemeColor({}, 'primaryLight');

  const dimension = sizeMap[size];
  const fontSize = fontSizeMap[size];

  const getInitials = (n: string) => {
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return n.substring(0, 2).toUpperCase();
  };

  if (source) {
    return (
      <Image
        source={{uri: source}}
        style={[
          styles.avatar,
          {
            width: dimension,
            height: dimension,
            borderRadius: dimension / 2,
          },
          style,
        ]}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          backgroundColor: primaryLight,
        },
        style,
      ]}>
      <Text style={[styles.initials, {fontSize, color: '#FFFFFF'}]}>
        {name ? getInitials(name) : '?'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: '#E5E7EB',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '600',
  },
});
