/**
 * AI Tutor App Theme Configuration
 * Modern, friendly design system for K-12 students
 */

import {Platform} from 'react-native';

// Primary brand colors
export const Colors = {
  light: {
    // Core
    text: '#1A1D26',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    background: '#FFFFFF',
    backgroundSecondary: '#F8FAFC',
    backgroundTertiary: '#F1F5F9',

    // Brand
    primary: '#6366F1',
    primaryLight: '#818CF8',
    primaryDark: '#4F46E5',
    primaryBackground: '#EEF2FF',

    // Accent
    accent: '#F59E0B',
    accentLight: '#FCD34D',
    accentBackground: '#FFFBEB',

    // Status
    success: '#10B981',
    successLight: '#34D399',
    successBackground: '#ECFDF5',
    warning: '#F59E0B',
    warningBackground: '#FFFBEB',
    error: '#EF4444',
    errorLight: '#F87171',
    errorBackground: '#FEF2F2',
    info: '#3B82F6',
    infoBackground: '#EFF6FF',

    // UI Elements
    tint: '#6366F1',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    card: '#FFFFFF',
    cardHover: '#F8FAFC',
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#6366F1',

    // Shadows
    shadowColor: '#000000',

    // Subject Colors
    subjectMath: '#EC4899',
    subjectScience: '#10B981',
    subjectEnglish: '#3B82F6',
    subjectHistory: '#F59E0B',
    subjectGeography: '#8B5CF6',
    subjectPhysics: '#06B6D4',
    subjectChemistry: '#EF4444',
    subjectBiology: '#22C55E',
  },
  dark: {
    // Core
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
    background: '#0F172A',
    backgroundSecondary: '#1E293B',
    backgroundTertiary: '#334155',

    // Brand
    primary: '#818CF8',
    primaryLight: '#A5B4FC',
    primaryDark: '#6366F1',
    primaryBackground: '#1E1B4B',

    // Accent
    accent: '#FBBF24',
    accentLight: '#FDE68A',
    accentBackground: '#422006',

    // Status
    success: '#34D399',
    successLight: '#6EE7B7',
    successBackground: '#064E3B',
    warning: '#FBBF24',
    warningBackground: '#422006',
    error: '#F87171',
    errorLight: '#FCA5A5',
    errorBackground: '#450A0A',
    info: '#60A5FA',
    infoBackground: '#1E3A5F',

    // UI Elements
    tint: '#818CF8',
    border: '#334155',
    borderLight: '#475569',
    card: '#1E293B',
    cardHover: '#334155',
    icon: '#9CA3AF',
    tabIconDefault: '#6B7280',
    tabIconSelected: '#818CF8',

    // Shadows
    shadowColor: '#000000',

    // Subject Colors
    subjectMath: '#F472B6',
    subjectScience: '#34D399',
    subjectEnglish: '#60A5FA',
    subjectHistory: '#FBBF24',
    subjectGeography: '#A78BFA',
    subjectPhysics: '#22D3EE',
    subjectChemistry: '#F87171',
    subjectBiology: '#4ADE80',
  },
};

// Typography
export const Fonts = {
  sans: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  serif: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'serif',
  }),
  mono: Platform.select({
    ios: 'Courier',
    android: 'monospace',
    default: 'monospace',
  }),
};

// Font Sizes
export const FontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
};

// Spacing
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

// Border Radius
export const BorderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

// Shadows
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
};

// Animation Durations
export const Animations = {
  fast: 150,
  normal: 250,
  slow: 350,
  spring: {
    damping: 15,
    stiffness: 150,
  },
};

// Subject color mapping
export const getSubjectColor = (
  subject: string,
  scheme: 'light' | 'dark' = 'light',
) => {
  const colors = Colors[scheme];
  const subjectMap: Record<string, string> = {
    mathematics: colors.subjectMath,
    math: colors.subjectMath,
    science: colors.subjectScience,
    english: colors.subjectEnglish,
    history: colors.subjectHistory,
    geography: colors.subjectGeography,
    physics: colors.subjectPhysics,
    chemistry: colors.subjectChemistry,
    biology: colors.subjectBiology,
    hindi: colors.subjectGeography,
    'social science': colors.subjectHistory,
  };
  return subjectMap[subject.toLowerCase()] || colors.primary;
};
