/**
 * Onboarding Screen
 * Final setup before entering the app
 */

import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useRoute} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {useAuth} from '../../context/AuthContext';
import {Button} from '../../components/ui';
import {BorderRadius, FontSizes, Spacing} from '../../constants/theme';
import type {AuthStackScreenProps} from '../../types/navigation';

const ONBOARDING_STEPS = [
  {
    icon: 'book-open',
    emoji: '📚',
    title: 'Learn at Your Pace',
    description: 'Personalized lessons adapted to your learning style and speed.',
    color: '#F97316',
  },
  {
    icon: 'message-circle',
    emoji: '🤖',
    title: 'AI Doubt Solving',
    description: 'Get instant answers to your questions 24/7 with our AI tutor.',
    color: '#3B82F6',
  },
  {
    icon: 'bar-chart-2',
    emoji: '📊',
    title: 'Track Progress',
    description: 'Monitor your improvement with detailed analytics and insights.',
    color: '#22C55E',
  },
  {
    icon: 'trophy',
    emoji: '🏆',
    title: 'Earn Rewards',
    description: 'Complete challenges, earn XP, and climb the leaderboard!',
    color: '#8B5CF6',
  },
];

export function OnboardingScreen() {
  const route = useRoute<AuthStackScreenProps<'Onboarding'>['route']>();
  const {userId} = route.params;
  const {login} = useAuth();
  
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');

  const currentData = ONBOARDING_STEPS[currentStep];

  useEffect(() => {
    // Animate when step changes
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
      ]),
    ]).start();
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    // Login the user - this will automatically switch to Main app
    login({
      phone: userId,
      name: 'Student',
    });
  };

  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: background}]} edges={['top', 'bottom']}>
      {/* Skip Button */}
      {!isLastStep && (
        <View style={styles.skipContainer}>
          <Button
            title="Skip"
            variant="ghost"
            size="sm"
            onPress={handleSkip}
          />
        </View>
      )}

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{scale: scaleAnim}],
          },
        ]}>
        {/* Icon */}
        <View
          style={[
            styles.iconContainer,
            {backgroundColor: `${currentData.color}15`},
          ]}>
          <Text style={styles.emoji}>{currentData.emoji}</Text>
        </View>

        {/* Text */}
        <Text style={[styles.title, {color: text}]}>{currentData.title}</Text>
        <Text style={[styles.description, {color: textSecondary}]}>
          {currentData.description}
        </Text>
      </Animated.View>

      {/* Progress Dots */}
      <View style={styles.dotsContainer}>
        {ONBOARDING_STEPS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor:
                  index === currentStep
                    ? currentData.color
                    : `${currentData.color}30`,
                width: index === currentStep ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      {/* Bottom Buttons */}
      <View style={styles.bottomContainer}>
        <Button
          title={isLastStep ? "Let's Start! 🚀" : 'Next'}
          onPress={handleNext}
          fullWidth
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['2xl'],
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: FontSizes.base,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.lg,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  bottomContainer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
});
