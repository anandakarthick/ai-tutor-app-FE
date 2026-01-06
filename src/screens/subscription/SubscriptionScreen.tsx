/**
 * Subscription Screen - Mobile
 * View plans, manage subscription, and make payments with Razorpay
 */

import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Linking,
  NativeModules,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {subscriptionsApi, paymentsApi} from '../../services/api';
import {Icon} from '../../components/ui';
import {BorderRadius, FontSizes, Spacing, Shadows} from '../../constants/theme';
import type {SubscriptionPlan, UserSubscription, Payment} from '../../types/api';

// Razorpay (will need to be installed)
let RazorpayCheckout: any = null;
try {
  RazorpayCheckout = require('react-native-razorpay').default;
} catch (e) {
  console.log('Razorpay not installed');
}

export function SubscriptionScreen() {
  const navigation = useNavigation<any>();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [activeSubscription, setActiveSubscription] = useState<UserSubscription | null>(null);
  const [transactions, setTransactions] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'plans' | 'transactions'>('plans');

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const primary = useThemeColor({}, 'primary');
  const success = useThemeColor({}, 'success');
  const warning = useThemeColor({}, 'warning');
  const error = useThemeColor({}, 'error');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansRes, activeRes, paymentsRes] = await Promise.all([
        subscriptionsApi.getPlans(),
        subscriptionsApi.getActive(),
        paymentsApi.getAll(),
      ]);

      if (plansRes.success) setPlans(plansRes.data || []);
      if (activeRes.success) setActiveSubscription(activeRes.data);
      if (paymentsRes.success) setTransactions(paymentsRes.data || []);
    } catch (err) {
      console.error('Failed to load subscription data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!RazorpayCheckout) {
      Alert.alert(
        'Payment Not Available',
        'Payment system is not configured. Please contact support.',
        [{text: 'OK'}],
      );
      return;
    }

    setProcessingPlanId(plan.id);

    try {
      // Create order
      const orderRes = await paymentsApi.createOrder({
        amount: plan.price,
        planId: plan.id,
        description: `${plan.displayName} Subscription`,
      });

      if (!orderRes.success) {
        throw new Error(orderRes.message || 'Failed to create order');
      }

      const {orderId, keyId, amount} = orderRes.data;

      // Open Razorpay checkout
      const options = {
        description: `${plan.displayName} Subscription`,
        image: 'https://your-logo-url.com/logo.png', // Replace with your logo
        currency: 'INR',
        key: keyId,
        amount: amount,
        name: 'AI Tutor',
        order_id: orderId,
        prefill: {
          email: '',
          contact: '',
          name: '',
        },
        theme: {color: '#F97316'},
      };

      const data = await RazorpayCheckout.open(options);

      // Verify payment
      const verifyRes = await paymentsApi.verify({
        razorpay_order_id: data.razorpay_order_id,
        razorpay_payment_id: data.razorpay_payment_id,
        razorpay_signature: data.razorpay_signature,
      });

      if (verifyRes.success) {
        Alert.alert(
          'Payment Successful! 🎉',
          'Your subscription is now active. Enjoy learning!',
          [{text: 'OK', onPress: loadData}],
        );
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      if (err.code !== 'CANCELLED') {
        Alert.alert(
          'Payment Failed',
          err.message || 'Something went wrong. Please try again.',
          [{text: 'OK'}],
        );
      }
    } finally {
      setProcessingPlanId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDaysRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'success':
        return success;
      case 'pending':
        return warning;
      case 'expired':
      case 'cancelled':
      case 'failed':
        return error;
      default:
        return textMuted;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: background}]} edges={['top']}>
        <View style={[styles.header, {borderBottomColor: border}]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="chevron-left" size={24} color={text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, {color: text}]}>Subscription</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primary} />
          <Text style={[styles.loadingText, {color: textSecondary}]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: background}]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, {borderBottomColor: border}]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: text}]}>Subscription</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, {backgroundColor: card}]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'plans' && {backgroundColor: primary}]}
          onPress={() => setActiveTab('plans')}>
          <Icon
            name="crown"
            size={18}
            color={activeTab === 'plans' ? '#FFF' : textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              {color: activeTab === 'plans' ? '#FFF' : textSecondary},
            ]}>
            Plans
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'transactions' && {backgroundColor: primary}]}
          onPress={() => setActiveTab('transactions')}>
          <Icon
            name="receipt"
            size={18}
            color={activeTab === 'transactions' ? '#FFF' : textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              {color: activeTab === 'transactions' ? '#FFF' : textSecondary},
            ]}>
            Transactions
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[primary]} />
        }>
        {activeTab === 'plans' ? (
          <>
            {/* Active Subscription Card */}
            {activeSubscription && (
              <View style={[styles.activeCard, {backgroundColor: card, borderColor: success}]}>
                <View style={[styles.activeBadge, {backgroundColor: success}]}>
                  <Icon name="crown" size={14} color="#FFF" />
                  <Text style={styles.activeBadgeText}>Current Plan</Text>
                </View>

                <Text style={[styles.activePlanName, {color: text}]}>
                  {activeSubscription.plan?.displayName || 'Premium Plan'}
                </Text>
                <Text style={[styles.activePlanPrice, {color: primary}]}>
                  {formatCurrency(activeSubscription.finalAmount)}
                  <Text style={[styles.activePlanDuration, {color: textMuted}]}>
                    /{activeSubscription.plan?.durationMonths || 1} month(s)
                  </Text>
                </Text>

                <View style={styles.activeDates}>
                  <View style={styles.dateItem}>
                    <Icon name="calendar" size={16} color={textMuted} />
                    <Text style={[styles.dateLabel, {color: textMuted}]}>Started</Text>
                    <Text style={[styles.dateValue, {color: text}]}>
                      {formatDate(activeSubscription.startedAt)}
                    </Text>
                  </View>
                  <View style={styles.dateItem}>
                    <Icon name="clock" size={16} color={textMuted} />
                    <Text style={[styles.dateLabel, {color: textMuted}]}>Expires</Text>
                    <Text style={[styles.dateValue, {color: text}]}>
                      {formatDate(activeSubscription.expiresAt)}
                    </Text>
                  </View>
                  <View style={styles.dateItem}>
                    <Icon name="alert-circle" size={16} color={textMuted} />
                    <Text style={[styles.dateLabel, {color: textMuted}]}>Days Left</Text>
                    <Text
                      style={[
                        styles.dateValue,
                        {
                          color:
                            getDaysRemaining(activeSubscription.expiresAt) <= 7
                              ? error
                              : text,
                        },
                      ]}>
                      {getDaysRemaining(activeSubscription.expiresAt)} days
                    </Text>
                  </View>
                </View>

                <View style={[styles.statusBadge, {backgroundColor: `${success}20`}]}>
                  <Icon name="check-circle" size={14} color={success} />
                  <Text style={[styles.statusText, {color: success}]}>
                    {activeSubscription.status}
                  </Text>
                </View>
              </View>
            )}

            {/* Plans Section */}
            <Text style={[styles.sectionTitle, {color: text}]}>
              {activeSubscription ? 'Upgrade Your Plan' : 'Choose Your Plan'}
            </Text>

            {plans.map((plan) => (
              <View
                key={plan.id}
                style={[
                  styles.planCard,
                  {backgroundColor: card, borderColor: plan.isPopular ? primary : border},
                  plan.isPopular && styles.popularCard,
                ]}>
                {plan.isPopular && (
                  <View style={[styles.popularBadge, {backgroundColor: primary}]}>
                    <Icon name="star" size={12} color="#FFF" />
                    <Text style={styles.popularBadgeText}>Best Value</Text>
                  </View>
                )}

                <Text style={[styles.planName, {color: text}]}>{plan.displayName}</Text>
                <Text style={[styles.planDescription, {color: textMuted}]}>
                  {plan.description}
                </Text>

                <View style={styles.planPricing}>
                  {plan.originalPrice && plan.originalPrice > plan.price && (
                    <Text style={[styles.originalPrice, {color: textMuted}]}>
                      {formatCurrency(plan.originalPrice)}
                    </Text>
                  )}
                  <Text style={[styles.planPrice, {color: text}]}>
                    {formatCurrency(plan.price)}
                  </Text>
                  <Text style={[styles.planDuration, {color: textMuted}]}>
                    /{plan.durationMonths === 1 ? 'month' : `${plan.durationMonths} months`}
                  </Text>
                </View>

                {plan.durationMonths === 12 && (
                  <View style={[styles.savingsBadge, {backgroundColor: `${warning}20`}]}>
                    <Icon name="gift" size={14} color={warning} />
                    <Text style={[styles.savingsText, {color: warning}]}>Save ₹588/year</Text>
                  </View>
                )}

                <View style={styles.featuresList}>
                  {plan.features?.slice(0, 4).map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <Icon name="check" size={14} color={success} />
                      <Text style={[styles.featureText, {color: textSecondary}]}>
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={[
                    styles.subscribeButton,
                    {backgroundColor: plan.isPopular ? primary : `${primary}15`},
                  ]}
                  onPress={() => handleSubscribe(plan)}
                  disabled={processingPlanId !== null}>
                  {processingPlanId === plan.id ? (
                    <ActivityIndicator size="small" color={plan.isPopular ? '#FFF' : primary} />
                  ) : (
                    <>
                      <Icon
                        name="zap"
                        size={18}
                        color={plan.isPopular ? '#FFF' : primary}
                      />
                      <Text
                        style={[
                          styles.subscribeButtonText,
                          {color: plan.isPopular ? '#FFF' : primary},
                        ]}>
                        Subscribe Now
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ))}

            {/* Trust Badges */}
            <View style={styles.trustBadges}>
              <View style={styles.trustBadge}>
                <Icon name="shield" size={20} color={success} />
                <Text style={[styles.trustText, {color: textMuted}]}>Secure Payments</Text>
              </View>
              <View style={styles.trustBadge}>
                <Icon name="refresh-cw" size={20} color={success} />
                <Text style={[styles.trustText, {color: textMuted}]}>Cancel Anytime</Text>
              </View>
            </View>
          </>
        ) : (
          /* Transactions Tab */
          <>
            {transactions.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="receipt" size={64} color={`${textMuted}40`} />
                <Text style={[styles.emptyTitle, {color: text}]}>No Transactions</Text>
                <Text style={[styles.emptyText, {color: textMuted}]}>
                  Your payment history will appear here
                </Text>
              </View>
            ) : (
              transactions.map((transaction) => (
                <View
                  key={transaction.id}
                  style={[styles.transactionItem, {backgroundColor: card}]}>
                  <View style={[styles.transactionIcon, {backgroundColor: `${primary}15`}]}>
                    <Icon name="credit-card" size={20} color={primary} />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={[styles.transactionTitle, {color: text}]}>
                      {transaction.description || 'Subscription Payment'}
                    </Text>
                    <Text style={[styles.transactionDate, {color: textMuted}]}>
                      {formatDate(transaction.createdAt)}
                    </Text>
                  </View>
                  <View style={styles.transactionAmount}>
                    <Text style={[styles.transactionPrice, {color: text}]}>
                      {formatCurrency(transaction.amount)}
                    </Text>
                    <View
                      style={[
                        styles.transactionStatus,
                        {backgroundColor: `${getStatusColor(transaction.status)}20`},
                      ]}>
                      <Text
                        style={[
                          styles.transactionStatusText,
                          {color: getStatusColor(transaction.status)},
                        ]}>
                        {transaction.status}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {/* Bottom Spacer - ensures content is not cut off */}
        <View style={{height: 100}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSizes.lg,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerRight: {width: 40},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSizes.sm,
  },
  tabs: {
    flexDirection: 'row',
    margin: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  tabText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  content: {
    padding: Spacing.md,
  },
  // Active Subscription Card
  activeCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 2,
    ...Shadows.md,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  activeBadgeText: {
    color: '#FFF',
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  activePlanName: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    marginBottom: 4,
  },
  activePlanPrice: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  activePlanDuration: {
    fontSize: FontSizes.sm,
    fontWeight: '400',
  },
  activeDates: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  dateItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  dateLabel: {
    fontSize: FontSizes.xs,
  },
  dateValue: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
  },
  statusText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  // Section
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  // Plan Card
  planCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 2,
    ...Shadows.sm,
  },
  popularCard: {
    ...Shadows.md,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  popularBadgeText: {
    color: '#FFF',
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  planName: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  planDescription: {
    fontSize: FontSizes.xs,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  planPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  originalPrice: {
    fontSize: FontSizes.sm,
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
  planPrice: {
    fontSize: FontSizes['2xl'],
    fontWeight: '800',
  },
  planDuration: {
    fontSize: FontSizes.sm,
    marginLeft: 2,
  },
  savingsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  savingsText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  featuresList: {
    marginBottom: Spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  featureText: {
    fontSize: FontSizes.sm,
    flex: 1,
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  subscribeButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  // Trust Badges
  trustBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
    marginTop: Spacing.lg,
  },
  trustBadge: {
    alignItems: 'center',
    gap: 4,
  },
  trustText: {
    fontSize: FontSizes.xs,
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginTop: Spacing.md,
  },
  emptyText: {
    fontSize: FontSizes.sm,
    marginTop: 4,
  },
  // Transaction Item
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: FontSizes.xs,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionPrice: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    marginBottom: 4,
  },
  transactionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  transactionStatusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
