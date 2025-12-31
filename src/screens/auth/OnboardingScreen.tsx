/**
 * Onboarding Screen
 * Multi-step wizard for student profile setup
 */

import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {Button, Input, Icon} from '../../components/ui';
import {BorderRadius, FontSizes, Spacing} from '../../constants/theme';

const BOARDS = [
  {id: 'cbse', name: 'CBSE', description: 'Central Board'},
  {id: 'icse', name: 'ICSE', description: 'CISCE Board'},
  {id: 'state', name: 'State Board', description: 'State Government'},
  {id: 'ib', name: 'IB', description: 'International'},
  {id: 'cambridge', name: 'Cambridge', description: 'IGCSE'},
];

const CLASSES = ['6th', '7th', '8th', '9th', '10th', '11th', '12th'];

const MEDIUMS = [
  {id: 'english', name: 'English'},
  {id: 'hindi', name: 'Hindi'},
  {id: 'tamil', name: 'Tamil'},
  {id: 'telugu', name: 'Telugu'},
  {id: 'kannada', name: 'Kannada'},
];

export function OnboardingScreen() {
  const navigation = useNavigation<any>();
  const [step, setStep] = useState(1);
  const [studentName, setStudentName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedMedium, setSelectedMedium] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');

  const totalSteps = 4;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [step]);

  const handleNext = () => {
    if (step < totalSteps) {
      fadeAnim.setValue(0);
      setStep(step + 1);
    } else {
      // Complete onboarding - navigate to main app
    }
  };

  const handleBack = () => {
    if (step > 1) {
      fadeAnim.setValue(0);
      setStep(step - 1);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return studentName.trim().length > 0;
      case 2:
        return selectedBoard !== '';
      case 3:
        return selectedClass !== '';
      case 4:
        return selectedMedium !== '';
      default:
        return false;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Let's Get Started";
      case 2:
        return 'Select Your Board';
      case 3:
        return 'Select Your Class';
      case 4:
        return 'Select Your Medium';
      default:
        return '';
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case 1:
        return 'Tell us a bit about yourself';
      case 2:
        return 'Choose your education board';
      case 3:
        return 'Which class are you in?';
      case 4:
        return 'Choose your preferred language';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: background}]}>
      {/* Header */}
      <View style={styles.header}>
        {step > 1 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Icon name="chevron-left" size={24} color={text} />
          </TouchableOpacity>
        )}
        <View style={styles.progressDots}>
          {[1, 2, 3, 4].map(i => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i <= step ? primary : border,
                  width: i === step ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Animated.View style={[styles.titleContainer, {opacity: fadeAnim}]}>
          <Text style={[styles.title, {color: text}]}>{getStepTitle()}</Text>
          <Text style={[styles.subtitle, {color: textSecondary}]}>
            {getStepSubtitle()}
          </Text>
        </Animated.View>

        {/* Step Content */}
        {step === 1 && (
          <Animated.View style={[styles.stepContent, {opacity: fadeAnim}]}>
            <Input
              label="Student Name"
              placeholder="Enter your name"
              value={studentName}
              onChangeText={setStudentName}
              leftIcon="user"
              autoCapitalize="words"
            />
            <Input
              label="School Name (Optional)"
              placeholder="Enter your school name"
              value={schoolName}
              onChangeText={setSchoolName}
              leftIcon="school"
            />
          </Animated.View>
        )}

        {step === 2 && (
          <Animated.View style={[styles.stepContent, {opacity: fadeAnim}]}>
            {BOARDS.map(board => (
              <TouchableOpacity
                key={board.id}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: card,
                    borderColor:
                      selectedBoard === board.id ? primary : border,
                  },
                  selectedBoard === board.id && styles.optionCardSelected,
                ]}
                onPress={() => setSelectedBoard(board.id)}>
                <View style={styles.optionContent}>
                  <Text style={[styles.optionTitle, {color: text}]}>
                    {board.name}
                  </Text>
                  <Text
                    style={[styles.optionDescription, {color: textSecondary}]}>
                    {board.description}
                  </Text>
                </View>
                {selectedBoard === board.id && (
                  <View style={[styles.checkIcon, {backgroundColor: primary}]}>
                    <Icon name="check" size={14} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}

        {step === 3 && (
          <Animated.View style={[styles.stepContent, {opacity: fadeAnim}]}>
            <View style={styles.classGrid}>
              {CLASSES.map(cls => (
                <TouchableOpacity
                  key={cls}
                  style={[
                    styles.classCard,
                    {
                      backgroundColor: card,
                      borderColor: selectedClass === cls ? primary : border,
                    },
                    selectedClass === cls && styles.classCardSelected,
                  ]}
                  onPress={() => setSelectedClass(cls)}>
                  <Text
                    style={[
                      styles.classText,
                      {color: selectedClass === cls ? primary : text},
                    ]}>
                    {cls}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}

        {step === 4 && (
          <Animated.View style={[styles.stepContent, {opacity: fadeAnim}]}>
            {MEDIUMS.map(medium => (
              <TouchableOpacity
                key={medium.id}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: card,
                    borderColor:
                      selectedMedium === medium.id ? primary : border,
                  },
                  selectedMedium === medium.id && styles.optionCardSelected,
                ]}
                onPress={() => setSelectedMedium(medium.id)}>
                <View style={styles.optionContent}>
                  <Text style={[styles.optionTitle, {color: text}]}>
                    {medium.name}
                  </Text>
                </View>
                {selectedMedium === medium.id && (
                  <View style={[styles.checkIcon, {backgroundColor: primary}]}>
                    <Icon name="check" size={14} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title={step === totalSteps ? 'Get Started' : 'Continue'}
          onPress={handleNext}
          disabled={!canProceed()}
          fullWidth
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  progressDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  placeholder: {width: 44},
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.xl,
  },
  titleContainer: {
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
  stepContent: {
    flex: 1,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    marginBottom: Spacing.md,
  },
  optionCardSelected: {
    borderWidth: 2,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: FontSizes.sm,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  classGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  classCard: {
    width: '30%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
  },
  classCardSelected: {
    borderWidth: 2,
  },
  classText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  footer: {
    padding: Spacing.xl,
    paddingTop: Spacing.md,
  },
});
