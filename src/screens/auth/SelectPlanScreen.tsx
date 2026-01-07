/**
 * Select Plan Screen
 * Subscription plan selection - API Integrated
 */

import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {useSettings} from '../../context';
import {subscriptionsApi} from '../../services/api';
import {Button, Icon} from '../../components/ui';
import {BorderRadius, FontSizes, Spacing, Shadows} from '../../constants/theme';
import type {AuthStackScreenProps} from '../../types/navigation';
import type {SubscriptionPlan} from '../../types/api';

// Plan emoji and color mapping
const PLAN_STYLES: Record<string, {emoji: string; color: string}> = {
  free: {emoji: '🆓', color: '#22C55E'},
  trial: {emoji: '🎁', color: '#22C55E'},
  monthly: {emoji: '⭐', color: '#F97316'},
  quarterly: {emoji: '💎', color: '#3B82F6'},
  yearly: {emoji: '👑', color: '#8B5CF6'},
  annual: {emoji: '👑', color: '#8B5CF6'},
};

export function SelectPlanScreen() {
  const navigation = useNavigation<AuthStackScreenProps<'SelectPlan'>['navigation']>();
  const route = useRoute<AuthStackScreenProps<'SelectPlan'>['route']>();
  const {userId} = route.params;
  const {settings} = useSettings();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
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

  // Load plans from API
  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);
      const response = await subscriptionsApi.getPlans();
      if (response.success && response.data) {
        // Sort plans by price
        const sortedPlans = response.data.sort((a, b) => a.price - b.price);
        setPlans(sortedPlans);
        
        // Select recommended/popular plan by default, or first plan
        const popularPlan = sortedPlans.find(p => p.isPopular);
        const defaultPlan = popularPlan || sortedPlans.find(p => p.price > 0) || sortedPlans[0];
        if (defaultPlan) {
          setSelectedPlan(defaultPlan.id);
        }
      }
    } catch (err) {
      console.log('Load plans error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPlans();
    setRefreshing(false);
  };

  const handleContinue = () => {
    const plan = plans.find(p => p.id === selectedPlan);
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
        planName: plan.planName,
        price: plan.price,
        userId,
      });
    }
  };

  const getSelectedPlan = () => plans.find(p => p.id === selectedPlan);
  
  const getPlanStyle = (plan: SubscriptionPlan) => {
    const key = plan.planName.toLowerCase();
    return PLAN_STYLES[key] || PLAN_STYLES.monthly;
  };

  const formatDuration = (plan: SubscriptionPlan) => {
    if (plan.durationDays <= 7) return `${plan.durationDays} days`;
    if (plan.durationDays <= 31) return '/month';
    if (plan.durationDays <= 100) return '/quarter';
    return '/year';
  };

  const parseFeatures = (plan: SubscriptionPlan): string[] => {
    if (plan.features) {
      if (Array.isArray(plan.features)) return plan.features;
      if (typeof plan.features === 'string') {
        try {
          const parsed = JSON.parse(plan.features);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return plan.features.split(',').map(f => f.trim());
        }
      }
    }
    // Default features based on plan type
    if (plan.price === 0) {
      return ['Limited access', '5 doubts per day', 'Basic quizzes'];
    }
    return ['All subjects', 'Unlimited AI doubts', 'Full quiz access', 'Progress tracking'];
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: background}]} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primary} />
          <Text style={[styles.loadingText, {color: textSecondary}]}>Loading plans...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: background}]} edges={['top', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[primary]} />
        }>
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
          {plans.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={[styles.emptyText, {color: textSecondary}]}>
                No plans available at the moment
              </Text>
            </View>
          ) : (
            plans.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              const style = getPlanStyle(plan);
              const features = parseFeatures(plan);
              
              return (
                <TouchableOpacity
                  key={plan.id}
                  style={[
                    styles.planCard,
                    {
                      backgroundColor: card,
                      borderColor: isSelected ? style.color : border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                    Shadows.md,
                  ]}
                  onPress={() => setSelectedPlan(plan.id)}
                  activeOpacity={0.8}>
                  {plan.isPopular && (
                    <View
                      style={[styles.popularBadge, {backgroundColor: style.color}]}>
                      <Text style={styles.popularText}>MOST POPULAR 🔥</Text>
                    </View>
                  )}

                  <View style={styles.planHeader}>
                    <View style={styles.planHeaderLeft}>
                      <Text style={styles.planEmoji}>{style.emoji}</Text>
                      <View>
                        <Text style={[styles.planName, {color: text}]}>
                          {plan.planName}
                        </Text>
                        {plan.originalPrice && plan.originalPrice > plan.price && (
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
                          <Text style={[styles.planPrice, {color: style.color}]}>
                            ₹{plan.price}
                          </Text>
                          <Text style={[styles.planDuration, {color: textMuted}]}>
                            {formatDuration(plan)}
                          </Text>
                        </>
                      )}
                    </View>
                  </View>

                  <View style={styles.featuresContainer}>
                    {features.map((feature, fIndex) => (
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
                      style={[styles.selectedCheck, {backgroundColor: style.color}]}>
                      <Icon name="check" size={16} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </Animated.View>

        {/* Benefits */}
        <Animated.View
          style={[
            styles.benefitsContainer,
            {backgroundColor: primaryBg, opacity: fadeAnim},
          ]}>
          <Text style={[styles.benefitsTitle, {color: primary}]}>
            Why choose {settings.siteName}? 🧠
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

        {/* Bottom Button */}
        {selectedPlan && (
          <Animated.View style={[styles.bottomContainer, {opacity: fadeAnim}]}>
            <View style={[styles.selectedPlanInfo, {backgroundColor: primaryBg, borderRadius: BorderRadius.lg}]}>
              <Text style={[styles.selectedLabel, {color: textMuted}]}>
                Selected:
              </Text>
              <Text style={[styles.selectedName, {color: text}]}>
                {getPlanStyle(getSelectedPlan()!).emoji} {getSelectedPlan()?.planName}
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
        )}
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSizes.sm,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: FontSizes.base,
    textAlign: 'center',
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
    marginBottom: Spacing.xl,
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
    marginTop: Spacing.md,
  },
  selectedPlanInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  selectedLabel: {
    fontSize: FontSizes.sm,
  },
  selectedName: {
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
});
