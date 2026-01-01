/**
 * Register Screen - Comprehensive Student Registration
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
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {Button, Input, Icon} from '../../components/ui';
import {BorderRadius, FontSizes, Spacing, Shadows} from '../../constants/theme';
import type {AuthStackScreenProps} from '../../types/navigation';

// Board options
const BOARDS = [
  {id: 'cbse', name: 'CBSE', emoji: '📘'},
  {id: 'icse', name: 'ICSE', emoji: '📗'},
  {id: 'state', name: 'State Board', emoji: '📙'},
  {id: 'ib', name: 'IB', emoji: '📕'},
  {id: 'cambridge', name: 'Cambridge', emoji: '📓'},
];

// Class options
const CLASSES = ['LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

// Medium options
const MEDIUMS = [
  {id: 'english', name: 'English', emoji: '🇬🇧'},
  {id: 'hindi', name: 'Hindi', emoji: '🇮🇳'},
  {id: 'tamil', name: 'Tamil', emoji: '🏛️'},
  {id: 'telugu', name: 'Telugu', emoji: '🎭'},
  {id: 'kannada', name: 'Kannada', emoji: '🪔'},
  {id: 'malayalam', name: 'Malayalam', emoji: '🌴'},
  {id: 'marathi', name: 'Marathi', emoji: '🏰'},
  {id: 'bengali', name: 'Bengali', emoji: '🎨'},
  {id: 'gujarati', name: 'Gujarati', emoji: '🦁'},
];

// Gender options
const GENDERS = [
  {id: 'male', name: 'Male', emoji: '👦'},
  {id: 'female', name: 'Female', emoji: '👧'},
  {id: 'other', name: 'Other', emoji: '🧑'},
];

// Learning style options
const LEARNING_STYLES = [
  {id: 'visual', name: 'Visual', emoji: '👁️', desc: 'Learn by seeing'},
  {id: 'auditory', name: 'Auditory', emoji: '👂', desc: 'Learn by hearing'},
  {id: 'kinesthetic', name: 'Kinesthetic', emoji: '✋', desc: 'Learn by doing'},
  {id: 'reading', name: 'Reading/Writing', emoji: '📖', desc: 'Learn by reading'},
];

// Study time preferences
const STUDY_TIMES = [
  {id: 'morning', name: 'Morning', emoji: '🌅', time: '6 AM - 12 PM'},
  {id: 'afternoon', name: 'Afternoon', emoji: '☀️', time: '12 PM - 5 PM'},
  {id: 'evening', name: 'Evening', emoji: '🌆', time: '5 PM - 9 PM'},
  {id: 'night', name: 'Night', emoji: '🌙', time: '9 PM - 12 AM'},
];

// Daily study hours
const STUDY_HOURS = ['1', '2', '3', '4', '5', '6+'];

// Target exams
const TARGET_EXAMS = [
  {id: 'none', name: 'School Exams Only', emoji: '📝'},
  {id: 'jee', name: 'JEE (Engineering)', emoji: '⚙️'},
  {id: 'neet', name: 'NEET (Medical)', emoji: '🏥'},
  {id: 'upsc', name: 'UPSC', emoji: '🏛️'},
  {id: 'cat', name: 'CAT (MBA)', emoji: '📊'},
  {id: 'clat', name: 'CLAT (Law)', emoji: '⚖️'},
  {id: 'nda', name: 'NDA (Defence)', emoji: '🎖️'},
  {id: 'olympiad', name: 'Olympiads', emoji: '🏅'},
];

// Academic years
const ACADEMIC_YEARS = ['2024-25', '2025-26'];

type Step = 1 | 2 | 3;

export function RegisterScreen() {
  const navigation = useNavigation<AuthStackScreenProps<'Register'>['navigation']>();
  const route = useRoute<AuthStackScreenProps<'Register'>['route']>();
  const {phone: initialPhone, isDirectRegistration} = route.params as {phone: string; isDirectRegistration?: boolean};

  // Step state
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Required fields
  const [phone, setPhone] = useState(initialPhone || '');
  const [studentName, setStudentName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedMedium, setSelectedMedium] = useState('');

  // Additional fields
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [section, setSection] = useState('');
  const [academicYear, setAcademicYear] = useState('2024-25');

  // Learning preferences
  const [learningStyle, setLearningStyle] = useState('');
  const [dailyStudyHours, setDailyStudyHours] = useState('');
  const [preferredStudyTime, setPreferredStudyTime] = useState<string[]>([]);
  const [careerGoal, setCareerGoal] = useState('');
  const [targetExam, setTargetExam] = useState('');

  const [loading, setLoading] = useState(false);
  const [showMediumModal, setShowMediumModal] = useState(false);

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

  const toggleStudyTime = (timeId: string) => {
    setPreferredStudyTime(prev => 
      prev.includes(timeId) 
        ? prev.filter(t => t !== timeId)
        : [...prev, timeId]
    );
  };

  const validateStep1 = () => {
    if (isDirectRegistration && phone.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return false;
    }
    if (!studentName.trim()) {
      Alert.alert('Error', 'Please enter student name');
      return false;
    }
    if (!schoolName.trim()) {
      Alert.alert('Error', 'Please enter school name');
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

  const handleRegister = () => {
    setLoading(true);

    // Collect all data
    const registrationData = {
      phone,
      studentName,
      schoolName,
      board: selectedBoard,
      classGrade: selectedClass,
      medium: selectedMedium,
      email,
      dateOfBirth,
      gender,
      section,
      academicYear,
      learningStyle,
      dailyStudyHours,
      preferredStudyTime,
      careerGoal,
      targetExam,
    };

    console.log('Registration Data:', registrationData);

    // Simulate registration
    setTimeout(() => {
      setLoading(false);
      
      if (isDirectRegistration) {
        // Need to verify phone first
        navigation.navigate('VerifyOTP', {phone, fromRegistration: true});
      } else {
        // Phone already verified, go to plan selection
        navigation.reset({
          index: 0,
          routes: [{name: 'SelectPlan', params: {userId: phone}}],
        });
      }
    }, 1500);
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
        label="Student Name *"
        placeholder="Enter full name"
        value={studentName}
        onChangeText={setStudentName}
        leftIcon="user"
        autoCapitalize="words"
      />

      <Input
        label="School Name *"
        placeholder="Enter school name"
        value={schoolName}
        onChangeText={setSchoolName}
        leftIcon="school"
      />

      {/* Board Selection */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.fieldLabel, {color: text}]}>Board of Education *</Text>
        <View style={styles.optionsGrid}>
          {BOARDS.map(board => (
            <TouchableOpacity
              key={board.id}
              style={[
                styles.optionCard,
                {
                  backgroundColor: card,
                  borderColor: selectedBoard === board.id ? primary : border,
                  borderWidth: selectedBoard === board.id ? 2 : 1,
                },
                Shadows.sm,
              ]}
              onPress={() => setSelectedBoard(board.id)}>
              <Text style={styles.optionEmoji}>{board.emoji}</Text>
              <Text style={[styles.optionName, {color: selectedBoard === board.id ? primary : text}]}>
                {board.name}
              </Text>
              {selectedBoard === board.id && (
                <View style={[styles.checkBadge, {backgroundColor: primary}]}>
                  <Icon name="check" size={10} color="#FFF" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Class Selection */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.fieldLabel, {color: text}]}>Class / Grade *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.classRow}>
            {CLASSES.map(cls => (
              <TouchableOpacity
                key={cls}
                style={[
                  styles.classChip,
                  {
                    backgroundColor: selectedClass === cls ? primary : card,
                    borderColor: selectedClass === cls ? primary : border,
                  },
                ]}
                onPress={() => setSelectedClass(cls)}>
                <Text style={[styles.classText, {color: selectedClass === cls ? '#FFF' : text}]}>
                  {cls}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
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
        label="Date of Birth (Optional)"
        placeholder="DD/MM/YYYY"
        value={dateOfBirth}
        onChangeText={(val) => {
          // Auto-format date
          let formatted = val.replace(/\D/g, '');
          if (formatted.length > 2) formatted = formatted.slice(0, 2) + '/' + formatted.slice(2);
          if (formatted.length > 5) formatted = formatted.slice(0, 5) + '/' + formatted.slice(5, 9);
          setDateOfBirth(formatted);
        }}
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

      <View style={styles.rowInputs}>
        <View style={styles.halfInput}>
          <Input
            label="Section (Optional)"
            placeholder="e.g., A, B, C"
            value={section}
            onChangeText={setSection}
            autoCapitalize="characters"
            maxLength={5}
          />
        </View>
        <View style={styles.halfInput}>
          <View style={styles.sectionContainer}>
            <Text style={[styles.fieldLabel, {color: text}]}>Academic Year</Text>
            <View style={styles.yearRow}>
              {ACADEMIC_YEARS.map(year => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.yearChip,
                    {
                      backgroundColor: academicYear === year ? primary : card,
                      borderColor: academicYear === year ? primary : border,
                    },
                  ]}
                  onPress={() => setAcademicYear(year)}>
                  <Text style={[styles.yearText, {color: academicYear === year ? '#FFF' : text}]}>
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
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
                {hour} hr{hour !== '1' && hour !== '6+' ? 's' : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Preferred Study Time */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.fieldLabel, {color: text}]}>Preferred study time (select multiple)</Text>
        <View style={styles.studyTimeGrid}>
          {STUDY_TIMES.map(time => (
            <TouchableOpacity
              key={time.id}
              style={[
                styles.studyTimeCard,
                {
                  backgroundColor: preferredStudyTime.includes(time.id) ? primaryBg : card,
                  borderColor: preferredStudyTime.includes(time.id) ? primary : border,
                },
              ]}
              onPress={() => toggleStudyTime(time.id)}>
              <Text style={styles.studyTimeEmoji}>{time.emoji}</Text>
              <Text style={[styles.studyTimeName, {color: preferredStudyTime.includes(time.id) ? primary : text}]}>
                {time.name}
              </Text>
              <Text style={[styles.studyTimeRange, {color: textMuted}]}>{time.time}</Text>
              {preferredStudyTime.includes(time.id) && (
                <View style={[styles.checkBadgeSmall, {backgroundColor: primary}]}>
                  <Icon name="check" size={8} color="#FFF" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Target Exam */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.fieldLabel, {color: text}]}>Target competitive exam</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.examRow}>
            {TARGET_EXAMS.map(exam => (
              <TouchableOpacity
                key={exam.id}
                style={[
                  styles.examChip,
                  {
                    backgroundColor: targetExam === exam.id ? primary : card,
                    borderColor: targetExam === exam.id ? primary : border,
                  },
                ]}
                onPress={() => setTargetExam(exam.id)}>
                <Text style={styles.examEmoji}>{exam.emoji}</Text>
                <Text style={[styles.examText, {color: targetExam === exam.id ? '#FFF' : text}]}>
                  {exam.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Career Goal */}
      <Input
        label="Career Goal / Aspiration (Optional)"
        placeholder="e.g., Doctor, Engineer, IAS Officer"
        value={careerGoal}
        onChangeText={setCareerGoal}
        leftIcon="target"
      />
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: background}]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Icon name="chevron-left" size={24} color={text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, {color: text}]}>Student Registration</Text>
            <Text style={[styles.headerStep, {color: textMuted}]}>Step {currentStep} of 3</Text>
          </View>
          {currentStep > 1 && (
            <TouchableOpacity onPress={handleSkip}>
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
            title={currentStep === 3 ? (isDirectRegistration ? 'Verify Phone 📱' : 'Complete Registration ✅') : 'Continue →'}
            onPress={handleNext}
            loading={loading}
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
  checkBadgeSmall: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 14,
    height: 14,
    borderRadius: 7,
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
  rowInputs: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  yearRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  yearChip: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  yearText: {
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
  studyTimeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  studyTimeCard: {
    width: '47%',
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    position: 'relative',
  },
  studyTimeEmoji: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  studyTimeName: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  studyTimeRange: {
    fontSize: FontSizes.xs,
    marginTop: 2,
  },
  examRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  examChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  examEmoji: {
    fontSize: 16,
  },
  examText: {
    fontSize: FontSizes.sm,
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
