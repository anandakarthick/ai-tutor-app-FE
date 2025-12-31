/**
 * Login Screen - Orange Theme
 */

import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {Button, Input, Icon} from '../../components/ui';
import {BorderRadius, FontSizes, Spacing, Shadows} from '../../constants/theme';
import type {AuthStackScreenProps} from '../../types/navigation';

export function LoginScreen() {
  const navigation =
    useNavigation<AuthStackScreenProps<'Login'>['navigation']>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const primary = useThemeColor({}, 'primary');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const primaryLight = useThemeColor({}, 'primaryLight');

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
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Navigate to main app - handled by AppNavigator
    }, 1500);
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: background}]}>
      {/* Decorative circles - Orange themed */}
      <View style={[styles.circle1, {backgroundColor: `${primary}20`}]} />
      <View style={[styles.circle2, {backgroundColor: `${primaryLight}15`}]} />
      <View style={[styles.circle3, {backgroundColor: `${primary}10`}]} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Header */}
          <Animated.View 
            style={[
              styles.header, 
              {
                opacity: fadeAnim, 
                transform: [{translateY: slideAnim}, {scale: scaleAnim}]
              }
            ]}>
            <View style={[styles.logoContainer, Shadows.glow]}>
              <View style={[styles.logoInner, {backgroundColor: primary}]}>
                <Icon name="book-open" size={36} color="#FFF" />
              </View>
            </View>
            <Text style={[styles.appName, {color: primary}]}>AI Tutor 🔥</Text>
            <Text style={[styles.title, {color: text}]}>Welcome Back!</Text>
            <Text style={[styles.subtitle, {color: textSecondary}]}>
              Sign in to continue your learning journey
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View 
            style={[
              styles.form, 
              {opacity: fadeAnim, transform: [{translateY: slideAnim}]}
            ]}>
            <Input
              label="Email or Phone"
              placeholder="Enter your email or phone"
              value={email}
              onChangeText={setEmail}
              leftIcon="mail"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              leftIcon="lock"
              rightIcon={showPassword ? 'eye-off' : 'eye'}
              onRightIconPress={() => setShowPassword(!showPassword)}
              secureTextEntry={!showPassword}
            />

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={[styles.forgotPasswordText, {color: primary}]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <Button
              title="Sign In 🚀"
              onPress={handleLogin}
              loading={loading}
              fullWidth
              size="lg"
            />
          </Animated.View>

          {/* Divider */}
          <Animated.View 
            style={[
              styles.dividerContainer, 
              {opacity: fadeAnim}
            ]}>
            <View style={[styles.divider, {backgroundColor: border}]} />
            <Text style={[styles.dividerText, {color: textMuted}]}>
              or continue with
            </Text>
            <View style={[styles.divider, {backgroundColor: border}]} />
          </Animated.View>

          {/* Social Login */}
          <Animated.View 
            style={[
              styles.socialButtons, 
              {opacity: fadeAnim}
            ]}>
            <TouchableOpacity
              style={[
                styles.socialButton,
                {backgroundColor: card, borderColor: border},
                Shadows.sm,
              ]}>
              <Text style={styles.socialIcon}>🔵</Text>
              <Text style={[styles.socialButtonText, {color: text}]}>
                Google
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.socialButton,
                {backgroundColor: card, borderColor: border},
                Shadows.sm,
              ]}>
              <Text style={styles.socialIcon}>🍎</Text>
              <Text style={[styles.socialButtonText, {color: text}]}>Apple</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Register Link */}
          <Animated.View 
            style={[
              styles.registerContainer, 
              {opacity: fadeAnim}
            ]}>
            <Text style={[styles.registerText, {color: textSecondary}]}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.registerLink, {color: primary}]}>
                Sign Up 🔥
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
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
    top: '40%',
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  keyboardView: {flex: 1},
  scrollContent: {
    flexGrow: 1,
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
    width: 80,
    height: 80,
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
  form: {
    marginBottom: Spacing.xl,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.lg,
    marginTop: -Spacing.sm,
  },
  forgotPasswordText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    fontSize: FontSizes.sm,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  socialIcon: {
    fontSize: 18,
  },
  socialButtonText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    fontSize: FontSizes.base,
  },
  registerLink: {
    fontSize: FontSizes.base,
    fontWeight: '700',
  },
});
