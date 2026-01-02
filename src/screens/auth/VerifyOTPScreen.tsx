/**
 * Verify OTP Screen
 * OTP verification with real API integration
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
import {useAuth} from '../../context';
import {Button, Icon} from '../../components/ui';
import {BorderRadius, FontSizes, Spacing} from '../../constants/theme';
import type {AuthStackScreenProps} from '../../types/navigation';

export function VerifyOTPScreen() {
  const navigation = useNavigation<AuthStackScreenProps<'VerifyOTP'>['navigation']>();
  const route = useRoute<AuthStackScreenProps<'VerifyOTP'>['route']>();
  const {login, verifyOtp, sendOtp} = useAuth();
  
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

    setLoading(true);
    setError('');
    
    try {
      // If coming from registration flow - go to plan selection
      if (fromRegistration) {
        // First verify the OTP
        const isValid = await verifyOtp(phone, enteredOtp);
        if (isValid) {
          navigation.reset({
            index: 0,
            routes: [{name: 'SelectPlan', params: {userId: phone}}],
          });
        } else {
          setError('Invalid OTP. Please try again.');
          shakeError();
          setOtp(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        }
        return;
      }
      
      // For login flow - first verify OTP, then try to login
      console.log('🔐 Verifying OTP...');
      const isValid = await verifyOtp(phone, enteredOtp);
      
      if (!isValid) {
        setError('Invalid OTP. Please try again.');
        shakeError();
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }
      
      console.log('✅ OTP verified, attempting login...');
      
      // Try to login
      const loginSuccess = await login(phone, enteredOtp);
      
      if (loginSuccess) {
        console.log('✅ Login successful');
        // AuthContext will update and navigation will switch automatically
      }
      // If login fails due to user not found, it will show alert from AuthContext
      // Let's catch the specific error and redirect to registration
      
    } catch (err: any) {
      console.log('❌ Verify/Login error:', err);
      
      // Check if user not found - redirect to registration
      if (err.message?.includes('not found') || err.response?.data?.code === 'USER_NOT_FOUND') {
        Alert.alert(
          'New User',
          'This phone number is not registered. Would you like to create an account?',
          [
            {text: 'Cancel', style: 'cancel', onPress: () => navigation.goBack()},
            {
              text: 'Register',
              onPress: () => navigation.navigate('Register', {phone, isDirectRegistration: false}),
            },
          ]
        );
        return;
      }
      
      setError(err.message || 'Verification failed. Please try again.');
      shakeError();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendTimer(30);
    setOtp(['', '', '', '', '', '']);
    setError('');
    
    const result = await sendOtp(phone, 'login');
    if (result.success) {
      if (__DEV__ && result.otp) {
        Alert.alert('OTP Sent', `New OTP sent to +91 ${phone}\n\nDev OTP: ${result.otp}`);
      } else {
        Alert.alert('OTP Sent', `New OTP sent to +91 ${phone}`);
      }
    }
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

          {/* Dev Hint */}
          {__DEV__ && (
            <View style={[styles.hintContainer, {backgroundColor: `${success}15`}]}>
              <Icon name="info" size={16} color={success} />
              <Text style={[styles.hintText, {color: success}]}>
                Check console for OTP (dev mode)
              </Text>
            </View>
          )}

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
                editable={!loading}
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
              <TouchableOpacity onPress={handleResend} disabled={loading}>
                <Text style={[styles.resendLink, {color: primary}]}>
                  Resend OTP 📩
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Verify Button */}
          <View style={styles.buttonContainer}>
            <Button
              title={loading ? 'Verifying...' : 'Verify & Continue ✅'}
              onPress={handleVerify}
              loading={loading}
              disabled={!isOtpComplete || loading}
              fullWidth
              size="lg"
            />
          </View>

          {/* Change Number */}
          <TouchableOpacity
            style={styles.changeNumber}
            onPress={() => navigation.goBack()}
            disabled={loading}>
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
