/**
 * Register Screen - Registration with Validation and Auto-Focus
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
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {useAuth} from '../../context';
import {contentApi} from '../../services/api';
import {Button, Icon} from '../../components/ui';
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

// Error state interface
interface FormErrors {
  phone?: string;
  fullName?: string;
  studentName?: string;
  email?: string;
  password?: string;
  board?: string;
  class?: string;
  medium?: string;
}

// Custom Input with validation and ref support
interface ValidatedInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  required?: boolean;
  leftIcon?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  secureTextEntry?: boolean;
  maxLength?: number;
  editable?: boolean;
  inputRef?: React.RefObject<TextInput>;
  onSubmitEditing?: () => void;
  returnKeyType?: 'done' | 'next' | 'go';
}

function ValidatedInput({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  required,
  leftIcon,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  secureTextEntry = false,
  maxLength,
  editable = true,
  inputRef,
  onSubmitEditing,
  returnKeyType = 'next',
}: ValidatedInputProps) {
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const primary = useThemeColor({}, 'primary');

  const hasError = !!error;
  const borderColor = hasError ? '#EF4444' : value ? primary : border;

  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.inputLabel, {color: hasError ? '#EF4444' : text}]}>
        {label} {required && <Text style={{color: '#EF4444'}}>*</Text>}
      </Text>
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: card,
            borderColor,
            borderWidth: hasError ? 2 : 1.5,
          },
        ]}>
        {leftIcon && (
          <Icon
            name={leftIcon}
            size={18}
            color={hasError ? '#EF4444' : textMuted}
            style={styles.inputIcon}
          />
        )}
        <TextInput
          ref={inputRef}
          style={[styles.textInput, {color: text}]}
          placeholder={placeholder}
          placeholderTextColor={textMuted}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
          maxLength={maxLength}
          editable={editable}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          blurOnSubmit={false}
        />
      </View>
      {hasError && (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={14} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

export function RegisterScreen() {
  const navigation = useNavigation<AuthStackScreenProps<'Register'>['navigation']>();
  const route = useRoute<AuthStackScreenProps<'Register'>['route']>();
  const {register, sendOtp} = useAuth();
  const {phone: initialPhone, isDirectRegistration} = route.params as {phone: string; isDirectRegistration?: boolean};

  // Input refs for focus management
  const phoneInputRef = useRef<TextInput>(null);
  const fullNameInputRef = useRef<TextInput>(null);
  const studentNameInputRef = useRef<TextInput>(null);
  const schoolNameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const dobInputRef = useRef<TextInput>(null);
  const sectionInputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

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

  // Validation errors
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

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

  // Load boards on mount
  useEffect(() => {
    loadBoards();
  }, []);

  // Load classes when board changes
  useEffect(() => {
    if (selectedBoard) {
      loadClasses(selectedBoard.id);
      if (errors.board) {
        setErrors(prev => ({...prev, board: undefined}));
      }
    } else {
      setClasses([]);
      setSelectedClass(null);
    }
  }, [selectedBoard]);

  // Clear class error when selected
  useEffect(() => {
    if (selectedClass && errors.class) {
      setErrors(prev => ({...prev, class: undefined}));
    }
  }, [selectedClass]);

  // Clear medium error when selected
  useEffect(() => {
    if (selectedMedium && errors.medium) {
      setErrors(prev => ({...prev, medium: undefined}));
    }
  }, [selectedMedium]);

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

  // Validation functions
  const validatePhone = (value: string): string | undefined => {
    if (!value.trim()) return 'Mobile number is required';
    if (!/^\d{10}$/.test(value)) return 'Please enter a valid 10-digit mobile number';
    return undefined;
  };

  const validateFullName = (value: string): string | undefined => {
    if (!value.trim()) return 'Full name is required';
    if (value.trim().length < 2) return 'Name must be at least 2 characters';
    if (!/^[a-zA-Z\s]+$/.test(value.trim())) return 'Name should only contain letters';
    return undefined;
  };

  const validateStudentName = (value: string): string | undefined => {
    if (!value.trim()) return 'Student name is required';
    if (value.trim().length < 2) return 'Name must be at least 2 characters';
    if (!/^[a-zA-Z\s]+$/.test(value.trim())) return 'Name should only contain letters';
    return undefined;
  };

  const validateEmail = (value: string): string | undefined => {
    if (!value) return undefined;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Please enter a valid email address';
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) return undefined;
    if (value.length < 6) return 'Password must be at least 6 characters';
    return undefined;
  };

  // Handle field change with validation
  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 10);
    setPhone(cleaned);
    if (touched.phone) {
      setErrors(prev => ({...prev, phone: validatePhone(cleaned)}));
    }
  };

  const handleFullNameChange = (value: string) => {
    setFullName(value);
    if (touched.fullName) {
      setErrors(prev => ({...prev, fullName: validateFullName(value)}));
    }
  };

  const handleStudentNameChange = (value: string) => {
    setStudentName(value);
    if (touched.studentName) {
      setErrors(prev => ({...prev, studentName: validateStudentName(value)}));
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (touched.email) {
      setErrors(prev => ({...prev, email: validateEmail(value)}));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (touched.password) {
      setErrors(prev => ({...prev, password: validatePassword(value)}));
    }
  };

  // Focus on first error field
  const focusFirstError = (newErrors: FormErrors) => {
    // Scroll to top first
    scrollViewRef.current?.scrollTo({y: 0, animated: true});

    // Determine which field to focus based on error priority
    setTimeout(() => {
      if (newErrors.phone && isDirectRegistration) {
        phoneInputRef.current?.focus();
      } else if (newErrors.fullName) {
        fullNameInputRef.current?.focus();
      } else if (newErrors.studentName) {
        studentNameInputRef.current?.focus();
      }
      // For board, class, medium - we show visual error but can't focus
    }, 300);
  };

  const focusFirstErrorStep2 = (newErrors: FormErrors) => {
    scrollViewRef.current?.scrollTo({y: 0, animated: true});
    
    setTimeout(() => {
      if (newErrors.email) {
        emailInputRef.current?.focus();
      } else if (newErrors.password) {
        passwordInputRef.current?.focus();
      }
    }, 300);
  };

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validate phone (only for direct registration)
    if (isDirectRegistration) {
      const phoneError = validatePhone(phone);
      if (phoneError) {
        newErrors.phone = phoneError;
        isValid = false;
      }
    }

    // Validate full name
    const fullNameError = validateFullName(fullName);
    if (fullNameError) {
      newErrors.fullName = fullNameError;
      isValid = false;
    }

    // Validate student name
    const studentNameError = validateStudentName(studentName);
    if (studentNameError) {
      newErrors.studentName = studentNameError;
      isValid = false;
    }

    // Validate board
    if (!selectedBoard) {
      newErrors.board = 'Please select your board';
      isValid = false;
    }

    // Validate class
    if (!selectedClass) {
      newErrors.class = 'Please select your class';
      isValid = false;
    }

    // Validate medium
    if (!selectedMedium) {
      newErrors.medium = 'Please select your medium of instruction';
      isValid = false;
    }

    setErrors(newErrors);
    setTouched({
      phone: true,
      fullName: true,
      studentName: true,
      board: true,
      class: true,
      medium: true,
    });

    // Focus on first error field
    if (!isValid) {
      focusFirstError(newErrors);
    }

    return isValid;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {...errors};
    let isValid = true;

    // Email (optional but validate format if provided)
    const emailError = validateEmail(email);
    if (emailError) {
      newErrors.email = emailError;
      isValid = false;
    }

    // Password (optional but validate if provided)
    const passwordError = validatePassword(password);
    if (passwordError) {
      newErrors.password = passwordError;
      isValid = false;
    }

    setErrors(newErrors);

    // Focus on first error field
    if (!isValid) {
      focusFirstErrorStep2(newErrors);
    }

    return isValid;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
    } else if (currentStep === 2) {
      if (!validateStep2()) return;
    }
    
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
      const registerSuccess = await register({
        fullName,
        phone,
        email: email || undefined,
        password: password || undefined,
      });

      if (registerSuccess) {
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
          <Text style={[styles.fieldLabel, {color: errors.phone ? '#EF4444' : text}]}>
            Mobile Number <Text style={{color: '#EF4444'}}>*</Text>
          </Text>
          <View style={styles.phoneRow}>
            <View style={[styles.countryCode, {backgroundColor: primaryBg, borderColor: errors.phone ? '#EF4444' : border}]}>
              <Text style={[styles.countryCodeText, {color: text}]}>🇮🇳 +91</Text>
            </View>
            <View style={styles.phoneInputFlex}>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: card,
                    borderColor: errors.phone ? '#EF4444' : phone ? primary : border,
                    borderWidth: errors.phone ? 2 : 1.5,
                  },
                ]}>
                <TextInput
                  ref={phoneInputRef}
                  style={[styles.textInput, {color: text}]}
                  placeholder="Enter mobile number"
                  placeholderTextColor={textMuted}
                  value={phone}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  maxLength={10}
                  returnKeyType="next"
                  onSubmitEditing={() => fullNameInputRef.current?.focus()}
                  blurOnSubmit={false}
                />
              </View>
            </View>
          </View>
          {errors.phone && (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={14} color="#EF4444" />
              <Text style={styles.errorText}>{errors.phone}</Text>
            </View>
          )}
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

      <ValidatedInput
        label="Your Full Name"
        placeholder="Enter your name (parent/guardian)"
        value={fullName}
        onChangeText={handleFullNameChange}
        error={errors.fullName}
        required
        leftIcon="user"
        autoCapitalize="words"
        inputRef={fullNameInputRef}
        onSubmitEditing={() => studentNameInputRef.current?.focus()}
        returnKeyType="next"
      />

      <ValidatedInput
        label="Student Name"
        placeholder="Enter student's full name"
        value={studentName}
        onChangeText={handleStudentNameChange}
        error={errors.studentName}
        required
        leftIcon="users"
        autoCapitalize="words"
        inputRef={studentNameInputRef}
        onSubmitEditing={() => schoolNameInputRef.current?.focus()}
        returnKeyType="next"
      />

      <ValidatedInput
        label="School Name"
        placeholder="Enter school name (optional)"
        value={schoolName}
        onChangeText={setSchoolName}
        leftIcon="home"
        inputRef={schoolNameInputRef}
        returnKeyType="done"
      />

      {/* Board Selection */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.fieldLabel, {color: errors.board ? '#EF4444' : text}]}>
          Board of Education <Text style={{color: '#EF4444'}}>*</Text>
        </Text>
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
                    borderColor: selectedBoard?.id === board.id ? primary : errors.board ? '#EF4444' : border,
                    borderWidth: selectedBoard?.id === board.id ? 2 : errors.board ? 2 : 1,
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
        {errors.board && (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={14} color="#EF4444" />
            <Text style={styles.errorText}>{errors.board}</Text>
          </View>
        )}
      </View>

      {/* Class Selection */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.fieldLabel, {color: errors.class ? '#EF4444' : text}]}>
          Class / Grade <Text style={{color: '#EF4444'}}>*</Text>
        </Text>
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
                      borderColor: selectedClass?.id === cls.id ? primary : errors.class ? '#EF4444' : border,
                      borderWidth: errors.class && !selectedClass ? 2 : 1,
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
        {errors.class && (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={14} color="#EF4444" />
            <Text style={styles.errorText}>{errors.class}</Text>
          </View>
        )}
      </View>

      {/* Medium Selection */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.fieldLabel, {color: errors.medium ? '#EF4444' : text}]}>
          Medium of Instruction <Text style={{color: '#EF4444'}}>*</Text>
        </Text>
        <TouchableOpacity
          style={[
            styles.selectButton,
            {
              backgroundColor: card,
              borderColor: selectedMedium ? primary : errors.medium ? '#EF4444' : border,
              borderWidth: errors.medium && !selectedMedium ? 2 : 1.5,
            },
          ]}
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
            <Text style={[styles.selectPlaceholder, {color: errors.medium ? '#EF4444' : textMuted}]}>
              Select medium
            </Text>
          )}
          <Icon name="chevron-down" size={20} color={errors.medium ? '#EF4444' : textMuted} />
        </TouchableOpacity>
        {errors.medium && (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={14} color="#EF4444" />
            <Text style={styles.errorText}>{errors.medium}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View style={[styles.stepContent, {opacity: fadeAnim, transform: [{translateY: slideAnim}]}]}>
      <Text style={[styles.stepTitle, {color: text}]}>Additional Details 📝</Text>
      <Text style={[styles.stepSubtitle, {color: textSecondary}]}>
        Help us personalize your experience (Optional)
      </Text>

      <ValidatedInput
        label="Email"
        placeholder="Enter email address"
        value={email}
        onChangeText={handleEmailChange}
        error={errors.email}
        leftIcon="mail"
        keyboardType="email-address"
        autoCapitalize="none"
        inputRef={emailInputRef}
        onSubmitEditing={() => passwordInputRef.current?.focus()}
        returnKeyType="next"
      />

      <ValidatedInput
        label="Password"
        placeholder="Create a password (min 6 characters)"
        value={password}
        onChangeText={handlePasswordChange}
        error={errors.password}
        leftIcon="lock"
        secureTextEntry
        inputRef={passwordInputRef}
        onSubmitEditing={() => dobInputRef.current?.focus()}
        returnKeyType="next"
      />

      <ValidatedInput
        label="Date of Birth"
        placeholder="YYYY-MM-DD"
        value={dateOfBirth}
        onChangeText={setDateOfBirth}
        leftIcon="calendar"
        keyboardType="number-pad"
        maxLength={10}
        inputRef={dobInputRef}
        returnKeyType="done"
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

      <ValidatedInput
        label="Section"
        placeholder="e.g., A, B, C"
        value={section}
        onChangeText={setSection}
        autoCapitalize="characters"
        maxLength={5}
        inputRef={sectionInputRef}
        returnKeyType="done"
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
            <Text style={[styles.headerTitle, {color: text}]}>Registration</Text>
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
          ref={scrollViewRef}
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
  // Input styles
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.base,
    minHeight: 52,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: FontSizes.base,
    paddingVertical: Spacing.md,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    gap: Spacing.xs,
  },
  errorText: {
    color: '#EF4444',
    fontSize: FontSizes.xs,
    fontWeight: '500',
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
