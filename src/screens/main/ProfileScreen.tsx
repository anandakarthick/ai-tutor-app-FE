/**
 * Profile Screen - with API integration
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
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {useAuth, useStudent} from '../../context';
import {useProgress} from '../../hooks';
import {Avatar, Badge, Card, Icon} from '../../components/ui';
import {BorderRadius, FontSizes, Shadows, Spacing} from '../../constants/theme';

export function ProfileScreen() {
  const navigation = useNavigation<any>();
  const {user, logout} = useAuth();
  const {currentStudent, updateStudent} = useStudent();
  const {streak} = useProgress();
  const systemColorScheme = useColorScheme();
  
  // Modal states
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showContactUs, setShowContactUs] = useState(false);

  // Edit profile form state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {toValue: 1, duration: 600, useNativeDriver: true}),
      Animated.timing(slideAnim, {toValue: 0, duration: 600, useNativeDriver: true}),
    ]).start();
  }, []);

  // Get display data
  const displayName = currentStudent?.studentName || user?.fullName || 'Student';
  const displayEmail = user?.email || '';
  const displayPhone = user?.phone || '';
  const displayClass = currentStudent?.class?.displayName || currentStudent?.class?.className || '10th';
  const displayBoard = currentStudent?.board?.name || 'CBSE';
  const studentXp = currentStudent?.xp || 0;
  const studentLevel = currentStudent?.level || 1;
  const studentStreak = streak.streakDays || currentStudent?.streakDays || 0;

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Logout', style: 'destructive', onPress: () => logout()},
    ]);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setSaving(true);
    try {
      if (currentStudent) {
        await updateStudent(currentStudent.id, {studentName: editName.trim()});
      }
      setShowEditProfile(false);
      Alert.alert('Success', 'Profile updated successfully! ✅');
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDarkModeToggle = (value: boolean) => {
    setDarkModeEnabled(value);
    Alert.alert('Theme Changed', `Dark mode ${value ? 'enabled' : 'disabled'}. Restart the app for full effect.`);
  };

  const handleRateApp = () => {
    Alert.alert('Rate AI Tutor ⭐', 'Enjoying the app? Please rate us!', [
      {text: 'Maybe Later', style: 'cancel'},
      {text: 'Rate Now', onPress: () => Linking.openURL('https://play.google.com/store/apps/details?id=com.aitutorapp')},
    ]);
  };

  const handleContactEmail = () => Linking.openURL('mailto:support@aitutorapp.com');
  const handleContactPhone = () => Linking.openURL('tel:+919876543210');
  const handleWhatsApp = () => Linking.openURL('https://wa.me/919876543210');

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: background}]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <Animated.View style={[styles.profileHeader, {opacity: fadeAnim, transform: [{translateY: slideAnim}]}]}>
          <View style={[styles.avatarRing, {borderColor: primary}]}>
            <Avatar name={displayName} size="xl" />
          </View>
          <Text style={[styles.name, {color: text}]}>{displayName} 🔥</Text>
          <View style={styles.badges}>
            <Badge label={`${displayClass} • ${displayBoard}`} variant="primary" />
            <Badge label={`⚡ Level ${studentLevel}`} variant="level" />
          </View>
        </Animated.View>

        {/* Stats */}
        <Animated.View style={[styles.statsRow, {opacity: fadeAnim, transform: [{translateY: slideAnim}]}]}>
          <StatCard icon="flame" value={studentStreak} label="Day Streak 🔥" color="#EF4444" cardColor={card} textColor={text} textSecondary={textSecondary} />
          <StatCard icon="star" value={studentXp.toLocaleString()} label="XP Points ⭐" color="#F97316" cardColor={card} textColor={text} textSecondary={textSecondary} />
          <StatCard icon="trophy" value={studentLevel} label="Level 🏆" color="#FBBF24" cardColor={card} textColor={text} textSecondary={textSecondary} />
        </Animated.View>

        {/* Account Section */}
        <Animated.View style={[styles.menuSection, {opacity: fadeAnim, transform: [{translateY: slideAnim}]}]}>
          <Text style={[styles.sectionTitle, {color: textSecondary}]}>ACCOUNT</Text>
          <Card padding="sm">
            <MenuItem
              icon="user"
              label="Edit Profile"
              emoji="✏️"
              primaryColor={primary}
              textColor={text}
              textMuted={textMuted}
              onPress={() => {
                setEditName(displayName);
                setEditEmail(displayEmail);
                setShowEditProfile(true);
              }}
            />
            <View style={[styles.divider, {backgroundColor: border}]} />
            <MenuItem
              icon="graduation-cap"
              label="Class & Board"
              value={`${displayClass} • ${displayBoard}`}
              emoji="🎓"
              primaryColor={primary}
              textColor={text}
              textMuted={textMuted}
              onPress={() => Alert.alert('Info', 'Contact support to change class & board')}
            />
          </Card>
        </Animated.View>

        {/* Preferences Section */}
        <Animated.View style={[styles.menuSection, {opacity: fadeAnim, transform: [{translateY: slideAnim}]}]}>
          <Text style={[styles.sectionTitle, {color: textSecondary}]}>PREFERENCES</Text>
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
                <Text style={[styles.menuLabel, {color: text}]}>Dark Mode 🌙</Text>
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
        <Animated.View style={[styles.menuSection, {opacity: fadeAnim, transform: [{translateY: slideAnim}]}]}>
          <Text style={[styles.sectionTitle, {color: textSecondary}]}>SUPPORT</Text>
          <Card padding="sm">
            <MenuItem icon="help-circle" label="Help Center" emoji="❓" primaryColor={primary} textColor={text} textMuted={textMuted} onPress={() => setShowHelpCenter(true)} />
            <View style={[styles.divider, {backgroundColor: border}]} />
            <MenuItem icon="mail" label="Contact Us" emoji="📧" primaryColor={primary} textColor={text} textMuted={textMuted} onPress={() => setShowContactUs(true)} />
            <View style={[styles.divider, {backgroundColor: border}]} />
            <MenuItem icon="star" label="Rate App" emoji="⭐" primaryColor={primary} textColor={text} textMuted={textMuted} onPress={handleRateApp} />
          </Card>
        </Animated.View>

        {/* Logout */}
        <Animated.View style={[styles.menuSection, {opacity: fadeAnim, transform: [{translateY: slideAnim}]}]}>
          <Card padding="sm">
            <MenuItem icon="log-out" label="Logout" danger errorColor={error} primaryColor={primary} textColor={text} textMuted={textMuted} onPress={handleLogout} />
          </Card>
        </Animated.View>

        <Text style={[styles.version, {color: textMuted}]}>Version 1.0.0 • AI Tutor App</Text>
        <View style={{height: Spacing['2xl']}} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showEditProfile} transparent animationType="slide" onRequestClose={() => setShowEditProfile(false)}>
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
                editable={!saving}
              />
              <Text style={[styles.inputLabel, {color: textSecondary}]}>Phone Number</Text>
              <TextInput
                style={[styles.input, {backgroundColor: background, color: textMuted, borderColor: border}]}
                value={displayPhone}
                editable={false}
                placeholder="Phone number"
                placeholderTextColor={textMuted}
              />
              <TouchableOpacity
                style={[styles.saveButton, {backgroundColor: primary, opacity: saving ? 0.7 : 1}]}
                onPress={handleSaveProfile}
                disabled={saving}>
                {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Help Center Modal */}
      <Modal visible={showHelpCenter} transparent animationType="slide" onRequestClose={() => setShowHelpCenter(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {backgroundColor: card}]}>
            <View style={[styles.modalHeader, {borderBottomColor: border}]}>
              <Text style={[styles.modalTitle, {color: text}]}>Help Center ❓</Text>
              <TouchableOpacity onPress={() => setShowHelpCenter(false)}>
                <Icon name="x" size={24} color={textMuted} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <FAQItem question="How do I start learning?" answer="Go to Learn tab, select a subject, choose a chapter, and start with any lesson." textColor={text} textMuted={textMuted} border={border} />
              <FAQItem question="How does the streak work?" answer="Complete at least one lesson daily to maintain your streak." textColor={text} textMuted={textMuted} border={border} />
              <FAQItem question="How do I ask doubts?" answer="Tap 'Ask Doubt' on home screen. Our AI tutor will help answer your questions." textColor={text} textMuted={textMuted} border={border} />
              <FAQItem question="How are quizzes scored?" answer="Each correct answer gives XP points. Complete faster for bonus points." textColor={text} textMuted={textMuted} border={border} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Contact Us Modal */}
      <Modal visible={showContactUs} transparent animationType="slide" onRequestClose={() => setShowContactUs(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {backgroundColor: card, maxHeight: '60%'}]}>
            <View style={[styles.modalHeader, {borderBottomColor: border}]}>
              <Text style={[styles.modalTitle, {color: text}]}>Contact Us 📧</Text>
              <TouchableOpacity onPress={() => setShowContactUs(false)}>
                <Icon name="x" size={24} color={textMuted} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={[styles.contactIntro, {color: textSecondary}]}>We're here to help!</Text>
              <TouchableOpacity style={[styles.contactOption, {backgroundColor: background, borderColor: border}]} onPress={handleContactEmail}>
                <View style={[styles.contactIcon, {backgroundColor: `${primary}15`}]}><Icon name="mail" size={20} color={primary} /></View>
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactLabel, {color: text}]}>Email Support</Text>
                  <Text style={[styles.contactValue, {color: textMuted}]}>support@aitutorapp.com</Text>
                </View>
                <Icon name="chevron-right" size={20} color={textMuted} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.contactOption, {backgroundColor: background, borderColor: border}]} onPress={handleContactPhone}>
                <View style={[styles.contactIcon, {backgroundColor: '#22C55E15'}]}><Icon name="phone" size={20} color="#22C55E" /></View>
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactLabel, {color: text}]}>Phone Support</Text>
                  <Text style={[styles.contactValue, {color: textMuted}]}>+91 98765 43210</Text>
                </View>
                <Icon name="chevron-right" size={20} color={textMuted} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.contactOption, {backgroundColor: background, borderColor: border}]} onPress={handleWhatsApp}>
                <View style={[styles.contactIcon, {backgroundColor: '#25D36615'}]}><Icon name="message-circle" size={20} color="#25D366" /></View>
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactLabel, {color: text}]}>WhatsApp</Text>
                  <Text style={[styles.contactValue, {color: textMuted}]}>Chat with us</Text>
                </View>
                <Icon name="chevron-right" size={20} color={textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function StatCard({icon, value, label, color, cardColor, textColor, textSecondary}: any) {
  return (
    <View style={[styles.statCard, {backgroundColor: cardColor}, Shadows.sm]}>
      <View style={[styles.statIcon, {backgroundColor: `${color}15`}]}><Icon name={icon} size={20} color={color} /></View>
      <Text style={[styles.statValue, {color: textColor}]}>{value}</Text>
      <Text style={[styles.statLabel, {color: textSecondary}]}>{label}</Text>
    </View>
  );
}

function MenuItem({icon, label, value, emoji, danger, errorColor, primaryColor, textColor, textMuted, onPress}: any) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[styles.menuIcon, {backgroundColor: danger ? `${errorColor}15` : `${primaryColor}15`}]}>
        <Icon name={icon} size={18} color={danger ? errorColor : primaryColor} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuLabel, {color: danger ? errorColor : textColor}]}>{label} {emoji}</Text>
        {value && <Text style={[styles.menuValue, {color: textMuted}]}>{value}</Text>}
      </View>
      <Icon name="chevron-right" size={16} color={textMuted} />
    </TouchableOpacity>
  );
}

function FAQItem({question, answer, textColor, textMuted, border}: any) {
  const [expanded, setExpanded] = useState(false);
  return (
    <TouchableOpacity style={[styles.faqItem, {borderBottomColor: border}]} onPress={() => setExpanded(!expanded)}>
      <View style={styles.faqHeader}>
        <Text style={[styles.faqQuestion, {color: textColor}]}>{question}</Text>
        <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={textMuted} />
      </View>
      {expanded && <Text style={[styles.faqAnswer, {color: textMuted}]}>{answer}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  scrollContent: {padding: Spacing.lg},
  profileHeader: {alignItems: 'center', marginBottom: Spacing.xl},
  avatarRing: {borderWidth: 3, borderRadius: BorderRadius.full, padding: 3, marginBottom: Spacing.md},
  name: {fontSize: FontSizes['2xl'], fontWeight: '700', marginBottom: Spacing.sm},
  badges: {flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap', justifyContent: 'center'},
  statsRow: {flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl},
  statCard: {flex: 1, padding: Spacing.base, borderRadius: BorderRadius.xl, alignItems: 'center'},
  statIcon: {width: 40, height: 40, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm},
  statValue: {fontSize: FontSizes.xl, fontWeight: '700'},
  statLabel: {fontSize: FontSizes.xs, marginTop: 2, textAlign: 'center'},
  menuSection: {marginBottom: Spacing.lg},
  sectionTitle: {fontSize: FontSizes.xs, fontWeight: '700', marginBottom: Spacing.sm, marginLeft: Spacing.xs, letterSpacing: 1},
  menuItem: {flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm},
  menuIcon: {width: 38, height: 38, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md},
  menuContent: {flex: 1},
  menuLabel: {fontSize: FontSizes.base, fontWeight: '500'},
  menuValue: {fontSize: FontSizes.sm, marginTop: 2},
  divider: {height: 1, marginLeft: 54},
  version: {textAlign: 'center', fontSize: FontSizes.sm, marginTop: Spacing.lg},
  modalOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end'},
  modalContent: {borderTopLeftRadius: BorderRadius['2xl'], borderTopRightRadius: BorderRadius['2xl'], maxHeight: '80%'},
  modalHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, borderBottomWidth: 1},
  modalTitle: {fontSize: FontSizes.lg, fontWeight: '700'},
  modalBody: {padding: Spacing.lg},
  inputLabel: {fontSize: FontSizes.sm, fontWeight: '600', marginBottom: Spacing.sm},
  input: {borderWidth: 1, borderRadius: BorderRadius.lg, padding: Spacing.md, fontSize: FontSizes.base, marginBottom: Spacing.lg},
  saveButton: {padding: Spacing.md, borderRadius: BorderRadius.lg, alignItems: 'center', marginTop: Spacing.md, marginBottom: Spacing.lg},
  saveButtonText: {color: '#FFF', fontSize: FontSizes.base, fontWeight: '600'},
  faqItem: {paddingVertical: Spacing.md, borderBottomWidth: 1},
  faqHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  faqQuestion: {fontSize: FontSizes.sm, fontWeight: '600', flex: 1, marginRight: Spacing.sm},
  faqAnswer: {fontSize: FontSizes.sm, marginTop: Spacing.sm, lineHeight: 20},
  contactIntro: {fontSize: FontSizes.sm, marginBottom: Spacing.lg, lineHeight: 20},
  contactOption: {flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 1, marginBottom: Spacing.sm},
  contactIcon: {width: 44, height: 44, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md},
  contactInfo: {flex: 1},
  contactLabel: {fontSize: FontSizes.sm, fontWeight: '600'},
  contactValue: {fontSize: FontSizes.xs, marginTop: 2},
});
