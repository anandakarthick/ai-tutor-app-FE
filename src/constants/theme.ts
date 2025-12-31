/**
 * Theme Constants
 * Design system for the AI Tutor App - Orange Theme
 */

// Vibrant Orange color palette for students
export const Colors = {
  light: {
    // Primary - Vibrant Orange
    primary: '#F97316',
    primaryLight: '#FB923C',
    primaryDark: '#EA580C',
    primaryBackground: '#FFF7ED',

    // Secondary - Deep Blue
    secondary: '#3B82F6',
    secondaryLight: '#60A5FA',
    secondaryDark: '#2563EB',

    // Accent - Teal
    accent: '#14B8A6',
    accentLight: '#2DD4BF',
    accentDark: '#0D9488',

    // Status colors
    success: '#22C55E',
    successLight: '#DCFCE7',
    warning: '#FBBF24',
    warningLight: '#FEF3C7',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    info: '#3B82F6',
    infoLight: '#DBEAFE',

    // Backgrounds
    background: '#FFFBF7',
    backgroundSecondary: '#FFF5EB',
    backgroundTertiary: '#FFEDD5',

    // Surfaces
    card: '#FFFFFF',
    cardElevated: '#FFFFFF',

    // Text
    text: '#1C1917',
    textSecondary: '#57534E',
    textMuted: '#A8A29E',
    textInverse: '#FFFFFF',

    // Borders
    border: '#FED7AA',
    borderLight: '#FFEDD5',

    // Tab bar
    tabIconDefault: '#A8A29E',
    tabIconSelected: '#F97316',

    // Gradients (start, end)
    gradientPrimary: ['#F97316', '#FB923C'],
    gradientSecondary: ['#F97316', '#EF4444'],
    gradientSuccess: ['#22C55E', '#16A34A'],
    gradientWarm: ['#F97316', '#FBBF24'],
    gradientFire: ['#EF4444', '#F97316'],
  },
  dark: {
    // Primary - Vibrant Orange
    primary: '#FB923C',
    primaryLight: '#FDBA74',
    primaryDark: '#F97316',
    primaryBackground: '#431407',

    // Secondary - Deep Blue
    secondary: '#60A5FA',
    secondaryLight: '#93C5FD',
    secondaryDark: '#3B82F6',

    // Accent - Teal
    accent: '#2DD4BF',
    accentLight: '#5EEAD4',
    accentDark: '#14B8A6',

    // Status colors
    success: '#4ADE80',
    successLight: '#14532D',
    warning: '#FCD34D',
    warningLight: '#78350F',
    error: '#F87171',
    errorLight: '#7F1D1D',
    info: '#60A5FA',
    infoLight: '#1E3A8A',

    // Backgrounds
    background: '#1C1917',
    backgroundSecondary: '#292524',
    backgroundTertiary: '#44403C',

    // Surfaces
    card: '#292524',
    cardElevated: '#44403C',

    // Text
    text: '#FAFAF9',
    textSecondary: '#D6D3D1',
    textMuted: '#78716C',
    textInverse: '#1C1917',

    // Borders
    border: '#44403C',
    borderLight: '#57534E',

    // Tab bar
    tabIconDefault: '#78716C',
    tabIconSelected: '#FB923C',

    // Gradients (start, end)
    gradientPrimary: ['#FB923C', '#FDBA74'],
    gradientSecondary: ['#FB923C', '#F87171'],
    gradientSuccess: ['#4ADE80', '#22C55E'],
    gradientWarm: ['#FB923C', '#FCD34D'],
    gradientFire: ['#F87171', '#FB923C'],
  },
};

// Subject-specific colors - Fun and distinguishable
export const SubjectColors = {
  light: {
    mathematics: {
      primary: '#F97316',
      background: '#FFF7ED',
      icon: '#EA580C',
    },
    math: {
      primary: '#F97316',
      background: '#FFF7ED',
      icon: '#EA580C',
    },
    science: {
      primary: '#22C55E',
      background: '#F0FDF4',
      icon: '#16A34A',
    },
    physics: {
      primary: '#3B82F6',
      background: '#EFF6FF',
      icon: '#2563EB',
    },
    chemistry: {
      primary: '#14B8A6',
      background: '#F0FDFA',
      icon: '#0D9488',
    },
    biology: {
      primary: '#84CC16',
      background: '#F7FEE7',
      icon: '#65A30D',
    },
    english: {
      primary: '#8B5CF6',
      background: '#F5F3FF',
      icon: '#7C3AED',
    },
    hindi: {
      primary: '#EC4899',
      background: '#FDF2F8',
      icon: '#DB2777',
    },
    history: {
      primary: '#D97706',
      background: '#FFFBEB',
      icon: '#B45309',
    },
    geography: {
      primary: '#06B6D4',
      background: '#ECFEFF',
      icon: '#0891B2',
    },
    socialscience: {
      primary: '#6366F1',
      background: '#EEF2FF',
      icon: '#4F46E5',
    },
    'social science': {
      primary: '#6366F1',
      background: '#EEF2FF',
      icon: '#4F46E5',
    },
  },
  dark: {
    mathematics: {
      primary: '#FB923C',
      background: '#431407',
      icon: '#F97316',
    },
    math: {
      primary: '#FB923C',
      background: '#431407',
      icon: '#F97316',
    },
    science: {
      primary: '#4ADE80',
      background: '#14532D',
      icon: '#22C55E',
    },
    physics: {
      primary: '#60A5FA',
      background: '#1E3A8A',
      icon: '#3B82F6',
    },
    chemistry: {
      primary: '#2DD4BF',
      background: '#134E4A',
      icon: '#14B8A6',
    },
    biology: {
      primary: '#A3E635',
      background: '#365314',
      icon: '#84CC16',
    },
    english: {
      primary: '#A78BFA',
      background: '#4C1D95',
      icon: '#8B5CF6',
    },
    hindi: {
      primary: '#F472B6',
      background: '#500724',
      icon: '#EC4899',
    },
    history: {
      primary: '#FBBF24',
      background: '#78350F',
      icon: '#D97706',
    },
    geography: {
      primary: '#22D3EE',
      background: '#164E63',
      icon: '#06B6D4',
    },
    socialscience: {
      primary: '#818CF8',
      background: '#312E81',
      icon: '#6366F1',
    },
    'social science': {
      primary: '#818CF8',
      background: '#312E81',
      icon: '#6366F1',
    },
  },
};

// Helper function to get subject color
export function getSubjectColor(
  subject: string,
  colorScheme: 'light' | 'dark' = 'light',
): string {
  const key = subject.toLowerCase().replace(/\s+/g, '') as keyof typeof SubjectColors.light;
  return SubjectColors[colorScheme][key]?.primary || Colors[colorScheme].primary;
}

// Helper function to get full subject theme
export function getSubjectTheme(
  subject: string,
  colorScheme: 'light' | 'dark' = 'light',
) {
  const key = subject.toLowerCase().replace(/\s+/g, '') as keyof typeof SubjectColors.light;
  return (
    SubjectColors[colorScheme][key] || {
      primary: Colors[colorScheme].primary,
      background: Colors[colorScheme].primaryBackground,
      icon: Colors[colorScheme].primaryDark,
    }
  );
}

// XP & Level colors
export const LevelColors = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
  diamond: '#B9F2FF',
};

// Achievement badge colors
export const BadgeColors = {
  streak: '#F97316',
  quiz: '#3B82F6',
  mastery: '#22C55E',
  speed: '#EF4444',
  perfect: '#FFD700',
  helper: '#EC4899',
};

// Typography
export const Fonts = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
};

export const FontSizes = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
};

// Spacing scale
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

// Border radius
export const BorderRadius = {
  none: 0,
  xs: 4,
  sm: 6,
  base: 8,
  md: 10,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};

// Shadows - Orange tinted
export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#F97316',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#F97316',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#F97316',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#F97316',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#F97316',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  glow: {
    shadowColor: '#F97316',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  coloredGlow: (color: string) => ({
    shadowColor: color,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  }),
};

// Animation
export const Animation = {
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
    verySlow: 800,
  },
  spring: {
    gentle: {
      damping: 20,
      stiffness: 100,
    },
    bouncy: {
      damping: 10,
      stiffness: 150,
    },
    stiff: {
      damping: 30,
      stiffness: 300,
    },
  },
};

// Icon sizes
export const IconSizes = {
  xs: 14,
  sm: 18,
  md: 22,
  base: 24,
  lg: 28,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
};
