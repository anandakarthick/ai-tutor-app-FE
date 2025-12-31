/**
 * Payment Screen
 * Payment processing with mock UPI/Card options
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
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {Button, Input, Icon} from '../../components/ui';
import {BorderRadius, FontSizes, Spacing, Shadows} from '../../constants/theme';
import type {AuthStackScreenProps} from '../../types/navigation';

const PAYMENT_METHODS = [
  {id: 'upi', name: 'UPI', icon: 'smartphone', emoji: '📱', description: 'Google Pay, PhonePe, Paytm'},
  {id: 'card', name: 'Credit/Debit Card', icon: 'credit-card', emoji: '💳', description: 'Visa, Mastercard, RuPay'},
  {id: 'netbanking', name: 'Net Banking', icon: 'building', emoji: '🏦', description: 'All major banks'},
];

const UPI_APPS = [
  {id: 'gpay', name: 'Google Pay', color: '#4285F4'},
  {id: 'phonepe', name: 'PhonePe', color: '#5F259F'},
  {id: 'paytm', name: 'Paytm', color: '#00BAF2'},
  {id: 'other', name: 'Other UPI', color: '#22C55E'},
];

export function PaymentScreen() {
  const navigation = useNavigation<AuthStackScreenProps<'Payment'>['navigation']>();
  const route = useRoute<AuthStackScreenProps<'Payment'>['route']>();
  const {planId, planName, price, userId} = route.params;

  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePayment = () => {
    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
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
    }, 2000);
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ').slice(0, 19) : '';
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const canPay = () => {
    if (selectedMethod === 'upi') {
      return upiId.includes('@');
    }
    if (selectedMethod === 'card') {
      return (
        cardNumber.replace(/\s/g, '').length === 16 &&
        cardExpiry.length === 5 &&
        cardCvv.length === 3 &&
        cardName.trim().length > 0
      );
    }
    return true;
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: background}]}>
      {/* Back Button */}
      <Animated.View style={{opacity: fadeAnim}}>
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
              Amount
            </Text>
            <Text style={[styles.summaryPrice, {color: primary}]}>
              ₹{price}
            </Text>
          </View>
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
                  onPress={() => {
                    if (app.id !== 'other') {
                      Alert.alert(
                        'Open ' + app.name,
                        'This will open ' + app.name + ' app for payment',
                      );
                    }
                  }}>
                  <Text style={[styles.upiAppText, {color: app.color}]}>
                    {app.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Card Input */}
        {selectedMethod === 'card' && (
          <Animated.View style={[styles.section, {opacity: fadeAnim}]}>
            <Text style={[styles.sectionTitle, {color: text}]}>
              Card Details
            </Text>
            <Input
              placeholder="Card Number"
              value={cardNumber}
              onChangeText={val => setCardNumber(formatCardNumber(val))}
              leftIcon="credit-card"
              keyboardType="number-pad"
              maxLength={19}
            />
            <View style={styles.cardRow}>
              <View style={{flex: 1}}>
                <Input
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChangeText={val => setCardExpiry(formatExpiry(val))}
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>
              <View style={{flex: 1}}>
                <Input
                  placeholder="CVV"
                  value={cardCvv}
                  onChangeText={setCardCvv}
                  keyboardType="number-pad"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>
            <Input
              placeholder="Cardholder Name"
              value={cardName}
              onChangeText={setCardName}
              leftIcon="user"
              autoCapitalize="words"
            />
          </Animated.View>
        )}

        {/* Security Note */}
        <View style={[styles.securityNote, {backgroundColor: `${success}15`}]}>
          <Icon name="shield" size={16} color={success} />
          <Text style={[styles.securityText, {color: success}]}>
            Your payment is secured with 256-bit encryption
          </Text>
        </View>
      </ScrollView>

      {/* Pay Button */}
      <Animated.View style={[styles.bottomContainer, {opacity: fadeAnim}]}>
        <Button
          title={processing ? 'Processing...' : `Pay ₹${price} 🔒`}
          onPress={handlePayment}
          loading={processing}
          disabled={!canPay()}
          fullWidth
          size="lg"
        />
      </Animated.View>

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
              ₹{price} paid
            </Text>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    marginLeft: Spacing.lg,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 120,
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
  cardRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  securityText: {
    fontSize: FontSizes.xs,
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
