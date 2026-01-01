/**
 * Login Screen - Mobile Number Entry
 */

import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {useAuth} from '../../context';
import {Button, Input, Icon} from '../../components/ui';
import {BorderRadius, FontSizes, Spacing, Shadows} from '../../constants/theme';
import type {AuthStackScreenProps} from '../../types/navigation';

export function LoginScreen() {
  const navigation = useNavigation<AuthStackScreenProps<'Login'>['navigation']>();
  const {sendOtp} = useAuth();
  
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');
  const primaryBg = useThemeColor({}, 'primaryBackground');

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

  const handleContinue = async () => {
    if (phone.length !== 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const result = await sendOtp(phone, 'login');
      if (result.success) {
        // In dev mode, show the OTP for testing
        if (__DEV__ && result.otp) {
          Alert.alert('Dev Mode', `Your OTP is: ${result.otp}`, [
            {
              text: 'OK',
              onPress: () => navigation.navigate('VerifyOTP', {phone, isLogin: true}),
            },
          ]);
        } else {
          navigation.navigate('VerifyOTP', {phone, isLogin: true});
        }
      }
    } catch (error) {
      console.log('Send OTP error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register', {phone: '', isDirectRegistration: true});
  };

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.slice(0, 10);
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: background}]} edges={['top', 'bottom']}>
      {/* Decorative circles */}
      <View style={[styles.circle1, {backgroundColor: `${primary}20`}]} />
      <View style={[styles.circle2, {backgroundColor: `${primary}15`}]} />
      <View style={[styles.circle3, {backgroundColor: `${primary}10`}]} />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Animated.View
          style={[
            styles.content,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.logoContainer, Shadows.glow]}>
              <View style={[styles.logoInner, {backgroundColor: primary}]}>
                <Icon name="book-open" size={40} color="#FFF" />
              </View>
            </View>
            <Text style={[styles.appName, {color: primary}]}>AI Tutor 🔥</Text>
            <Text style={[styles.title, {color: text}]}>Welcome Back!</Text>
            <Text style={[styles.subtitle, {color: textSecondary}]}>
              Enter your mobile number to continue
            </Text>
          </View>

          {/* Phone Input */}
          <View style={styles.phoneContainer}>
            <Text style={[styles.inputLabel, {color: text}]}>Mobile Number</Text>
            <View style={styles.phoneInputContainer}>
              <View style={[styles.countryCode, {backgroundColor: primaryBg, borderColor: border}]}>
                <Text style={[styles.countryCodeText, {color: text}]}>🇮🇳 +91</Text>
              </View>
              <View style={styles.phoneInput}>
                <Input
                  placeholder="Enter 10-digit mobile number"
                  value={phone}
                  onChangeText={(val) => setPhone(formatPhone(val))}
                  keyboardType="phone-pad"
                  maxLength={10}
                  containerStyle={styles.inputContainer}
                  editable={!loading}
                />
              </View>
            </View>
            {phone.length > 0 && phone.length < 10 && (
              <Text style={[styles.errorHint, {color: '#EF4444'}]}>
                Please enter 10 digits ({10 - phone.length} remaining)
              </Text>
            )}
          </View>

          {/* Continue Button */}
          <View style={styles.buttonContainer}>
            <Button
              title={loading ? 'Sending OTP...' : 'Get OTP 📱'}
              onPress={handleContinue}
              loading={loading}
              disabled={phone.length !== 10 || loading}
              fullWidth
              size="lg"
            />
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={[styles.dividerLine, {backgroundColor: border}]} />
            <Text style={[styles.dividerText, {color: textMuted}]}>OR</Text>
            <View style={[styles.dividerLine, {backgroundColor: border}]} />
          </View>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={[styles.registerText, {color: textSecondary}]}>
              New to AI Tutor?
            </Text>
            <TouchableOpacity 
              style={[styles.registerButton, {backgroundColor: primaryBg, borderColor: primary}]}
              onPress={handleRegister}
              disabled={loading}>
              <Icon name="user" size={18} color={primary} />
              <Text style={[styles.registerButtonText, {color: primary}]}>
                Register Now 📝
              </Text>
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <Text style={[styles.terms, {color: textMuted}]}>
            By continuing, you agree to our{' '}
            <Text style={{color: primary}}>Terms of Service</Text> and{' '}
            <Text style={{color: primary}}>Privacy Policy</Text>
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  circle1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  circle2: {
    position: 'absolute',
    bottom: -40,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  circle3: {
    position: 'absolute',
    top: '45%',
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  logoContainer: {
    marginBottom: Spacing.md,
  },
  logoInner: {
    width: 90,
    height: 90,
    borderRadius: BorderRadius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    marginBottom: Spacing.md,
    letterSpacing: 1,
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.base,
    textAlign: 'center',
  },
  phoneContainer: {
    marginBottom: Spacing.xl,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  countryCode: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
  phoneInput: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 0,
  },
  errorHint: {
    fontSize: FontSizes.xs,
    marginTop: Spacing.sm,
  },
  buttonContainer: {
    marginBottom: Spacing.xl,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    fontSize: FontSizes.sm,
  },
  registerContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  registerText: {
    fontSize: FontSizes.base,
    marginBottom: Spacing.md,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    gap: Spacing.sm,
  },
  registerButtonText: {
    fontSize: FontSizes.base,
    fontWeight: '700',
  },
  terms: {
    fontSize: FontSizes.xs,
    textAlign: 'center',
    lineHeight: 18,
  },
});
