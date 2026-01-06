/**
 * Subscription Screen - Mobile
 * View plans, manage subscription, and make payments with Razorpay
 */

import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Animated,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {useSubscription} from '../../context';
import {subscriptionsApi, paymentsApi} from '../../services/api';
import {Icon, Button} from '../../components/ui';
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
  const {checkSubscription} = useSubscription();

  // Theme colors - must be before other hooks that depend on them
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

  // State
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [activeSubscription, setActiveSubscription] = useState<UserSubscription | null>(null);
  const [transactions, setTransactions] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'plans' | 'transactions'>('plans');
  
  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [purchasedPlan, setPurchasedPlan] = useState<SubscriptionPlan | null>(null);
  
  // Transaction detail modal state
  const [selectedTransaction, setSelectedTransaction] = useState<Payment | null>(null);
  
  // Animation refs
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
  }, []);

  // Animate success modal
  useEffect(() => {
    if (showSuccessModal) {
      // Reset animations
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      bounceAnim.setValue(0);
      
      // Run animations
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Bounce animation for emoji
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -10,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [showSuccessModal]);

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
    } catch (err: any) {
      // Don't show error for 401 - session termination is handled by AuthContext
      if (err?.response?.status !== 401) {
        console.error('Failed to load subscription data:', err);
      }
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
        image: 'https://your-logo-url.com/logo.png',
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
        // Show success modal instead of Alert
        setPurchasedPlan(plan);
        setShowSuccessModal(true);
        await loadData();
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

  const handleSuccessModalClose = async () => {
    setShowSuccessModal(false);
    setPurchasedPlan(null);
    // Refresh subscription status after successful payment
    await checkSubscription();
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

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
                <TouchableOpacity
                  key={transaction.id}
                  style={[styles.transactionItem, {backgroundColor: card}]}
                  onPress={() => setSelectedTransaction(transaction)}
                  activeOpacity={0.7}>
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
                  <Icon name="chevron-right" size={18} color={textMuted} />
                </TouchableOpacity>
              ))
            )}
          </>
        )}

        {/* Bottom Spacer - ensures content is not cut off */}
        <View style={{height: 100}} />
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleSuccessModalClose}>
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.successModal,
              {
                backgroundColor: card,
                transform: [{scale: scaleAnim}],
                opacity: fadeAnim,
              },
            ]}>
            {/* Success Icon */}
            <Animated.View
              style={[
                styles.successIconContainer,
                {
                  backgroundColor: `${success}15`,
                  transform: [{translateY: bounceAnim}],
                },
              ]}>
              <Text style={styles.successEmoji}>🎉</Text>
            </Animated.View>

            {/* Success Text */}
            <Text style={[styles.successTitle, {color: text}]}>
              Payment Successful!
            </Text>
            <Text style={[styles.successSubtitle, {color: textSecondary}]}>
              Welcome to {purchasedPlan?.displayName || 'Premium'}!
            </Text>

            {/* Plan Details */}
            <View style={[styles.successPlanCard, {backgroundColor: `${primary}10`}]}>
              <Icon name="crown" size={24} color={primary} />
              <View style={styles.successPlanInfo}>
                <Text style={[styles.successPlanName, {color: text}]}>
                  {purchasedPlan?.displayName || 'Premium Plan'}
                </Text>
                <Text style={[styles.successPlanPrice, {color: primary}]}>
                  {purchasedPlan ? formatCurrency(purchasedPlan.price) : ''} / {purchasedPlan?.durationMonths === 1 ? 'month' : `${purchasedPlan?.durationMonths} months`}
                </Text>
              </View>
              <Icon name="check-circle" size={24} color={success} />
            </View>

            {/* Features */}
            <View style={styles.successFeatures}>
              <View style={styles.successFeatureItem}>
                <Icon name="check" size={16} color={success} />
                <Text style={[styles.successFeatureText, {color: textSecondary}]}>
                  Unlimited access to all subjects
                </Text>
              </View>
              <View style={styles.successFeatureItem}>
                <Icon name="check" size={16} color={success} />
                <Text style={[styles.successFeatureText, {color: textSecondary}]}>
                  AI-powered personalized learning
                </Text>
              </View>
              <View style={styles.successFeatureItem}>
                <Icon name="check" size={16} color={success} />
                <Text style={[styles.successFeatureText, {color: textSecondary}]}>
                  Instant doubt resolution
                </Text>
              </View>
            </View>

            {/* CTA Button */}
            <TouchableOpacity
              style={[styles.successButton, {backgroundColor: primary}]}
              onPress={handleSuccessModalClose}>
              <Text style={styles.successButtonText}>Start Learning! 🚀</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Transaction Detail Modal */}
      <Modal
        visible={selectedTransaction !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedTransaction(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.detailModal, {backgroundColor: card}]}>
            {/* Modal Header */}
            <View style={[styles.detailModalHeader, {borderBottomColor: border}]}>
              <Text style={[styles.detailModalTitle, {color: text}]}>Transaction Details</Text>
              <TouchableOpacity
                style={[styles.detailModalClose, {backgroundColor: `${textMuted}15`}]}
                onPress={() => setSelectedTransaction(null)}>
                <Icon name="x" size={20} color={textMuted} />
              </TouchableOpacity>
            </View>

            {/* Amount & Status */}
            {selectedTransaction && (
              <View style={styles.detailModalBody}>
                <View style={styles.detailAmountSection}>
                  <View style={[styles.detailIconLarge, {backgroundColor: `${primary}15`}]}>
                    <Icon name="credit-card" size={28} color={primary} />
                  </View>
                  <Text style={[styles.detailAmount, {color: text}]}>
                    {formatCurrency(selectedTransaction.amount)}
                  </Text>
                  <View
                    style={[
                      styles.detailStatusBadge,
                      {backgroundColor: `${getStatusColor(selectedTransaction.status)}20`},
                    ]}>
                    {selectedTransaction.status === 'success' && (
                      <Icon name="check-circle" size={14} color={getStatusColor(selectedTransaction.status)} />
                    )}
                    {selectedTransaction.status === 'failed' && (
                      <Icon name="x-circle" size={14} color={getStatusColor(selectedTransaction.status)} />
                    )}
                    {selectedTransaction.status === 'pending' && (
                      <Icon name="clock" size={14} color={getStatusColor(selectedTransaction.status)} />
                    )}
                    <Text
                      style={[
                        styles.detailStatusText,
                        {color: getStatusColor(selectedTransaction.status)},
                      ]}>
                      {selectedTransaction.status}
                    </Text>
                  </View>
                </View>

                {/* Detail Rows */}
                <View style={styles.detailRows}>
                  <View style={[styles.detailRow, {borderBottomColor: border}]}>
                    <Text style={[styles.detailLabel, {color: textMuted}]}>Transaction ID</Text>
                    <Text style={[styles.detailValue, {color: text}]} numberOfLines={1}>
                      {selectedTransaction.id.substring(0, 18)}...
                    </Text>
                  </View>

                  {selectedTransaction.gatewayPaymentId && (
                    <View style={[styles.detailRow, {borderBottomColor: border}]}>
                      <Text style={[styles.detailLabel, {color: textMuted}]}>Payment ID</Text>
                      <Text style={[styles.detailValue, {color: text}]} numberOfLines={1}>
                        {selectedTransaction.gatewayPaymentId}
                      </Text>
                    </View>
                  )}

                  <View style={[styles.detailRow, {borderBottomColor: border}]}>
                    <Text style={[styles.detailLabel, {color: textMuted}]}>Date & Time</Text>
                    <Text style={[styles.detailValue, {color: text}]}>
                      {formatDateTime(selectedTransaction.createdAt)}
                    </Text>
                  </View>

                  <View style={[styles.detailRow, {borderBottomColor: border}]}>
                    <Text style={[styles.detailLabel, {color: textMuted}]}>Payment Gateway</Text>
                    <Text style={[styles.detailValue, {color: text}]}>
                      {selectedTransaction.gateway || 'razorpay'}
                    </Text>
                  </View>

                  {selectedTransaction.description && (
                    <View style={[styles.detailRow, {borderBottomColor: border}]}>
                      <Text style={[styles.detailLabel, {color: textMuted}]}>Description</Text>
                      <Text style={[styles.detailValue, {color: text}]} numberOfLines={2}>
                        {selectedTransaction.description}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Close Button */}
                <TouchableOpacity
                  style={[styles.detailCloseButton, {backgroundColor: `${textMuted}15`}]}
                  onPress={() => setSelectedTransaction(null)}>
                  <Text style={[styles.detailCloseButtonText, {color: text}]}>Close</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
  // Success Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  successModal: {
    width: '100%',
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    alignItems: 'center',
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  successEmoji: {
    fontSize: 48,
  },
  successTitle: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  successSubtitle: {
    fontSize: FontSizes.base,
    marginBottom: Spacing.lg,
  },
  successPlanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  successPlanInfo: {
    flex: 1,
  },
  successPlanName: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    marginBottom: 2,
  },
  successPlanPrice: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  successFeatures: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  successFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  successFeatureText: {
    fontSize: FontSizes.sm,
  },
  successButton: {
    width: '100%',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  successButtonText: {
    color: '#FFF',
    fontSize: FontSizes.base,
    fontWeight: '700',
  },
  // Transaction Detail Modal
  detailModal: {
    width: '100%',
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
  },
  detailModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  detailModalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  detailModalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailModalBody: {
    padding: Spacing.lg,
  },
  detailAmountSection: {
    alignItems: 'center',
    paddingBottom: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  detailIconLarge: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  detailAmount: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  detailStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  detailStatusText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  detailRows: {
    marginBottom: Spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  detailLabel: {
    fontSize: FontSizes.sm,
    flex: 1,
  },
  detailValue: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  detailCloseButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  detailCloseButtonText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
});
