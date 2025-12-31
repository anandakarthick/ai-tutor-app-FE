/**
 * Register Screen
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

export function RegisterScreen() {
  const navigation =
    useNavigation<AuthStackScreenProps<'Register'>['navigation']>();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');

  const handleRegister = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('VerifyOTP', {phone, email});
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
            <Text style={[styles.title, {color: text}]}>Create Account</Text>
            <Text style={[styles.subtitle, {color: textSecondary}]}>
              Start your learning journey today
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(500)}
            style={styles.form}>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
              leftIcon="user"
              autoCapitalize="words"
            />

            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              leftIcon="mail"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Phone Number"
              placeholder="Enter your phone number"
              value={phone}
              onChangeText={setPhone}
              leftIcon="phone"
              keyboardType="phone-pad"
            />

            <Input
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              leftIcon="lock"
              rightIcon={showPassword ? 'eye-off' : 'eye'}
              onRightIconPress={() => setShowPassword(!showPassword)}
              secureTextEntry={!showPassword}
              hint="Must be at least 8 characters"
            />

            {/* Terms */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setAcceptedTerms(!acceptedTerms)}>
              <View
                style={[
                  styles.checkbox,
                  {borderColor: acceptedTerms ? primary : border},
                  acceptedTerms && {backgroundColor: primary},
                ]}>
                {acceptedTerms && <Icon name="check" size={14} color="#FFF" />}
              </View>
              <Text style={[styles.termsText, {color: textSecondary}]}>
                I agree to the{' '}
                <Text style={{color: primary}}>Terms of Service</Text> and{' '}
                <Text style={{color: primary}}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              disabled={!acceptedTerms}
              fullWidth
              size="lg"
            />
          </Animated.View>

          {/* Login Link */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(500)}
            style={styles.loginContainer}>
            <Text style={[styles.loginText, {color: textSecondary}]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.loginLink, {color: primary}]}>Sign In</Text>
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
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    marginBottom: Spacing.md,
    marginLeft: -Spacing.sm,
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
  form: {
    marginBottom: Spacing.xl,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
    marginTop: Spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    marginTop: 2,
  },
  termsText: {
    flex: 1,
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    fontSize: FontSizes.base,
  },
  loginLink: {
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
});
