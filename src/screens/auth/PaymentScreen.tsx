/**
 * Payment Screen
 * Payment processing with Razorpay integration
 */

import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
  Modal,
  ActivityIndicator,
  Linking,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {paymentsApi, subscriptionsApi} from '../../services/api';
import {Button, Input, Icon} from '../../components/ui';
import {BorderRadius, FontSizes, Spacing, Shadows} from '../../constants/theme';
import type {AuthStackScreenProps} from '../../types/navigation';

// Try to import RazorpayCheckout if available
let RazorpayCheckout: any = null;
try {
  RazorpayCheckout = require('react-native-razorpay').default;
} catch (e) {
  console.log('Razorpay not available');
}

const PAYMENT_METHODS = [
  {id: 'razorpay', name: 'Razorpay', icon: 'credit-card', emoji: '💳', description: 'UPI, Cards, NetBanking, Wallets'},
  {id: 'upi', name: 'UPI Direct', icon: 'smartphone', emoji: '📱', description: 'Google Pay, PhonePe, Paytm'},
];

const UPI_APPS = [
  {id: 'gpay', name: 'Google Pay', color: '#4285F4', upiPrefix: 'gpay://'},
  {id: 'phonepe', name: 'PhonePe', color: '#5F259F', upiPrefix: 'phonepe://'},
  {id: 'paytm', name: 'Paytm', color: '#00BAF2', upiPrefix: 'paytm://'},
];

export function PaymentScreen() {
  const navigation = useNavigation<AuthStackScreenProps<'Payment'>['navigation']>();
  const route = useRoute<AuthStackScreenProps<'Payment'>['route']>();
  const {planId, planName, price, userId} = route.params;

  const [selectedMethod, setSelectedMethod] = useState('razorpay');
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const primary = useThemeColor({}, 'primary');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const primaryBg = useThemeColor({}, 'primaryBackground');
  const success = useThemeColor({}, 'success');
  const error = useThemeColor({}, 'error');

  const finalPrice = Math.max(0, price - discount);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setValidatingCoupon(true);
    setCouponError('');
    
    try {
      const response = await subscriptionsApi.validateCoupon(couponCode.trim(), planId);
      if (response.success && response.data) {
        const coupon = response.data;
        if (coupon.discountType === 'percentage') {
          setDiscount(Math.round((price * coupon.discountValue) / 100));
        } else {
          setDiscount(coupon.discountValue);
        }
        Alert.alert('Success', `Coupon applied! You saved ₹${discount}`);
      }
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon code');
      setDiscount(0);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRazorpayPayment = async () => {
    setProcessing(true);

    try {
      // Create order on backend
      const orderResponse = await paymentsApi.createOrder({
        amount: finalPrice,
        currency: 'INR',
        planId: planId,
        description: `${planName} Subscription`,
      });

      if (!orderResponse.success || !orderResponse.data) {
        throw new Error('Failed to create order');
      }

      const {orderId, amount, currency, razorpayKeyId} = orderResponse.data;

      if (!RazorpayCheckout) {
        // Fallback for when Razorpay is not installed
        Alert.alert(
          'Payment',
          'Razorpay SDK not available. In production, this would open the Razorpay checkout.',
          [
            {text: 'Cancel', style: 'cancel', onPress: () => setProcessing(false)},
            {text: 'Simulate Success', onPress: () => simulatePaymentSuccess(orderId)},
          ]
        );
        return;
      }

      // Open Razorpay checkout
      const options = {
        description: `${planName} Subscription`,
        image: 'https://your-logo-url.com/logo.png',
        currency: currency,
        key: razorpayKeyId,
        amount: amount, // in paise
        name: 'AI Tutor',
        order_id: orderId,
        prefill: {
          email: '',
          contact: '',
          name: '',
        },
        theme: {color: primary},
      };

      const paymentData = await RazorpayCheckout.open(options);
      
      // Verify payment on backend
      const verifyResponse = await paymentsApi.verify({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentData.razorpay_payment_id,
        razorpaySignature: paymentData.razorpay_signature,
        planId: planId,
        couponCode: couponCode.trim() || undefined,
      });

      if (verifyResponse.success) {
        // Create subscription
        await subscriptionsApi.create(planId, paymentData.razorpay_payment_id, couponCode.trim() || undefined);
        showPaymentSuccess();
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (err: any) {
      console.log('Payment error:', err);
      if (err.code !== 'PAYMENT_CANCELLED') {
        Alert.alert('Payment Failed', err.message || 'Something went wrong. Please try again.');
      }
      setProcessing(false);
    }
  };

  const simulatePaymentSuccess = async (orderId: string) => {
    try {
      // For development/testing - simulate successful payment
      await subscriptionsApi.create(planId, `sim_${Date.now()}`, couponCode.trim() || undefined);
      showPaymentSuccess();
    } catch (err) {
      Alert.alert('Error', 'Failed to create subscription');
      setProcessing(false);
    }
  };

  const handleUpiPayment = async (upiApp?: string) => {
    if (!upiId.includes('@')) {
      Alert.alert('Invalid UPI ID', 'Please enter a valid UPI ID');
      return;
    }

    setProcessing(true);

    try {
      // Create order first
      const orderResponse = await paymentsApi.createOrder({
        amount: finalPrice,
        currency: 'INR',
        planId: planId,
        description: `${planName} Subscription`,
      });

      if (!orderResponse.success || !orderResponse.data) {
        throw new Error('Failed to create order');
      }

      // Generate UPI deep link
      const upiLink = `upi://pay?pa=merchant@upi&pn=AITutor&am=${finalPrice}&cu=INR&tn=${planName}Subscription`;
      
      const canOpen = await Linking.canOpenURL(upiLink);
      if (canOpen) {
        await Linking.openURL(upiLink);
        // Note: In a real app, you'd need to handle the callback from UPI apps
        Alert.alert(
          'Complete Payment',
          'Please complete the payment in your UPI app and come back.',
          [{text: 'OK', onPress: () => setProcessing(false)}]
        );
      } else {
        Alert.alert('Error', 'No UPI app found on your device');
        setProcessing(false);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to initiate UPI payment');
      setProcessing(false);
    }
  };

  const showPaymentSuccess = () => {
    setProcessing(false);
    setShowSuccess(true);

    Animated.spring(successAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();

    // Navigate after showing success
    setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{name: 'Onboarding', params: {userId}}],
      });
    }, 2000);
  };

  const handlePayment = () => {
    if (selectedMethod === 'razorpay') {
      handleRazorpayPayment();
    } else if (selectedMethod === 'upi') {
      handleUpiPayment();
    }
  };

  const canPay = () => {
    if (selectedMethod === 'upi') {
      return upiId.includes('@');
    }
    return true;
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: background}]} edges={['top', 'bottom']}>
      {/* Back Button */}
      <Animated.View style={[styles.backButtonContainer, {opacity: fadeAnim}]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={text} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animated.View style={[styles.header, {opacity: fadeAnim}]}>
          <Text style={[styles.title, {color: text}]}>Payment 💳</Text>
          <Text style={[styles.subtitle, {color: textSecondary}]}>
            Complete your subscription
          </Text>
        </Animated.View>

        {/* Order Summary */}
        <Animated.View
          style={[
            styles.summaryCard,
            {backgroundColor: primaryBg, opacity: fadeAnim},
          ]}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, {color: textSecondary}]}>
              Plan
            </Text>
            <Text style={[styles.summaryValue, {color: text}]}>
              {planName}
            </Text>
          </View>
          <View style={[styles.divider, {backgroundColor: border}]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, {color: textSecondary}]}>
              Price
            </Text>
            <Text style={[styles.summaryValue, {color: text}]}>
              ₹{price}
            </Text>
          </View>
          {discount > 0 && (
            <>
              <View style={[styles.divider, {backgroundColor: border}]} />
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, {color: success}]}>
                  Discount
                </Text>
                <Text style={[styles.summaryValue, {color: success}]}>
                  -₹{discount}
                </Text>
              </View>
            </>
          )}
          <View style={[styles.divider, {backgroundColor: border}]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, {color: textSecondary}]}>
              Total
            </Text>
            <Text style={[styles.summaryPrice, {color: primary}]}>
              ₹{finalPrice}
            </Text>
          </View>
        </Animated.View>

        {/* Coupon Code */}
        <Animated.View style={[styles.section, {opacity: fadeAnim}]}>
          <Text style={[styles.sectionTitle, {color: text}]}>
            Have a coupon? 🎟️
          </Text>
          <View style={styles.couponRow}>
            <View style={{flex: 1}}>
              <Input
                placeholder="Enter coupon code"
                value={couponCode}
                onChangeText={setCouponCode}
                autoCapitalize="characters"
                editable={!validatingCoupon && discount === 0}
              />
            </View>
            <TouchableOpacity
              style={[styles.applyButton, {backgroundColor: discount > 0 ? success : primary}]}
              onPress={validateCoupon}
              disabled={validatingCoupon || discount > 0 || !couponCode.trim()}>
              {validatingCoupon ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.applyButtonText}>
                  {discount > 0 ? '✓' : 'Apply'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
          {couponError ? (
            <Text style={[styles.couponError, {color: error}]}>{couponError}</Text>
          ) : null}
        </Animated.View>

        {/* Payment Methods */}
        <Animated.View style={[styles.section, {opacity: fadeAnim}]}>
          <Text style={[styles.sectionTitle, {color: text}]}>
            Payment Method
          </Text>
          {PAYMENT_METHODS.map(method => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                {
                  backgroundColor: card,
                  borderColor: selectedMethod === method.id ? primary : border,
                  borderWidth: selectedMethod === method.id ? 2 : 1,
                },
                Shadows.sm,
              ]}
              onPress={() => setSelectedMethod(method.id)}>
              <Text style={styles.methodEmoji}>{method.emoji}</Text>
              <View style={styles.methodInfo}>
                <Text style={[styles.methodName, {color: text}]}>
                  {method.name}
                </Text>
                <Text style={[styles.methodDesc, {color: textMuted}]}>
                  {method.description}
                </Text>
              </View>
              {selectedMethod === method.id && (
                <View style={[styles.radioSelected, {borderColor: primary}]}>
                  <View style={[styles.radioInner, {backgroundColor: primary}]} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* UPI Input */}
        {selectedMethod === 'upi' && (
          <Animated.View style={[styles.section, {opacity: fadeAnim}]}>
            <Text style={[styles.sectionTitle, {color: text}]}>
              Enter UPI ID
            </Text>
            <Input
              placeholder="yourname@upi"
              value={upiId}
              onChangeText={setUpiId}
              leftIcon="smartphone"
              autoCapitalize="none"
            />
            <View style={styles.upiAppsRow}>
              {UPI_APPS.map(app => (
                <TouchableOpacity
                  key={app.id}
                  style={[styles.upiApp, {backgroundColor: `${app.color}15`}]}
                  onPress={() => handleUpiPayment(app.id)}>
                  <Text style={[styles.upiAppText, {color: app.color}]}>
                    {app.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Security Note */}
        <View style={[styles.securityNote, {backgroundColor: `${success}15`}]}>
          <Icon name="shield" size={16} color={success} />
          <Text style={[styles.securityText, {color: success}]}>
            Your payment is secured with 256-bit encryption
          </Text>
        </View>

        {/* Pay Button */}
        <View style={styles.buttonContainer}>
          <Button
            title={processing ? 'Processing...' : `Pay ₹${finalPrice} 🔒`}
            onPress={handlePayment}
            loading={processing}
            disabled={!canPay() || processing}
            fullWidth
            size="lg"
          />
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.successModal,
              {
                backgroundColor: card,
                transform: [{scale: successAnim}],
              },
            ]}>
            <View style={[styles.successIcon, {backgroundColor: `${success}15`}]}>
              <Icon name="check-circle" size={48} color={success} />
            </View>
            <Text style={[styles.successTitle, {color: text}]}>
              Payment Successful! 🎉
            </Text>
            <Text style={[styles.successSubtitle, {color: textSecondary}]}>
              Welcome to AI Tutor Premium
            </Text>
            <Text style={[styles.successAmount, {color: success}]}>
              ₹{finalPrice} paid
            </Text>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  backButtonContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingTop: 0,
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
  summaryCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: FontSizes.base,
  },
  summaryValue: {
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
  summaryPrice: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  couponRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  applyButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: FontSizes.sm,
  },
  couponError: {
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  methodEmoji: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    marginBottom: 2,
  },
  methodDesc: {
    fontSize: FontSizes.xs,
  },
  radioSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  upiAppsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  upiApp: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  upiAppText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  securityText: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
  },
  buttonContainer: {
    marginBottom: Spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  successModal: {
    padding: Spacing['2xl'],
    borderRadius: BorderRadius['2xl'],
    alignItems: 'center',
    width: '100%',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  successTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  successSubtitle: {
    fontSize: FontSizes.base,
    marginBottom: Spacing.md,
  },
  successAmount: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
});
