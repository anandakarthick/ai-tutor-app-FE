/**
 * Login Screen - Mobile Number with Auto-fetch
 */

import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {Button, Input, Icon} from '../../components/ui';
import {BorderRadius, FontSizes, Spacing, Shadows} from '../../constants/theme';
import type {AuthStackScreenProps} from '../../types/navigation';

// Mock SIM phone numbers (simulating auto-fetch)
const MOCK_SIM_NUMBERS = [
  {carrier: 'Jio', number: '9876543210'},
  {carrier: 'Airtel', number: '8765432109'},
];

export function LoginScreen() {
  const navigation = useNavigation<AuthStackScreenProps<'Login'>['navigation']>();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingNumber, setFetchingNumber] = useState(true);
  const [simNumbers, setSimNumbers] = useState<typeof MOCK_SIM_NUMBERS>([]);
  const [selectedSim, setSelectedSim] = useState<number | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const primary = useThemeColor({}, 'primary');
  const card = useThemeColor({}, 'card');
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

    // Simulate fetching SIM numbers
    fetchSimNumbers();
  }, []);

  const fetchSimNumbers = async () => {
    setFetchingNumber(true);
    
    // Simulate API delay
    setTimeout(() => {
      setSimNumbers(MOCK_SIM_NUMBERS);
      if (MOCK_SIM_NUMBERS.length > 0) {
        setSelectedSim(0);
        setPhone(MOCK_SIM_NUMBERS[0].number);
      }
      setFetchingNumber(false);
    }, 1500);
  };

  const handleSimSelect = (index: number) => {
    setSelectedSim(index);
    setPhone(simNumbers[index].number);
  };

  const handleContinue = () => {
    if (phone.length !== 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    // Simulate sending OTP
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('VerifyOTP', {phone});
    }, 1000);
  };

  const handleRegister = () => {
    // Navigate directly to registration with empty phone (will enter later)
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
            <Text style={[styles.title, {color: text}]}>Welcome!</Text>
            <Text style={[styles.subtitle, {color: textSecondary}]}>
              Enter your mobile number to get started
            </Text>
          </View>

          {/* SIM Card Selection */}
          {fetchingNumber ? (
            <View style={[styles.fetchingContainer, {backgroundColor: primaryBg}]}>
              <Icon name="smartphone" size={24} color={primary} />
              <Text style={[styles.fetchingText, {color: primary}]}>
                Detecting SIM cards...
              </Text>
            </View>
          ) : simNumbers.length > 0 ? (
            <View style={styles.simContainer}>
              <Text style={[styles.simLabel, {color: textSecondary}]}>
                Select your mobile number
              </Text>
              {simNumbers.map((sim, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.simCard,
                    {
                      backgroundColor: card,
                      borderColor: selectedSim === index ? primary : border,
                      borderWidth: selectedSim === index ? 2 : 1,
                    },
                    Shadows.sm,
                  ]}
                  onPress={() => handleSimSelect(index)}>
                  <View style={[styles.simIcon, {backgroundColor: primaryBg}]}>
                    <Icon name="smartphone" size={20} color={primary} />
                  </View>
                  <View style={styles.simInfo}>
                    <Text style={[styles.simCarrier, {color: textSecondary}]}>
                      {sim.carrier}
                    </Text>
                    <Text style={[styles.simNumber, {color: text}]}>
                      +91 {sim.number.slice(0, 5)} {sim.number.slice(5)}
                    </Text>
                  </View>
                  {selectedSim === index && (
                    <View style={[styles.checkCircle, {backgroundColor: primary}]}>
                      <Icon name="check" size={14} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          {/* Manual Entry */}
          <View style={styles.manualEntry}>
            <Text style={[styles.orText, {color: textMuted}]}>
              Or enter manually
            </Text>
            <View style={styles.phoneInputContainer}>
              <View style={[styles.countryCode, {backgroundColor: primaryBg, borderColor: border}]}>
                <Text style={[styles.countryCodeText, {color: text}]}>🇮🇳 +91</Text>
              </View>
              <View style={styles.phoneInput}>
                <Input
                  placeholder="Enter mobile number"
                  value={phone}
                  onChangeText={(val) => setPhone(formatPhone(val))}
                  keyboardType="phone-pad"
                  maxLength={10}
                  containerStyle={styles.inputContainer}
                />
              </View>
            </View>
          </View>

          {/* Continue Button */}
          <View style={styles.buttonContainer}>
            <Button
              title="Get OTP 📱"
              onPress={handleContinue}
              loading={loading}
              disabled={phone.length !== 10}
              fullWidth
              size="lg"
            />
          </View>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={[styles.registerText, {color: textSecondary}]}>
              New to AI Tutor?{' '}
            </Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={[styles.registerLink, {color: primary}]}>
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
  fetchingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  fetchingText: {
    fontSize: FontSizes.base,
    fontWeight: '500',
  },
  simContainer: {
    marginBottom: Spacing.lg,
  },
  simLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  simCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  simIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  simInfo: {
    flex: 1,
  },
  simCarrier: {
    fontSize: FontSizes.xs,
    marginBottom: 2,
  },
  simNumber: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualEntry: {
    marginBottom: Spacing.xl,
  },
  orText: {
    textAlign: 'center',
    fontSize: FontSizes.sm,
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
  buttonContainer: {
    marginBottom: Spacing.lg,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  registerText: {
    fontSize: FontSizes.base,
  },
  registerLink: {
    fontSize: FontSizes.base,
    fontWeight: '700',
  },
  terms: {
    fontSize: FontSizes.xs,
    textAlign: 'center',
    lineHeight: 18,
  },
});
