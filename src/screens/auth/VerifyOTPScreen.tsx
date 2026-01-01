/**
 * Verify OTP Screen
 * Default OTP: 242526
 */

import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {useAuth} from '../../context/AuthContext';
import {Button, Icon} from '../../components/ui';
import {BorderRadius, FontSizes, Spacing} from '../../constants/theme';
import type {AuthStackScreenProps} from '../../types/navigation';

// Default OTP for testing
const DEFAULT_OTP = '242526';

export function VerifyOTPScreen() {
  const navigation = useNavigation<AuthStackScreenProps<'VerifyOTP'>['navigation']>();
  const route = useRoute<AuthStackScreenProps<'VerifyOTP'>['route']>();
  const {login} = useAuth();
  
  const {phone, isLogin, fromRegistration} = route.params as {
    phone: string; 
    isLogin?: boolean;
    fromRegistration?: boolean;
  };

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [error, setError] = useState('');
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');
  const card = useThemeColor({}, 'card');
  const errorColor = useThemeColor({}, 'error');
  const success = useThemeColor({}, 'success');
  const primaryBg = useThemeColor({}, 'primaryBackground');

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    
    // Focus first input
    setTimeout(() => inputRefs.current[0]?.focus(), 300);
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const shakeError = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {toValue: 10, duration: 50, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: -10, duration: 50, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: 10, duration: 50, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: 0, duration: 50, useNativeDriver: true}),
    ]).start();
  };

  const handleOtpChange = (value: string, index: number) => {
    setError('');
    
    if (value.length > 1) {
      // Handle paste
      const pastedOtp = value.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedOtp.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + pastedOtp.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join('');
    
    if (enteredOtp.length !== 6) {
      setError('Please enter complete OTP');
      shakeError();
      return;
    }

    if (enteredOtp !== DEFAULT_OTP) {
      setError('Invalid OTP. Please try again.');
      shakeError();
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      
      // If login flow - go directly to Dashboard
      if (isLogin) {
        login({
          phone,
          name: 'Student',
        });
        // Navigation will automatically switch to Main app
        return;
      }
      
      // If coming from registration - go to plan selection
      if (fromRegistration) {
        navigation.reset({
          index: 0,
          routes: [{name: 'SelectPlan', params: {userId: phone}}],
        });
        return;
      }
      
      // Default - go to dashboard
      login({
        phone,
        name: 'Student',
      });
    }, 1000);
  };

  const handleResend = () => {
    setResendTimer(30);
    setOtp(['', '', '', '', '', '']);
    setError('');
    Alert.alert('OTP Sent', `New OTP sent to +91 ${phone}\n\nHint: Use 242526 🔥`);
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: background}]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Back Button */}
          <Animated.View style={{opacity: fadeAnim}}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Icon name="chevron-left" size={24} color={text} />
            </TouchableOpacity>
          </Animated.View>

          {/* Header */}
          <Animated.View style={[styles.header, {opacity: fadeAnim}]}>
            <View style={[styles.iconContainer, {backgroundColor: primaryBg}]}>
              <Icon name="smartphone" size={36} color={primary} />
            </View>
            <Text style={[styles.title, {color: text}]}>Verify OTP 🔐</Text>
            <Text style={[styles.subtitle, {color: textSecondary}]}>
              Enter the 6-digit code sent to
            </Text>
            <Text style={[styles.phone, {color: text}]}>
              +91 {phone.slice(0, 5)} {phone.slice(5)}
            </Text>
          </Animated.View>

          {/* Hint */}
          <View style={[styles.hintContainer, {backgroundColor: `${success}15`}]}>
            <Icon name="info" size={16} color={success} />
            <Text style={[styles.hintText, {color: success}]}>
              Demo OTP: 242526
            </Text>
          </View>

          {/* OTP Input */}
          <Animated.View
            style={[
              styles.otpContainer,
              {transform: [{translateX: shakeAnim}]},
            ]}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => (inputRefs.current[index] = ref)}
                style={[
                  styles.otpInput,
                  {
                    backgroundColor: card,
                    borderColor: error
                      ? errorColor
                      : digit
                      ? primary
                      : border,
                    color: text,
                  },
                ]}
                value={digit}
                onChangeText={value => handleOtpChange(value, index)}
                onKeyPress={e => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={6}
                selectTextOnFocus
              />
            ))}
          </Animated.View>

          {/* Error */}
          {error ? (
            <Text style={[styles.errorText, {color: errorColor}]}>{error}</Text>
          ) : null}

          {/* Resend */}
          <View style={styles.resendContainer}>
            {resendTimer > 0 ? (
              <Text style={[styles.resendText, {color: textMuted}]}>
                Resend OTP in {resendTimer}s
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <Text style={[styles.resendLink, {color: primary}]}>
                  Resend OTP 📩
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Verify Button */}
          <View style={styles.buttonContainer}>
            <Button
              title="Verify & Continue ✅"
              onPress={handleVerify}
              loading={loading}
              disabled={!isOtpComplete}
              fullWidth
              size="lg"
            />
          </View>

          {/* Change Number */}
          <TouchableOpacity
            style={styles.changeNumber}
            onPress={() => navigation.goBack()}>
            <Text style={[styles.changeNumberText, {color: textSecondary}]}>
              Wrong number?{' '}
              <Text style={{color: primary, fontWeight: '600'}}>Change</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  keyboardView: {flex: 1},
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.xl,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    marginBottom: Spacing.md,
    marginLeft: -Spacing.sm,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.xl,
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
  subtitle: {
    fontSize: FontSizes.base,
    textAlign: 'center',
  },
  phone: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  hintText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    fontSize: FontSizes.xl,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorText: {
    textAlign: 'center',
    fontSize: FontSizes.sm,
    marginBottom: Spacing.md,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  resendText: {
    fontSize: FontSizes.sm,
  },
  resendLink: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  buttonContainer: {
    marginBottom: Spacing.lg,
  },
  changeNumber: {
    alignItems: 'center',
  },
  changeNumberText: {
    fontSize: FontSizes.sm,
  },
});
