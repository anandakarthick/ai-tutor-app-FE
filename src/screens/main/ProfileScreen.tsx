/**
 * Profile Screen - with full API integration
 */

import React, {useState, useEffect, useRef, useCallback} from 'react';
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
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {useAuth, useStudent} from '../../context';
import {useProgress} from '../../hooks';
import {settingsApi} from '../../services/api';
import type {FAQ, ContactInfo} from '../../services/api/settings';
import {Avatar, Badge, Card, Icon} from '../../components/ui';
import {BorderRadius, FontSizes, Shadows, Spacing} from '../../constants/theme';

export function ProfileScreen() {
  const navigation = useNavigation<any>();
  const {user, logout, refreshUser} = useAuth();
  const {currentStudent, updateStudent, loadStudents} = useStudent();
  const {streak, refresh: refreshProgress} = useProgress();
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

  // Data states
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loadingFaqs, setLoadingFaqs] = useState(false);
  const [loadingContact, setLoadingContact] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  // Load FAQs
  const loadFaqs = useCallback(async () => {
    try {
      setLoadingFaqs(true);
      const response = await settingsApi.getFaqs();
      if (response.success && response.data) {
        setFaqs(response.data);
      }
    } catch (err) {
      console.log('Load FAQs error:', err);
    } finally {
      setLoadingFaqs(false);
    }
  }, []);

  // Load contact info
  const loadContactInfo = useCallback(async () => {
    try {
      setLoadingContact(true);
      const response = await settingsApi.getContactInfo();
      if (response.success && response.data) {
        setContactInfo(response.data);
      }
    } catch (err) {
      console.log('Load contact error:', err);
    } finally {
      setLoadingContact(false);
    }
  }, []);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refreshUser(),
      loadStudents(),
      refreshProgress(),
    ]);
    setRefreshing(false);
  }, [refreshUser, loadStudents, refreshProgress]);

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
        const success = await updateStudent(currentStudent.id, {studentName: editName.trim()});
        if (success) {
          setShowEditProfile(false);
          Alert.alert('Success', 'Profile updated successfully! ✅');
        } else {
          Alert.alert('Error', 'Failed to update profile');
        }
      }
    } catch (err) {
      console.log('Save profile error:', err);
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

  const handleOpenHelpCenter = async () => {
    setShowHelpCenter(true);
    if (faqs.length === 0) {
      await loadFaqs();
    }
  };

  const handleOpenContactUs = async () => {
    setShowContactUs(true);
    if (!contactInfo) {
      await loadContactInfo();
    }
  };

  const handleContactEmail = () => {
    if (contactInfo?.email) {
      Linking.openURL(`mailto:${contactInfo.email}`);
    }
  };

  const handleContactPhone = () => {
    if (contactInfo?.phone) {
      Linking.openURL(`tel:${contactInfo.phone.replace(/\s/g, '')}`);
    }
  };

  const handleWhatsApp = () => {
    if (contactInfo?.whatsapp) {
      Linking.openURL(`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}`);
    }
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: background}]} edges={['top']}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[primary]} />
        }>
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
            <MenuItem icon="help-circle" label="Help Center" emoji="❓" primaryColor={primary} textColor={text} textMuted={textMuted} onPress={handleOpenHelpCenter} />
            <View style={[styles.divider, {backgroundColor: border}]} />
            <MenuItem icon="mail" label="Contact Us" emoji="📧" primaryColor={primary} textColor={text} textMuted={textMuted} onPress={handleOpenContactUs} />
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
              {loadingFaqs ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={primary} />
                  <Text style={[styles.loadingText, {color: textSecondary}]}>Loading FAQs...</Text>
                </View>
              ) : faqs.length > 0 ? (
                faqs.map((faq) => (
                  <FAQItem 
                    key={faq.id} 
                    question={faq.question} 
                    answer={faq.answer} 
                    textColor={text} 
                    textMuted={textMuted} 
                    border={border} 
                  />
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, {color: textMuted}]}>No FAQs available</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Contact Us Modal */}
      <Modal visible={showContactUs} transparent animationType="slide" onRequestClose={() => setShowContactUs(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {backgroundColor: card, maxHeight: '70%'}]}>
            <View style={[styles.modalHeader, {borderBottomColor: border}]}>
              <Text style={[styles.modalTitle, {color: text}]}>Contact Us 📧</Text>
              <TouchableOpacity onPress={() => setShowContactUs(false)}>
                <Icon name="x" size={24} color={textMuted} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              {loadingContact ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={primary} />
                  <Text style={[styles.loadingText, {color: textSecondary}]}>Loading contact info...</Text>
                </View>
              ) : contactInfo ? (
                <>
                  <Text style={[styles.contactIntro, {color: textSecondary}]}>We're here to help!</Text>
                  <TouchableOpacity style={[styles.contactOption, {backgroundColor: background, borderColor: border}]} onPress={handleContactEmail}>
                    <View style={[styles.contactIcon, {backgroundColor: `${primary}15`}]}><Icon name="mail" size={20} color={primary} /></View>
                    <View style={styles.contactInfo}>
                      <Text style={[styles.contactLabel, {color: text}]}>Email Support</Text>
                      <Text style={[styles.contactValue, {color: textMuted}]}>{contactInfo.email}</Text>
                    </View>
                    <Icon name="chevron-right" size={20} color={textMuted} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.contactOption, {backgroundColor: background, borderColor: border}]} onPress={handleContactPhone}>
                    <View style={[styles.contactIcon, {backgroundColor: '#22C55E15'}]}><Icon name="phone" size={20} color="#22C55E" /></View>
                    <View style={styles.contactInfo}>
                      <Text style={[styles.contactLabel, {color: text}]}>Phone Support</Text>
                      <Text style={[styles.contactValue, {color: textMuted}]}>{contactInfo.phone}</Text>
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
                  {contactInfo.supportHours && (
                    <View style={[styles.supportHours, {backgroundColor: `${primary}10`}]}>
                      <Icon name="clock" size={16} color={primary} />
                      <Text style={[styles.supportHoursText, {color: textSecondary}]}>
                        Support Hours: {contactInfo.supportHours}
                      </Text>
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, {color: textMuted}]}>Contact info unavailable</Text>
                </View>
              )}
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
  supportHours: {flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.lg, marginTop: Spacing.md, gap: Spacing.sm},
  supportHoursText: {fontSize: FontSizes.sm},
  loadingContainer: {alignItems: 'center', paddingVertical: Spacing.xl},
  loadingText: {marginTop: Spacing.md, fontSize: FontSizes.sm},
  emptyContainer: {alignItems: 'center', paddingVertical: Spacing.xl},
  emptyText: {fontSize: FontSizes.sm},
});
