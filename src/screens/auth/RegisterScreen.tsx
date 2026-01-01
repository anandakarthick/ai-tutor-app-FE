/**
 * Register Screen - Comprehensive Student Registration with API
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
  Modal,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {useAuth} from '../../context';
import {contentApi} from '../../services/api';
import {Button, Input, Icon} from '../../components/ui';
import {BorderRadius, FontSizes, Spacing, Shadows} from '../../constants/theme';
import type {AuthStackScreenProps} from '../../types/navigation';
import type {Board, Class, Medium, Gender} from '../../types/api';

// Medium options
const MEDIUMS: {id: Medium; name: string; emoji: string}[] = [
  {id: 'english' as Medium, name: 'English', emoji: '🇬🇧'},
  {id: 'hindi' as Medium, name: 'Hindi', emoji: '🇮🇳'},
  {id: 'tamil' as Medium, name: 'Tamil', emoji: '🏛️'},
  {id: 'telugu' as Medium, name: 'Telugu', emoji: '🎭'},
  {id: 'kannada' as Medium, name: 'Kannada', emoji: '🪔'},
  {id: 'malayalam' as Medium, name: 'Malayalam', emoji: '🌴'},
  {id: 'marathi' as Medium, name: 'Marathi', emoji: '🏰'},
  {id: 'bengali' as Medium, name: 'Bengali', emoji: '🎨'},
  {id: 'gujarati' as Medium, name: 'Gujarati', emoji: '🦁'},
];

// Gender options
const GENDERS: {id: Gender; name: string; emoji: string}[] = [
  {id: 'male' as Gender, name: 'Male', emoji: '👦'},
  {id: 'female' as Gender, name: 'Female', emoji: '👧'},
  {id: 'other' as Gender, name: 'Other', emoji: '🧑'},
];

// Learning style options
const LEARNING_STYLES = [
  {id: 'visual', name: 'Visual', emoji: '👁️', desc: 'Learn by seeing'},
  {id: 'auditory', name: 'Auditory', emoji: '👂', desc: 'Learn by hearing'},
  {id: 'kinesthetic', name: 'Kinesthetic', emoji: '✋', desc: 'Learn by doing'},
  {id: 'reading', name: 'Reading/Writing', emoji: '📖', desc: 'Learn by reading'},
];

// Daily study hours
const STUDY_HOURS = ['1', '2', '3', '4', '5', '6'];

type Step = 1 | 2 | 3;

export function RegisterScreen() {
  const navigation = useNavigation<AuthStackScreenProps<'Register'>['navigation']>();
  const route = useRoute<AuthStackScreenProps<'Register'>['route']>();
  const {register, sendOtp} = useAuth();
  const {phone: initialPhone, isDirectRegistration} = route.params as {phone: string; isDirectRegistration?: boolean};

  // API data
  const [boards, setBoards] = useState<Board[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loadingBoards, setLoadingBoards] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Step state
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Required fields
  const [phone, setPhone] = useState(initialPhone || '');
  const [fullName, setFullName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedMedium, setSelectedMedium] = useState<Medium | null>(null);

  // Additional fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [section, setSection] = useState('');

  // Learning preferences
  const [learningStyle, setLearningStyle] = useState('');
  const [dailyStudyHours, setDailyStudyHours] = useState('2');

  const [loading, setLoading] = useState(false);
  const [showMediumModal, setShowMediumModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const primary = useThemeColor({}, 'primary');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const primaryBg = useThemeColor({}, 'primaryBackground');
  const success = useThemeColor({}, 'success');

  // Load boards on mount
  useEffect(() => {
    loadBoards();
  }, []);

  // Load classes when board changes
  useEffect(() => {
    if (selectedBoard) {
      loadClasses(selectedBoard.id);
    } else {
      setClasses([]);
      setSelectedClass(null);
    }
  }, [selectedBoard]);

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
  }, [currentStep]);

  const loadBoards = async () => {
    try {
      setLoadingBoards(true);
      const response = await contentApi.boards.getAll();
      if (response.success && response.data) {
        setBoards(response.data);
      }
    } catch (error) {
      console.log('Load boards error:', error);
      // Use fallback boards if API fails
      setBoards([
        {id: 'cbse', name: 'CBSE', fullName: 'Central Board of Secondary Education', displayOrder: 1, isActive: true},
        {id: 'icse', name: 'ICSE', fullName: 'Indian Certificate of Secondary Education', displayOrder: 2, isActive: true},
        {id: 'state', name: 'State Board', fullName: 'State Board', displayOrder: 3, isActive: true},
      ] as Board[]);
    } finally {
      setLoadingBoards(false);
    }
  };

  const loadClasses = async (boardId: string) => {
    try {
      setLoadingClasses(true);
      const response = await contentApi.boards.getClasses(boardId);
      if (response.success && response.data) {
        setClasses(response.data);
      }
    } catch (error) {
      console.log('Load classes error:', error);
      // Use fallback classes
      const fallbackClasses = ['6th', '7th', '8th', '9th', '10th', '11th', '12th'].map((name, i) => ({
        id: `class-${i + 6}`,
        boardId,
        className: name,
        displayName: `Class ${name}`,
        displayOrder: i + 1,
        isActive: true,
      })) as Class[];
      setClasses(fallbackClasses);
    } finally {
      setLoadingClasses(false);
    }
  };

  const validateStep1 = () => {
    if (isDirectRegistration && phone.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return false;
    }
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }
    if (!studentName.trim()) {
      Alert.alert('Error', 'Please enter student name');
      return false;
    }
    if (!selectedBoard) {
      Alert.alert('Error', 'Please select your board');
      return false;
    }
    if (!selectedClass) {
      Alert.alert('Error', 'Please select your class');
      return false;
    }
    if (!selectedMedium) {
      Alert.alert('Error', 'Please select your medium of instruction');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    
    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as Step);
    } else {
      handleRegister();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    } else {
      navigation.goBack();
    }
  };

  const handleRegister = async () => {
    setLoading(true);

    try {
      // First register the user
      const registerSuccess = await register({
        fullName,
        phone,
        email: email || undefined,
        password: password || undefined,
      });

      if (registerSuccess) {
        // User is now logged in, navigate to create student profile
        // For now, go to plan selection
        navigation.reset({
          index: 0,
          routes: [{name: 'SelectPlan', params: {userId: phone}}],
        });
      }
    } catch (error: any) {
      console.log('Registration error:', error);
      Alert.alert('Registration Failed', error.message || 'Could not complete registration');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      handleRegister();
    }
  };

  const getStepProgress = () => {
    return (currentStep / 3) * 100;
  };

  const getBoardEmoji = (name: string) => {
    const map: Record<string, string> = {
      'CBSE': '📘',
      'ICSE': '📗',
      'State Board': '📙',
      'IB': '📕',
      'Cambridge': '📓',
    };
    return map[name] || '📚';
  };

  const renderStep1 = () => (
    <Animated.View style={[styles.stepContent, {opacity: fadeAnim, transform: [{translateY: slideAnim}]}]}>
      <Text style={[styles.stepTitle, {color: text}]}>Basic Information 📋</Text>
      <Text style={[styles.stepSubtitle, {color: textSecondary}]}>
        Tell us about yourself
      </Text>

      {/* Phone Number - Only show if direct registration */}
      {isDirectRegistration && (
        <View style={styles.phoneInputContainer}>
          <Text style={[styles.fieldLabel, {color: text}]}>Mobile Number *</Text>
          <View style={styles.phoneRow}>
            <View style={[styles.countryCode, {backgroundColor: primaryBg, borderColor: border}]}>
              <Text style={[styles.countryCodeText, {color: text}]}>🇮🇳 +91</Text>
            </View>
            <View style={styles.phoneInputFlex}>
              <Input
                placeholder="Enter mobile number"
                value={phone}
                onChangeText={(val) => setPhone(val.replace(/\D/g, '').slice(0, 10))}
                keyboardType="phone-pad"
                maxLength={10}
                containerStyle={styles.inputNoMargin}
              />
            </View>
          </View>
        </View>
      )}

      {/* Phone Display - Show if phone already provided */}
      {!isDirectRegistration && phone && (
        <View style={[styles.phoneCard, {backgroundColor: primaryBg}]}>
          <Icon name="smartphone" size={18} color={primary} />
          <Text style={[styles.phoneText, {color: primary}]}>+91 {phone}</Text>
          <Icon name="check-circle" size={18} color={success} />
        </View>
      )}

      <Input
        label="Your Full Name *"
        placeholder="Enter your name (parent/guardian)"
        value={fullName}
        onChangeText={setFullName}
        leftIcon="user"
        autoCapitalize="words"
      />

      <Input
        label="Student Name *"
        placeholder="Enter student's full name"
        value={studentName}
        onChangeText={setStudentName}
        leftIcon="users"
        autoCapitalize="words"
      />

      <Input
        label="School Name"
        placeholder="Enter school name"
        value={schoolName}
        onChangeText={setSchoolName}
        leftIcon="home"
      />

      {/* Board Selection */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.fieldLabel, {color: text}]}>Board of Education *</Text>
        {loadingBoards ? (
          <ActivityIndicator size="small" color={primary} />
        ) : (
          <View style={styles.optionsGrid}>
            {boards.map(board => (
              <TouchableOpacity
                key={board.id}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: card,
                    borderColor: selectedBoard?.id === board.id ? primary : border,
                    borderWidth: selectedBoard?.id === board.id ? 2 : 1,
                  },
                  Shadows.sm,
                ]}
                onPress={() => setSelectedBoard(board)}>
                <Text style={styles.optionEmoji}>{getBoardEmoji(board.name)}</Text>
                <Text style={[styles.optionName, {color: selectedBoard?.id === board.id ? primary : text}]}>
                  {board.name}
                </Text>
                {selectedBoard?.id === board.id && (
                  <View style={[styles.checkBadge, {backgroundColor: primary}]}>
                    <Icon name="check" size={10} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Class Selection */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.fieldLabel, {color: text}]}>Class / Grade *</Text>
        {!selectedBoard ? (
          <Text style={[styles.helperText, {color: textMuted}]}>Please select a board first</Text>
        ) : loadingClasses ? (
          <ActivityIndicator size="small" color={primary} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.classRow}>
              {classes.map(cls => (
                <TouchableOpacity
                  key={cls.id}
                  style={[
                    styles.classChip,
                    {
                      backgroundColor: selectedClass?.id === cls.id ? primary : card,
                      borderColor: selectedClass?.id === cls.id ? primary : border,
                    },
                  ]}
                  onPress={() => setSelectedClass(cls)}>
                  <Text style={[styles.classText, {color: selectedClass?.id === cls.id ? '#FFF' : text}]}>
                    {cls.displayName || cls.className}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      {/* Medium Selection */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.fieldLabel, {color: text}]}>Medium of Instruction *</Text>
        <TouchableOpacity
          style={[styles.selectButton, {backgroundColor: card, borderColor: selectedMedium ? primary : border}]}
          onPress={() => setShowMediumModal(true)}>
          {selectedMedium ? (
            <View style={styles.selectedMedium}>
              <Text style={styles.selectedMediumEmoji}>
                {MEDIUMS.find(m => m.id === selectedMedium)?.emoji}
              </Text>
              <Text style={[styles.selectedMediumText, {color: text}]}>
                {MEDIUMS.find(m => m.id === selectedMedium)?.name}
              </Text>
            </View>
          ) : (
            <Text style={[styles.selectPlaceholder, {color: textMuted}]}>
              Select medium
            </Text>
          )}
          <Icon name="chevron-down" size={20} color={textMuted} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View style={[styles.stepContent, {opacity: fadeAnim, transform: [{translateY: slideAnim}]}]}>
      <Text style={[styles.stepTitle, {color: text}]}>Additional Details 📝</Text>
      <Text style={[styles.stepSubtitle, {color: textSecondary}]}>
        Help us personalize your experience (Optional)
      </Text>

      <Input
        label="Email (Optional)"
        placeholder="Enter email address"
        value={email}
        onChangeText={setEmail}
        leftIcon="mail"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Input
        label="Password (Optional)"
        placeholder="Create a password"
        value={password}
        onChangeText={setPassword}
        leftIcon="lock"
        secureTextEntry
      />

      <Input
        label="Date of Birth (Optional)"
        placeholder="YYYY-MM-DD"
        value={dateOfBirth}
        onChangeText={setDateOfBirth}
        leftIcon="calendar"
        keyboardType="number-pad"
        maxLength={10}
      />

      {/* Gender Selection */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.fieldLabel, {color: text}]}>Gender (Optional)</Text>
        <View style={styles.genderRow}>
          {GENDERS.map(g => (
            <TouchableOpacity
              key={g.id}
              style={[
                styles.genderCard,
                {
                  backgroundColor: gender === g.id ? primaryBg : card,
                  borderColor: gender === g.id ? primary : border,
                },
              ]}
              onPress={() => setGender(g.id)}>
              <Text style={styles.genderEmoji}>{g.emoji}</Text>
              <Text style={[styles.genderText, {color: gender === g.id ? primary : text}]}>
                {g.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Input
        label="Section (Optional)"
        placeholder="e.g., A, B, C"
        value={section}
        onChangeText={setSection}
        autoCapitalize="characters"
        maxLength={5}
      />
    </Animated.View>
  );

  const renderStep3 = () => (
    <Animated.View style={[styles.stepContent, {opacity: fadeAnim, transform: [{translateY: slideAnim}]}]}>
      <Text style={[styles.stepTitle, {color: text}]}>Learning Preferences 🎯</Text>
      <Text style={[styles.stepSubtitle, {color: textSecondary}]}>
        Help us customize your learning journey (Optional)
      </Text>

      {/* Learning Style */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.fieldLabel, {color: text}]}>How do you learn best?</Text>
        <View style={styles.learningGrid}>
          {LEARNING_STYLES.map(style => (
            <TouchableOpacity
              key={style.id}
              style={[
                styles.learningCard,
                {
                  backgroundColor: learningStyle === style.id ? primaryBg : card,
                  borderColor: learningStyle === style.id ? primary : border,
                },
                Shadows.sm,
              ]}
              onPress={() => setLearningStyle(style.id)}>
              <Text style={styles.learningEmoji}>{style.emoji}</Text>
              <Text style={[styles.learningName, {color: learningStyle === style.id ? primary : text}]}>
                {style.name}
              </Text>
              <Text style={[styles.learningDesc, {color: textMuted}]}>{style.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Daily Study Hours */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.fieldLabel, {color: text}]}>Daily study hours available</Text>
        <View style={styles.hoursRow}>
          {STUDY_HOURS.map(hour => (
            <TouchableOpacity
              key={hour}
              style={[
                styles.hourChip,
                {
                  backgroundColor: dailyStudyHours === hour ? primary : card,
                  borderColor: dailyStudyHours === hour ? primary : border,
                },
              ]}
              onPress={() => setDailyStudyHours(hour)}>
              <Text style={[styles.hourText, {color: dailyStudyHours === hour ? '#FFF' : text}]}>
                {hour} hr{hour !== '1' ? 's' : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Summary */}
      <View style={[styles.summaryCard, {backgroundColor: primaryBg, borderColor: primary}]}>
        <Text style={[styles.summaryTitle, {color: primary}]}>📋 Registration Summary</Text>
        <Text style={[styles.summaryText, {color: text}]}>
          <Text style={styles.summaryLabel}>Name:</Text> {fullName}{'\n'}
          <Text style={styles.summaryLabel}>Student:</Text> {studentName}{'\n'}
          <Text style={styles.summaryLabel}>Board:</Text> {selectedBoard?.name}{'\n'}
          <Text style={styles.summaryLabel}>Class:</Text> {selectedClass?.displayName || selectedClass?.className}{'\n'}
          <Text style={styles.summaryLabel}>Medium:</Text> {MEDIUMS.find(m => m.id === selectedMedium)?.name}
        </Text>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: background}]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack} disabled={loading}>
            <Icon name="chevron-left" size={24} color={text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, {color: text}]}>Student Registration</Text>
            <Text style={[styles.headerStep, {color: textMuted}]}>Step {currentStep} of 3</Text>
          </View>
          {currentStep > 1 && (
            <TouchableOpacity onPress={handleSkip} disabled={loading}>
              <Text style={[styles.skipText, {color: primary}]}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Progress Bar */}
        <View style={[styles.progressContainer, {backgroundColor: border}]}>
          <Animated.View 
            style={[
              styles.progressBar, 
              {backgroundColor: primary, width: `${getStepProgress()}%`}
            ]} 
          />
        </View>

        {/* Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </ScrollView>

        {/* Bottom Button */}
        <View style={[styles.bottomContainer, {backgroundColor: background}]}>
          <Button
            title={loading ? 'Creating Account...' : (currentStep === 3 ? 'Complete Registration ✅' : 'Continue →')}
            onPress={handleNext}
            loading={loading}
            disabled={loading}
            fullWidth
            size="lg"
          />
        </View>
      </KeyboardAvoidingView>

      {/* Medium Selection Modal */}
      <Modal visible={showMediumModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {backgroundColor: card}]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, {color: text}]}>Select Medium</Text>
              <TouchableOpacity onPress={() => setShowMediumModal(false)}>
                <Icon name="x" size={24} color={textMuted} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {MEDIUMS.map(medium => (
                <TouchableOpacity
                  key={medium.id}
                  style={[
                    styles.mediumOption,
                    {
                      backgroundColor: selectedMedium === medium.id ? primaryBg : 'transparent',
                      borderColor: border,
                    },
                  ]}
                  onPress={() => {
                    setSelectedMedium(medium.id);
                    setShowMediumModal(false);
                  }}>
                  <Text style={styles.mediumEmoji}>{medium.emoji}</Text>
                  <Text style={[styles.mediumName, {color: text}]}>{medium.name}</Text>
                  {selectedMedium === medium.id && (
                    <Icon name="check" size={20} color={primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  keyboardView: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  headerStep: {
    fontSize: FontSizes.xs,
    marginTop: 2,
  },
  skipText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
  progressContainer: {
    height: 4,
    marginHorizontal: Spacing.lg,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  stepContent: {},
  stepTitle: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  stepSubtitle: {
    fontSize: FontSizes.base,
    marginBottom: Spacing.xl,
  },
  phoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  phoneText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
  phoneInputContainer: {
    marginBottom: Spacing.lg,
  },
  phoneRow: {
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
  phoneInputFlex: {
    flex: 1,
  },
  inputNoMargin: {
    marginBottom: 0,
  },
  sectionContainer: {
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  helperText: {
    fontSize: FontSizes.sm,
    fontStyle: 'italic',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionCard: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    minWidth: '30%',
    position: 'relative',
  },
  optionEmoji: {
    fontSize: 20,
    marginBottom: Spacing.xs,
  },
  optionName: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    textAlign: 'center',
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
  classRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  classChip: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  classText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
  },
  selectedMedium: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  selectedMediumEmoji: {
    fontSize: 18,
  },
  selectedMediumText: {
    fontSize: FontSizes.base,
    fontWeight: '500',
  },
  selectPlaceholder: {
    fontSize: FontSizes.base,
  },
  genderRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  genderCard: {
    flex: 1,
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  genderEmoji: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  genderText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  learningGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  learningCard: {
    width: '47%',
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  learningEmoji: {
    fontSize: 28,
    marginBottom: Spacing.xs,
  },
  learningName: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    marginBottom: 2,
  },
  learningDesc: {
    fontSize: FontSizes.xs,
    textAlign: 'center',
  },
  hoursRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  hourChip: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    minWidth: 60,
    alignItems: 'center',
  },
  hourText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  summaryCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    marginTop: Spacing.lg,
  },
  summaryTitle: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  summaryText: {
    fontSize: FontSizes.sm,
    lineHeight: 22,
  },
  summaryLabel: {
    fontWeight: '600',
  },
  bottomContainer: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    maxHeight: '70%',
    paddingBottom: Spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  mediumOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  mediumEmoji: {
    fontSize: 24,
  },
  mediumName: {
    flex: 1,
    fontSize: FontSizes.base,
    fontWeight: '500',
  },
});
