/**
 * Profile Screen - Orange Theme
 * Student profile and settings with all working features
 */

import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Animated,
  Modal,
  TextInput,
  Linking,
  useColorScheme,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {useAuth} from '../../context/AuthContext';
import {Avatar, Badge, Card, Icon} from '../../components/ui';
import {BorderRadius, FontSizes, Shadows, Spacing} from '../../constants/theme';

const BOARDS = ['CBSE', 'ICSE', 'State Board', 'IB', 'Cambridge'];
const CLASSES = ['6th', '7th', '8th', '9th', '10th', '11th', '12th'];

export function ProfileScreen() {
  const navigation = useNavigation<any>();
  const {logout} = useAuth();
  const systemColorScheme = useColorScheme();
  
  // Student data state
  const [student, setStudent] = useState({
    name: 'Rahul Kumar',
    email: 'rahul.kumar@email.com',
    phone: '9876543210',
    class: '10th',
    board: 'CBSE',
    streak: 7,
    xp: 2450,
    level: 12,
    badges: 8,
  });

  // Modal states
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showClassBoard, setShowClassBoard] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showContactUs, setShowContactUs] = useState(false);

  // Edit profile form state
  const [editName, setEditName] = useState(student.name);
  const [editEmail, setEditEmail] = useState(student.email);
  const [editPhone, setEditPhone] = useState(student.phone);

  // Class & Board selection state
  const [selectedClass, setSelectedClass] = useState(student.class);
  const [selectedBoard, setSelectedBoard] = useState(student.board);

  // Dark mode state
  const [darkModeEnabled, setDarkModeEnabled] = useState(systemColorScheme === 'dark');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const primary = useThemeColor({}, 'primary');
  const primaryBg = useThemeColor({}, 'primaryBackground');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const error = useThemeColor({}, 'error');
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
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout(),
        },
      ],
    );
  };

  const handleSaveProfile = () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!editEmail.trim() || !editEmail.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }
    if (!editPhone.trim() || editPhone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setStudent(prev => ({
      ...prev,
      name: editName.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim(),
    }));
    setShowEditProfile(false);
    Alert.alert('Success', 'Profile updated successfully! ✅');
  };

  const handleSaveClassBoard = () => {
    setStudent(prev => ({
      ...prev,
      class: selectedClass,
      board: selectedBoard,
    }));
    setShowClassBoard(false);
    Alert.alert('Success', 'Class & Board updated successfully! 🎓');
  };

  const handleDarkModeToggle = (value: boolean) => {
    setDarkModeEnabled(value);
    Alert.alert(
      'Theme Changed',
      `Dark mode ${value ? 'enabled' : 'disabled'}. Restart the app for full effect.`,
      [{text: 'OK'}]
    );
  };

  const handleRateApp = () => {
    Alert.alert(
      'Rate AI Tutor ⭐',
      'Enjoying the app? Please rate us on the Play Store!',
      [
        {text: 'Maybe Later', style: 'cancel'},
        {
          text: 'Rate Now',
          onPress: () => {
            // Replace with your actual Play Store URL
            Linking.openURL('https://play.google.com/store/apps/details?id=com.aitutorpp');
          },
        },
      ]
    );
  };

  const handleContactEmail = () => {
    Linking.openURL('mailto:support@kasoftware.com?subject=AI Tutor App Support');
  };

  const handleContactPhone = () => {
    Linking.openURL('tel:+919876543210');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/919876543210?text=Hi, I need help with AI Tutor App');
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: background}]}
      edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <Animated.View
          style={[
            styles.profileHeader,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          <View style={[styles.avatarRing, {borderColor: primary}]}>
            <Avatar name={student.name} size="xl" />
          </View>
          <Text style={[styles.name, {color: text}]}>{student.name} 🔥</Text>
          <View style={styles.badges}>
            <Badge
              label={`${student.class} • ${student.board}`}
              variant="primary"
            />
            <Badge 
              label={`⚡ Level ${student.level}`} 
              variant="level" 
            />
          </View>
        </Animated.View>

        {/* Stats */}
        <Animated.View
          style={[
            styles.statsRow,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          <StatCard
            icon="flame"
            value={student.streak}
            label="Day Streak 🔥"
            color="#EF4444"
            cardColor={card}
            textColor={text}
            textSecondary={textSecondary}
          />
          <StatCard
            icon="star"
            value={student.xp.toLocaleString()}
            label="XP Points ⭐"
            color="#F97316"
            cardColor={card}
            textColor={text}
            textSecondary={textSecondary}
          />
          <StatCard
            icon="trophy"
            value={student.badges}
            label="Badges 🏆"
            color="#FBBF24"
            cardColor={card}
            textColor={text}
            textSecondary={textSecondary}
          />
        </Animated.View>

        {/* Account Section */}
        <Animated.View
          style={[
            styles.menuSection,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          <Text style={[styles.sectionTitle, {color: textSecondary}]}>
            ACCOUNT
          </Text>
          <Card padding="sm">
            <MenuItem
              icon="user"
              label="Edit Profile"
              emoji="✏️"
              primaryColor={primary}
              textColor={text}
              textMuted={textMuted}
              onPress={() => {
                setEditName(student.name);
                setEditEmail(student.email);
                setEditPhone(student.phone);
                setShowEditProfile(true);
              }}
            />
            <View style={[styles.divider, {backgroundColor: border}]} />
            <MenuItem
              icon="graduation-cap"
              label="Class & Board"
              value={`${student.class} • ${student.board}`}
              emoji="🎓"
              primaryColor={primary}
              textColor={text}
              textMuted={textMuted}
              onPress={() => {
                setSelectedClass(student.class);
                setSelectedBoard(student.board);
                setShowClassBoard(true);
              }}
            />
          </Card>
        </Animated.View>

        {/* Preferences Section */}
        <Animated.View
          style={[
            styles.menuSection,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          <Text style={[styles.sectionTitle, {color: textSecondary}]}>
            PREFERENCES
          </Text>
          <Card padding="sm">
            <MenuItem
              icon="bell"
              label="Notifications"
              emoji="🔔"
              primaryColor={primary}
              textColor={text}
              textMuted={textMuted}
              onPress={() => navigation.navigate('NotificationSettings')}
            />
            <View style={[styles.divider, {backgroundColor: border}]} />
            <View style={styles.menuItem}>
              <View style={[styles.menuIcon, {backgroundColor: primaryBg}]}>
                <Icon name="moon" size={18} color={primary} />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuLabel, {color: text}]}>
                  Dark Mode 🌙
                </Text>
              </View>
              <Switch
                value={darkModeEnabled}
                onValueChange={handleDarkModeToggle}
                trackColor={{false: '#D1D5DB', true: `${primary}60`}}
                thumbColor={darkModeEnabled ? primary : '#F3F4F6'}
              />
            </View>
          </Card>
        </Animated.View>

        {/* Support Section */}
        <Animated.View
          style={[
            styles.menuSection,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          <Text style={[styles.sectionTitle, {color: textSecondary}]}>
            SUPPORT
          </Text>
          <Card padding="sm">
            <MenuItem
              icon="help-circle"
              label="Help Center"
              emoji="❓"
              primaryColor={primary}
              textColor={text}
              textMuted={textMuted}
              onPress={() => setShowHelpCenter(true)}
            />
            <View style={[styles.divider, {backgroundColor: border}]} />
            <MenuItem
              icon="mail"
              label="Contact Us"
              emoji="📧"
              primaryColor={primary}
              textColor={text}
              textMuted={textMuted}
              onPress={() => setShowContactUs(true)}
            />
            <View style={[styles.divider, {backgroundColor: border}]} />
            <MenuItem
              icon="star"
              label="Rate App"
              emoji="⭐"
              primaryColor={primary}
              textColor={text}
              textMuted={textMuted}
              onPress={handleRateApp}
            />
          </Card>
        </Animated.View>

        {/* Logout Section */}
        <Animated.View
          style={[
            styles.menuSection,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          <Card padding="sm">
            <MenuItem
              icon="log-out"
              label="Logout"
              danger
              errorColor={error}
              primaryColor={primary}
              textColor={text}
              textMuted={textMuted}
              onPress={handleLogout}
            />
          </Card>
        </Animated.View>

        <Text style={[styles.version, {color: textMuted}]}>
          Version 1.0.0 • Powered by KA Software
        </Text>

        <View style={{height: Spacing['2xl']}} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditProfile}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditProfile(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {backgroundColor: card}]}>
            <View style={[styles.modalHeader, {borderBottomColor: border}]}>
              <Text style={[styles.modalTitle, {color: text}]}>Edit Profile ✏️</Text>
              <TouchableOpacity onPress={() => setShowEditProfile(false)}>
                <Icon name="x" size={24} color={textMuted} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={[styles.inputLabel, {color: textSecondary}]}>Full Name</Text>
              <TextInput
                style={[styles.input, {backgroundColor: background, color: text, borderColor: border}]}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your name"
                placeholderTextColor={textMuted}
              />

              <Text style={[styles.inputLabel, {color: textSecondary}]}>Email Address</Text>
              <TextInput
                style={[styles.input, {backgroundColor: background, color: text, borderColor: border}]}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="Enter your email"
                placeholderTextColor={textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={[styles.inputLabel, {color: textSecondary}]}>Phone Number</Text>
              <TextInput
                style={[styles.input, {backgroundColor: background, color: text, borderColor: border}]}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="Enter your phone"
                placeholderTextColor={textMuted}
                keyboardType="phone-pad"
                maxLength={10}
              />

              <TouchableOpacity
                style={[styles.saveButton, {backgroundColor: primary}]}
                onPress={handleSaveProfile}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Class & Board Modal */}
      <Modal
        visible={showClassBoard}
        transparent
        animationType="slide"
        onRequestClose={() => setShowClassBoard(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {backgroundColor: card}]}>
            <View style={[styles.modalHeader, {borderBottomColor: border}]}>
              <Text style={[styles.modalTitle, {color: text}]}>Class & Board 🎓</Text>
              <TouchableOpacity onPress={() => setShowClassBoard(false)}>
                <Icon name="x" size={24} color={textMuted} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={[styles.inputLabel, {color: textSecondary}]}>Select Class</Text>
              <View style={styles.optionsGrid}>
                {CLASSES.map(cls => (
                  <TouchableOpacity
                    key={cls}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: selectedClass === cls ? primary : background,
                        borderColor: selectedClass === cls ? primary : border,
                      },
                    ]}
                    onPress={() => setSelectedClass(cls)}>
                    <Text
                      style={[
                        styles.optionText,
                        {color: selectedClass === cls ? '#FFF' : text},
                      ]}>
                      {cls}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, {color: textSecondary, marginTop: Spacing.lg}]}>
                Select Board
              </Text>
              <View style={styles.optionsGrid}>
                {BOARDS.map(board => (
                  <TouchableOpacity
                    key={board}
                    style={[
                      styles.optionButton,
                      styles.optionButtonWide,
                      {
                        backgroundColor: selectedBoard === board ? primary : background,
                        borderColor: selectedBoard === board ? primary : border,
                      },
                    ]}
                    onPress={() => setSelectedBoard(board)}>
                    <Text
                      style={[
                        styles.optionText,
                        {color: selectedBoard === board ? '#FFF' : text},
                      ]}>
                      {board}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.saveButton, {backgroundColor: primary}]}
                onPress={handleSaveClassBoard}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Help Center Modal */}
      <Modal
        visible={showHelpCenter}
        transparent
        animationType="slide"
        onRequestClose={() => setShowHelpCenter(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {backgroundColor: card}]}>
            <View style={[styles.modalHeader, {borderBottomColor: border}]}>
              <Text style={[styles.modalTitle, {color: text}]}>Help Center ❓</Text>
              <TouchableOpacity onPress={() => setShowHelpCenter(false)}>
                <Icon name="x" size={24} color={textMuted} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <FAQItem
                question="How do I start learning?"
                answer="Go to the Learn tab, select a subject, choose a chapter, and start with any lesson. You can watch videos, read notes, and take quizzes."
                textColor={text}
                textMuted={textMuted}
                border={border}
              />
              <FAQItem
                question="How does the streak system work?"
                answer="Complete at least one lesson every day to maintain your streak. Your streak resets if you miss a day. Keep learning to earn XP and badges!"
                textColor={text}
                textMuted={textMuted}
                border={border}
              />
              <FAQItem
                question="How do I change my subscription?"
                answer="Go to Profile > Manage Subscription to view your current plan and upgrade options. You can upgrade anytime to access premium features."
                textColor={text}
                textMuted={textMuted}
                border={border}
              />
              <FAQItem
                question="Can I download lessons for offline viewing?"
                answer="Yes! Premium users can download videos and notes for offline access. Look for the download icon on any lesson."
                textColor={text}
                textMuted={textMuted}
                border={border}
              />
              <FAQItem
                question="How do I ask doubts?"
                answer="Tap the 'Ask Doubt' button on the home screen or within any lesson. Our AI tutor will help answer your questions instantly."
                textColor={text}
                textMuted={textMuted}
                border={border}
              />
              <FAQItem
                question="How are quizzes scored?"
                answer="Each correct answer gives you XP points. Complete quizzes faster for bonus points. Your scores contribute to your level and leaderboard ranking."
                textColor={text}
                textMuted={textMuted}
                border={border}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Contact Us Modal */}
      <Modal
        visible={showContactUs}
        transparent
        animationType="slide"
        onRequestClose={() => setShowContactUs(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {backgroundColor: card, maxHeight: '60%'}]}>
            <View style={[styles.modalHeader, {borderBottomColor: border}]}>
              <Text style={[styles.modalTitle, {color: text}]}>Contact Us 📧</Text>
              <TouchableOpacity onPress={() => setShowContactUs(false)}>
                <Icon name="x" size={24} color={textMuted} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={[styles.contactIntro, {color: textSecondary}]}>
                We're here to help! Reach out to us through any of these channels:
              </Text>

              <TouchableOpacity
                style={[styles.contactOption, {backgroundColor: background, borderColor: border}]}
                onPress={handleContactEmail}>
                <View style={[styles.contactIcon, {backgroundColor: `${primary}15`}]}>
                  <Icon name="mail" size={20} color={primary} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactLabel, {color: text}]}>Email Support</Text>
                  <Text style={[styles.contactValue, {color: textMuted}]}>support@kasoftware.com</Text>
                </View>
                <Icon name="chevron-right" size={20} color={textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.contactOption, {backgroundColor: background, borderColor: border}]}
                onPress={handleContactPhone}>
                <View style={[styles.contactIcon, {backgroundColor: '#22C55E15'}]}>
                  <Icon name="phone" size={20} color="#22C55E" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactLabel, {color: text}]}>Phone Support</Text>
                  <Text style={[styles.contactValue, {color: textMuted}]}>+91 98765 43210</Text>
                </View>
                <Icon name="chevron-right" size={20} color={textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.contactOption, {backgroundColor: background, borderColor: border}]}
                onPress={handleWhatsApp}>
                <View style={[styles.contactIcon, {backgroundColor: '#25D36615'}]}>
                  <Icon name="message-circle" size={20} color="#25D366" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactLabel, {color: text}]}>WhatsApp</Text>
                  <Text style={[styles.contactValue, {color: textMuted}]}>Chat with us</Text>
                </View>
                <Icon name="chevron-right" size={20} color={textMuted} />
              </TouchableOpacity>

              <Text style={[styles.responseTime, {color: textMuted}]}>
                📞 We typically respond within 24 hours
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function StatCard({
  icon,
  value,
  label,
  color,
  cardColor,
  textColor,
  textSecondary,
}: {
  icon: string;
  value: number | string;
  label: string;
  color: string;
  cardColor: string;
  textColor: string;
  textSecondary: string;
}) {
  return (
    <View style={[styles.statCard, {backgroundColor: cardColor}, Shadows.sm]}>
      <View style={[styles.statIcon, {backgroundColor: `${color}15`}]}>
        <Icon name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, {color: textColor}]}>{value}</Text>
      <Text style={[styles.statLabel, {color: textSecondary}]}>{label}</Text>
    </View>
  );
}

function MenuItem({
  icon,
  label,
  value,
  emoji,
  danger,
  errorColor,
  primaryColor,
  textColor,
  textMuted,
  onPress,
}: {
  icon: string;
  label: string;
  value?: string;
  emoji?: string;
  danger?: boolean;
  errorColor?: string;
  primaryColor: string;
  textColor: string;
  textMuted: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View
        style={[
          styles.menuIcon,
          {backgroundColor: danger ? `${errorColor}15` : `${primaryColor}15`},
        ]}>
        <Icon
          name={icon}
          size={18}
          color={danger ? errorColor : primaryColor}
        />
      </View>
      <View style={styles.menuContent}>
        <Text
          style={[styles.menuLabel, {color: danger ? errorColor : textColor}]}>
          {label} {emoji}
        </Text>
        {value && (
          <Text style={[styles.menuValue, {color: textMuted}]}>{value}</Text>
        )}
      </View>
      <Icon name="chevron-right" size={16} color={textMuted} />
    </TouchableOpacity>
  );
}

function FAQItem({
  question,
  answer,
  textColor,
  textMuted,
  border,
}: {
  question: string;
  answer: string;
  textColor: string;
  textMuted: string;
  border: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={[styles.faqItem, {borderBottomColor: border}]}
      onPress={() => setExpanded(!expanded)}>
      <View style={styles.faqHeader}>
        <Text style={[styles.faqQuestion, {color: textColor}]}>{question}</Text>
        <Icon
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={textMuted}
        />
      </View>
      {expanded && (
        <Text style={[styles.faqAnswer, {color: textMuted}]}>{answer}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  scrollContent: {padding: Spacing.lg},
  profileHeader: {alignItems: 'center', marginBottom: Spacing.xl},
  avatarRing: {
    borderWidth: 3,
    borderRadius: BorderRadius.full,
    padding: 3,
    marginBottom: Spacing.md,
  },
  name: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  badges: {
    flexDirection: 'row', 
    gap: Spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    padding: Spacing.base,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
  },
  statLabel: {fontSize: FontSizes.xs, marginTop: 2, textAlign: 'center'},
  menuSection: {marginBottom: Spacing.lg},
  sectionTitle: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuContent: {flex: 1},
  menuLabel: {fontSize: FontSizes.base, fontWeight: '500'},
  menuValue: {fontSize: FontSizes.sm, marginTop: 2},
  divider: {height: 1, marginLeft: 54},
  version: {
    textAlign: 'center',
    fontSize: FontSizes.sm,
    marginTop: Spacing.lg,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  modalBody: {
    padding: Spacing.lg,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: FontSizes.base,
    marginBottom: Spacing.lg,
  },
  saveButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    minWidth: 60,
    alignItems: 'center',
  },
  optionButtonWide: {
    minWidth: 100,
  },
  optionText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  // FAQ styles
  faqItem: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  faqAnswer: {
    fontSize: FontSizes.sm,
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  // Contact styles
  contactIntro: {
    fontSize: FontSizes.sm,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  contactValue: {
    fontSize: FontSizes.xs,
    marginTop: 2,
  },
  responseTime: {
    fontSize: FontSizes.xs,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});
