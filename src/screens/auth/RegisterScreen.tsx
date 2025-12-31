/**
 * Register Screen
 * New user registration
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
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {Button, Input, Icon} from '../../components/ui';
import {BorderRadius, FontSizes, Spacing, Shadows} from '../../constants/theme';
import type {AuthStackScreenProps} from '../../types/navigation';

const BOARDS = [
  {id: 'cbse', name: 'CBSE', emoji: '📘'},
  {id: 'icse', name: 'ICSE', emoji: '📗'},
  {id: 'state', name: 'State Board', emoji: '📙'},
];

const CLASSES = ['6th', '7th', '8th', '9th', '10th', '11th', '12th'];

export function RegisterScreen() {
  const navigation = useNavigation<AuthStackScreenProps<'Register'>['navigation']>();
  const route = useRoute<AuthStackScreenProps<'Register'>['route']>();
  const {phone} = route.params;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
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
  }, []);

  const handleRegister = () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!selectedBoard) {
      Alert.alert('Error', 'Please select your board');
      return;
    }
    if (!selectedClass) {
      Alert.alert('Error', 'Please select your class');
      return;
    }

    setLoading(true);

    // Simulate registration
    setTimeout(() => {
      setLoading(false);
      // Navigate to plan selection
      navigation.reset({
        index: 0,
        routes: [{name: 'SelectPlan', params: {userId: phone}}],
      });
    }, 1500);
  };

  const canProceed = fullName.trim() && selectedBoard && selectedClass;

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: background}]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
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
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <Animated.View
            style={[
              styles.header,
              {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
            ]}>
            <Text style={[styles.title, {color: text}]}>Create Account 🎉</Text>
            <Text style={[styles.subtitle, {color: textSecondary}]}>
              Tell us about yourself
            </Text>
          </Animated.View>

          {/* Phone Display */}
          <Animated.View
            style={[
              styles.phoneCard,
              {backgroundColor: primaryBg, opacity: fadeAnim},
            ]}>
            <Icon name="smartphone" size={18} color={primary} />
            <Text style={[styles.phoneText, {color: primary}]}>
              +91 {phone}
            </Text>
            <Icon name="check-circle" size={18} color={primary} />
          </Animated.View>

          {/* Form */}
          <Animated.View
            style={[
              styles.form,
              {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
            ]}>
            <Input
              label="Full Name *"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
              leftIcon="user"
              autoCapitalize="words"
            />

            <Input
              label="Email (Optional)"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              leftIcon="mail"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="School Name (Optional)"
              placeholder="Enter your school name"
              value={schoolName}
              onChangeText={setSchoolName}
              leftIcon="school"
            />

            {/* Board Selection */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionLabel, {color: text}]}>
                Select Board *
              </Text>
              <View style={styles.boardsContainer}>
                {BOARDS.map(board => (
                  <TouchableOpacity
                    key={board.id}
                    style={[
                      styles.boardCard,
                      {
                        backgroundColor: card,
                        borderColor:
                          selectedBoard === board.id ? primary : border,
                        borderWidth: selectedBoard === board.id ? 2 : 1,
                      },
                      Shadows.sm,
                    ]}
                    onPress={() => setSelectedBoard(board.id)}>
                    <Text style={styles.boardEmoji}>{board.emoji}</Text>
                    <Text
                      style={[
                        styles.boardName,
                        {
                          color:
                            selectedBoard === board.id ? primary : text,
                        },
                      ]}>
                      {board.name}
                    </Text>
                    {selectedBoard === board.id && (
                      <View
                        style={[styles.checkBadge, {backgroundColor: primary}]}>
                        <Icon name="check" size={10} color="#FFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Class Selection */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionLabel, {color: text}]}>
                Select Class *
              </Text>
              <View style={styles.classContainer}>
                {CLASSES.map(cls => (
                  <TouchableOpacity
                    key={cls}
                    style={[
                      styles.classChip,
                      {
                        backgroundColor:
                          selectedClass === cls ? primary : card,
                        borderColor:
                          selectedClass === cls ? primary : border,
                      },
                    ]}
                    onPress={() => setSelectedClass(cls)}>
                    <Text
                      style={[
                        styles.classText,
                        {
                          color: selectedClass === cls ? '#FFF' : text,
                        },
                      ]}>
                      {cls}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Register Button */}
          <Animated.View
            style={[styles.buttonContainer, {opacity: fadeAnim}]}>
            <Button
              title="Continue 🚀"
              onPress={handleRegister}
              loading={loading}
              disabled={!canProceed}
              fullWidth
              size="lg"
            />
          </Animated.View>

          <View style={{height: Spacing.xl}} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  keyboardView: {flex: 1},
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
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.base,
  },
  phoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  phoneText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
  form: {},
  sectionContainer: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  boardsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  boardCard: {
    flex: 1,
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    position: 'relative',
  },
  boardEmoji: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  boardName: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  checkBadge: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  classContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  classChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  classText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  buttonContainer: {
    marginTop: Spacing.xl,
  },
});
