/**
 * Verify OTP Screen
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
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Animated, {FadeInDown, FadeInUp} from 'react-native-reanimated';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {Button, Icon} from '../../components/ui';
import {BorderRadius, FontSizes, Spacing} from '../../constants/theme';
import type {AuthStackScreenProps} from '../../types/navigation';

export function VerifyOTPScreen() {
  const navigation =
    useNavigation<AuthStackScreenProps<'VerifyOTP'>['navigation']>();
  const route = useRoute<AuthStackScreenProps<'VerifyOTP'>['route']>();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');
  const backgroundSecondary = useThemeColor({}, 'backgroundSecondary');

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      value = value[value.length - 1];
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
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('Onboarding');
    }, 1500);
  };

  const handleResend = () => {
    setResendTimer(30);
    // Resend OTP logic
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: background}]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        {/* Back Button */}
        <Animated.View entering={FadeInUp.duration(400)}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="chevron-left" size={24} color={text} />
          </TouchableOpacity>
        </Animated.View>

        {/* Header */}
        <Animated.View
          entering={FadeInUp.delay(100).duration(500)}
          style={styles.header}>
          <View
            style={[styles.iconContainer, {backgroundColor: `${primary}15`}]}>
            <Icon name="mail" size={32} color={primary} />
          </View>
          <Text style={[styles.title, {color: text}]}>Verify Your Account</Text>
          <Text style={[styles.subtitle, {color: textSecondary}]}>
            We've sent a 6-digit code to{'\n'}
            <Text style={{fontWeight: '600'}}>
              {route.params?.phone || route.params?.email || 'your contact'}
            </Text>
          </Text>
        </Animated.View>

        {/* OTP Input */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput,
                {
                  backgroundColor: backgroundSecondary,
                  borderColor: digit ? primary : border,
                  color: text,
                },
              ]}
              value={digit}
              onChangeText={value => handleOtpChange(value, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </Animated.View>

        {/* Resend */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          style={styles.resendContainer}>
          {resendTimer > 0 ? (
            <Text style={[styles.resendText, {color: textMuted}]}>
              Resend code in {resendTimer}s
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={[styles.resendLink, {color: primary}]}>
                Resend Code
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Verify Button */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(500)}
          style={styles.buttonContainer}>
          <Button
            title="Verify"
            onPress={handleVerify}
            loading={loading}
            disabled={!isOtpComplete}
            fullWidth
            size="lg"
          />
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  keyboardView: {flex: 1, padding: Spacing.xl},
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    marginBottom: Spacing.md,
    marginLeft: -Spacing.sm,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  iconContainer: {
    width: 72,
    height: 72,
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
    lineHeight: 24,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    fontSize: FontSizes.xl,
    fontWeight: '700',
    textAlign: 'center',
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
    marginTop: 'auto',
  },
});
