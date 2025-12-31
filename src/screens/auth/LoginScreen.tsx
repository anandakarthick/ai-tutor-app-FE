/**
 * Login Screen
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Animated, {FadeInDown, FadeInUp} from 'react-native-reanimated';
import {useNavigation} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {Button, Input, Icon} from '../../components/ui';
import {BorderRadius, FontSizes, Spacing} from '../../constants/theme';
import type {AuthStackScreenProps} from '../../types/navigation';

export function LoginScreen() {
  const navigation =
    useNavigation<AuthStackScreenProps<'Login'>['navigation']>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const primary = useThemeColor({}, 'primary');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');

  const handleLogin = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Navigate to main app - handled by AppNavigator
    }, 1500);
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: background}]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Header */}
          <Animated.View entering={FadeInUp.duration(500)} style={styles.header}>
            <View style={[styles.logoContainer, {backgroundColor: primary}]}>
              <Icon name="book-open" size={32} color="#FFF" />
            </View>
            <Text style={[styles.title, {color: text}]}>Welcome Back!</Text>
            <Text style={[styles.subtitle, {color: textSecondary}]}>
              Sign in to continue learning
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(500)}
            style={styles.form}>
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
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              fullWidth
              size="lg"
            />
          </Animated.View>

          {/* Divider */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(500)}
            style={styles.dividerContainer}>
            <View style={[styles.divider, {backgroundColor: border}]} />
            <Text style={[styles.dividerText, {color: textMuted}]}>
              or continue with
            </Text>
            <View style={[styles.divider, {backgroundColor: border}]} />
          </Animated.View>

          {/* Social Login */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(500)}
            style={styles.socialButtons}>
            <TouchableOpacity
              style={[
                styles.socialButton,
                {backgroundColor: card, borderColor: border},
              ]}>
              <Icon name="globe" size={20} color={text} />
              <Text style={[styles.socialButtonText, {color: text}]}>
                Google
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.socialButton,
                {backgroundColor: card, borderColor: border},
              ]}>
              <Icon name="star" size={20} color={text} />
              <Text style={[styles.socialButtonText, {color: text}]}>Apple</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Register Link */}
          <Animated.View
            entering={FadeInDown.delay(500).duration(500)}
            style={styles.registerContainer}>
            <Text style={[styles.registerText, {color: textSecondary}]}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.registerLink, {color: primary}]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </Animated.View>
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  logoContainer: {
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
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
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
    fontWeight: '600',
  },
});
