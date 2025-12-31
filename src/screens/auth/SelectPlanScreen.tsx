/**
 * Select Plan Screen
 * Subscription plan selection
 */

import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {Button, Icon} from '../../components/ui';
import {BorderRadius, FontSizes, Spacing, Shadows} from '../../constants/theme';
import type {AuthStackScreenProps} from '../../types/navigation';

// Mock Plans Data
const PLANS = [
  {
    id: 'free',
    name: 'Free Trial',
    price: 0,
    duration: '7 days',
    popular: false,
    features: [
      'Access to 2 subjects',
      'Limited AI doubt solving',
      '5 quizzes per day',
      'Basic progress tracking',
    ],
    emoji: '🆓',
    color: '#22C55E',
  },
  {
    id: 'monthly',
    name: 'Monthly',
    price: 299,
    duration: '/month',
    popular: true,
    features: [
      'All subjects unlocked',
      'Unlimited AI doubt solving',
      'Unlimited quizzes',
      'Detailed analytics',
      'Personalized study plan',
      'Download lessons offline',
    ],
    emoji: '⭐',
    color: '#F97316',
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 1999,
    originalPrice: 3588,
    duration: '/year',
    popular: false,
    features: [
      'Everything in Monthly',
      'Priority support',
      'Parent dashboard',
      'Live doubt sessions',
      'Certificate on completion',
      'Save 44%',
    ],
    emoji: '👑',
    color: '#8B5CF6',
  },
];

export function SelectPlanScreen() {
  const navigation = useNavigation<AuthStackScreenProps<'SelectPlan'>['navigation']>();
  const route = useRoute<AuthStackScreenProps<'SelectPlan'>['route']>();
  const {userId} = route.params;

  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const primary = useThemeColor({}, 'primary');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const primaryBg = useThemeColor({}, 'primaryBackground');
  const success = useThemeColor({}, 'success');

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = () => {
    const plan = PLANS.find(p => p.id === selectedPlan);
    if (!plan) return;

    if (plan.price === 0) {
      // Free plan - skip payment
      navigation.reset({
        index: 0,
        routes: [{name: 'Onboarding', params: {userId}}],
      });
    } else {
      navigation.navigate('Payment', {
        planId: plan.id,
        planName: plan.name,
        price: plan.price,
        userId,
      });
    }
  };

  const getSelectedPlan = () => PLANS.find(p => p.id === selectedPlan);

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: background}]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          <Text style={[styles.title, {color: text}]}>Choose Your Plan 🎯</Text>
          <Text style={[styles.subtitle, {color: textSecondary}]}>
            Select a plan that works best for you
          </Text>
        </Animated.View>

        {/* Plans */}
        <Animated.View
          style={[
            styles.plansContainer,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          {PLANS.map((plan, index) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  {
                    backgroundColor: card,
                    borderColor: isSelected ? plan.color : border,
                    borderWidth: isSelected ? 2 : 1,
                  },
                  Shadows.md,
                ]}
                onPress={() => setSelectedPlan(plan.id)}
                activeOpacity={0.8}>
                {plan.popular && (
                  <View
                    style={[styles.popularBadge, {backgroundColor: plan.color}]}>
                    <Text style={styles.popularText}>MOST POPULAR 🔥</Text>
                  </View>
                )}

                <View style={styles.planHeader}>
                  <View style={styles.planHeaderLeft}>
                    <Text style={styles.planEmoji}>{plan.emoji}</Text>
                    <View>
                      <Text style={[styles.planName, {color: text}]}>
                        {plan.name}
                      </Text>
                      {plan.originalPrice && (
                        <Text
                          style={[styles.originalPrice, {color: textMuted}]}>
                          ₹{plan.originalPrice}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.planPriceContainer}>
                    {plan.price === 0 ? (
                      <Text style={[styles.planPrice, {color: success}]}>
                        FREE
                      </Text>
                    ) : (
                      <>
                        <Text style={[styles.planPrice, {color: plan.color}]}>
                          ₹{plan.price}
                        </Text>
                        <Text style={[styles.planDuration, {color: textMuted}]}>
                          {plan.duration}
                        </Text>
                      </>
                    )}
                  </View>
                </View>

                <View style={styles.featuresContainer}>
                  {plan.features.map((feature, fIndex) => (
                    <View key={fIndex} style={styles.featureRow}>
                      <Icon name="check-circle" size={16} color={success} />
                      <Text style={[styles.featureText, {color: textSecondary}]}>
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>

                {isSelected && (
                  <View
                    style={[styles.selectedCheck, {backgroundColor: plan.color}]}>
                    <Icon name="check" size={16} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        {/* Benefits */}
        <Animated.View
          style={[
            styles.benefitsContainer,
            {backgroundColor: primaryBg, opacity: fadeAnim},
          ]}>
          <Text style={[styles.benefitsTitle, {color: primary}]}>
            Why choose AI Tutor? 🧠
          </Text>
          <View style={styles.benefitsList}>
            <BenefitItem
              icon="book"
              text="Personalized learning path"
              color={primary}
            />
            <BenefitItem
              icon="message-circle"
              text="24/7 AI doubt solving"
              color={primary}
            />
            <BenefitItem
              icon="bar-chart-2"
              text="Track your progress"
              color={primary}
            />
            <BenefitItem
              icon="award"
              text="Gamified experience"
              color={primary}
            />
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Button */}
      <Animated.View style={[styles.bottomContainer, {opacity: fadeAnim}]}>
        <View style={styles.selectedPlanInfo}>
          <Text style={[styles.selectedLabel, {color: textMuted}]}>
            Selected:
          </Text>
          <Text style={[styles.selectedName, {color: text}]}>
            {getSelectedPlan()?.emoji} {getSelectedPlan()?.name}
          </Text>
        </View>
        <Button
          title={
            getSelectedPlan()?.price === 0
              ? 'Start Free Trial 🎉'
              : `Pay ₹${getSelectedPlan()?.price} 💳`
          }
          onPress={handleContinue}
          fullWidth
          size="lg"
        />
      </Animated.View>
    </SafeAreaView>
  );
}

function BenefitItem({
  icon,
  text,
  color,
}: {
  icon: string;
  text: string;
  color: string;
}) {
  return (
    <View style={styles.benefitItem}>
      <Icon name={icon} size={16} color={color} />
      <Text style={[styles.benefitText, {color}]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 140,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.base,
  },
  plansContainer: {
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  planCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderBottomLeftRadius: BorderRadius.md,
  },
  popularText: {
    color: '#FFF',
    fontSize: FontSizes.xs,
    fontWeight: '700',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  planHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  planEmoji: {
    fontSize: 28,
  },
  planName: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  originalPrice: {
    fontSize: FontSizes.sm,
    textDecorationLine: 'line-through',
  },
  planPriceContainer: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
  },
  planDuration: {
    fontSize: FontSizes.sm,
  },
  featuresContainer: {
    gap: Spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  featureText: {
    fontSize: FontSizes.sm,
    flex: 1,
  },
  selectedCheck: {
    position: 'absolute',
    bottom: Spacing.lg,
    right: Spacing.lg,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitsContainer: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  benefitsTitle: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  benefitsList: {
    gap: Spacing.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  benefitText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    backgroundColor: 'rgba(255,251,247,0.95)',
    borderTopWidth: 1,
    borderTopColor: '#FED7AA',
  },
  selectedPlanInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  selectedLabel: {
    fontSize: FontSizes.sm,
  },
  selectedName: {
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
});
