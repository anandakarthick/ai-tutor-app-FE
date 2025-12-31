/**
 * Avatar Component
 * User profile picture or initials - Orange Theme
 */

import React from 'react';
import {View, Text, Image, StyleSheet, type ViewStyle} from 'react-native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {BorderRadius, FontSizes} from '../../constants/theme';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  source?: string | null;
  name?: string;
  size?: AvatarSize;
  style?: ViewStyle;
}

const sizeMap: Record<AvatarSize, number> = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 72,
};

const fontSizeMap: Record<AvatarSize, number> = {
  sm: FontSizes.xs,
  md: FontSizes.sm,
  lg: FontSizes.base,
  xl: FontSizes.xl,
};

export function Avatar({source, name, size = 'md', style}: AvatarProps) {
  const primary = useThemeColor({}, 'primary');
  const primaryLight = useThemeColor({}, 'primaryLight');

  const dimension = sizeMap[size];
  const fontSize = fontSizeMap[size];

  const getInitials = (fullName: string): string => {
    const names = fullName.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  // Generate a warm gradient color based on name
  const getGradientColor = (fullName?: string): string => {
    if (!fullName) return primary;
    
    const colors = [
      '#F97316', // Orange
      '#EA580C', // Dark Orange
      '#FB923C', // Light Orange
      '#EF4444', // Red
      '#F59E0B', // Amber
      '#D97706', // Yellow
    ];
    
    let hash = 0;
    for (let i = 0; i < fullName.length; i++) {
      hash = fullName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const bgColor = getGradientColor(name);

  if (source) {
    return (
      <Image
        source={{uri: source}}
        style={[
          styles.image,
          {
            width: dimension,
            height: dimension,
            borderRadius: dimension / 2,
          },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          backgroundColor: bgColor,
        },
        style,
      ]}>
      <Text style={[styles.initials, {fontSize}]}>
        {name ? getInitials(name) : '?'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    resizeMode: 'cover',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
