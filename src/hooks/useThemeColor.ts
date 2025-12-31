/**
 * useThemeColor Hook
 * Get color based on current color scheme
 */

import {useColorScheme} from 'react-native';
import {Colors} from '../constants/theme';

type ColorScheme = 'light' | 'dark';
type ThemeColors = typeof Colors.light;
type ColorName = keyof ThemeColors;

export function useThemeColor(
  props: {light?: string; dark?: string},
  colorName: ColorName,
): string {
  const colorScheme = useColorScheme() ?? 'light';
  const colorFromProps = props[colorScheme];

  if (colorFromProps) {
    return colorFromProps;
  }

  return Colors[colorScheme][colorName] as string;
}

export function useThemeColors(): ThemeColors {
  const colorScheme = useColorScheme() ?? 'light';
  return Colors[colorScheme];
}

export function useColorSchemeValue(): ColorScheme {
  return useColorScheme() ?? 'light';
}
