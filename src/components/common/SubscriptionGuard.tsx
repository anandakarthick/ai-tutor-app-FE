/**
 * Subscription Guard Component
 * Redirects to subscription page if user doesn't have active subscription
 */

import React, {useEffect} from 'react';
import {View, Text, StyleSheet, ActivityIndicator, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSubscription} from '../../context';
import {useThemeColor} from '../../hooks/useThemeColor';
import {Icon} from '../ui';
import {BorderRadius, FontSizes, Spacing} from '../../constants/theme';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export function SubscriptionGuard({children}: SubscriptionGuardProps) {
  const navigation = useNavigation<any>();
  const {hasActiveSubscription, isLoading} = useSubscription();
  
  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');
  const warning = useThemeColor({}, 'warning');
  const card = useThemeColor({}, 'card');

  // Show loading while checking subscription
  if (isLoading) {
    return (
      <View style={[styles.container, {backgroundColor: background}]}>
        <ActivityIndicator size="large" color={primary} />
        <Text style={[styles.loadingText, {color: textSecondary}]}>
          Checking subscription...
        </Text>
      </View>
    );
  }

  // If no subscription, show upgrade message
  if (!hasActiveSubscription) {
    return (
      <View style={[styles.container, {backgroundColor: background}]}>
        <View style={[styles.content, {backgroundColor: card}]}>
          {/* Icon */}
          <View style={[styles.iconContainer, {backgroundColor: `${warning}15`}]}>
            <Icon name="crown" size={48} color={warning} />
          </View>

          {/* Title */}
          <Text style={[styles.title, {color: text}]}>
            Subscription Required
          </Text>

          {/* Message */}
          <Text style={[styles.message, {color: textSecondary}]}>
            Upgrade to Premium to access all learning features, quizzes, and personalized study plans.
          </Text>

          {/* Features */}
          <View style={styles.features}>
            <View style={styles.featureItem}>
              <Icon name="check-circle" size={18} color={primary} />
              <Text style={[styles.featureText, {color: textSecondary}]}>
                Unlimited AI doubt solving
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="check-circle" size={18} color={primary} />
              <Text style={[styles.featureText, {color: textSecondary}]}>
                All subjects & chapters
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="check-circle" size={18} color={primary} />
              <Text style={[styles.featureText, {color: textSecondary}]}>
                Practice quizzes & tests
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="check-circle" size={18} color={primary} />
              <Text style={[styles.featureText, {color: textSecondary}]}>
                Personalized study plans
              </Text>
            </View>
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            style={[styles.ctaButton, {backgroundColor: primary}]}
            onPress={() => navigation.navigate('Subscription')}>
            <Icon name="zap" size={20} color="#FFF" />
            <Text style={styles.ctaButtonText}>Upgrade Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // User has subscription - render children
  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSizes.sm,
  },
  content: {
    width: '100%',
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: FontSizes.base,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  features: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  featureText: {
    fontSize: FontSizes.sm,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    width: '100%',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  ctaButtonText: {
    color: '#FFF',
    fontSize: FontSizes.base,
    fontWeight: '700',
  },
});
