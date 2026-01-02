/**
 * Home Screen / Dashboard
 * Student's main dashboard with full API integration
 */

import React, {useEffect, useRef, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  useColorScheme,
  Modal,
  ActivityIndicator,
  Platform,
  Alert,
  PermissionsAndroid,
  NativeModules,
  NativeEventEmitter,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {useStudent} from '../../context';
import {useDashboard, useProgress, useSubjects} from '../../hooks';
import {progressApi} from '../../services/api';
import {
  Avatar,
  Badge,
  ProgressRing,
  Icon,
  StatsCard,
  StudyPlanCard,
  SubjectCard,
} from '../../components/ui';
import {
  BorderRadius,
  FontSizes,
  Shadows,
  Spacing,
} from '../../constants/theme';

const {CastModule} = NativeModules;

interface CastDevice {
  deviceId: string;
  friendlyName: string;
  modelName?: string;
  isConnected: boolean;
}

interface SubjectProgressData {
  subjectId: string;
  subjectName: string;
  totalTopics: number;
  completedTopics: number;
  avgProgress: number;
}

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme() ?? 'light';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Context and hooks
  const {currentStudent, dashboardStats, loadDashboard} = useStudent();
  const {todayPlan, leaderboard, achievements, loading: dashboardLoading, refresh: refreshDashboard} = useDashboard();
  const {streak, loading: progressLoading} = useProgress();
  const {subjects, loading: subjectsLoading} = useSubjects(currentStudent?.classId);

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgressData[]>([]);

  // Cast state
  const [showCastModal, setShowCastModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [castDevices, setCastDevices] = useState<CastDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<CastDevice | null>(null);
  const [isCasting, setIsCasting] = useState(false);
  const [castError, setCastError] = useState<string | null>(null);

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const primary = useThemeColor({}, 'primary');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const success = useThemeColor({}, 'success');
  const errorColor = useThemeColor({}, 'error');

  // Load subject progress
  useEffect(() => {
    const loadSubjectProgress = async () => {
      if (!currentStudent) return;
      try {
        const response = await progressApi.getOverall(currentStudent.id);
        if (response.success && response.data?.subjectProgress) {
          setSubjectProgress(response.data.subjectProgress);
        }
      } catch (err) {
        console.log('Load subject progress error:', err);
      }
    };
    loadSubjectProgress();
  }, [currentStudent]);

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

  // Initialize Cast
  useEffect(() => {
    if (CastModule) {
      CastModule.initialize().catch((err: any) => {
        console.log('Cast init error:', err.message);
      });
    }
  }, []);

  // Cast event listeners
  useEffect(() => {
    if (!CastModule) return;

    const eventEmitter = new NativeEventEmitter(CastModule);
    
    const deviceDiscoveredListener = eventEmitter.addListener(
      'castDeviceDiscovered',
      (device: any) => {
        setCastDevices(prev => {
          const exists = prev.find(d => d.deviceId === device.deviceId);
          if (exists) return prev;
          return [...prev, {
            deviceId: device.deviceId,
            friendlyName: device.friendlyName,
            modelName: device.modelName,
            isConnected: false,
          }];
        });
      }
    );

    const sessionEndedListener = eventEmitter.addListener(
      'castSessionEnded',
      () => {
        setIsCasting(false);
        setConnectedDevice(null);
      }
    );

    return () => {
      deviceDiscoveredListener.remove();
      sessionEndedListener.remove();
      if (CastModule) {
        CastModule.stopDiscovery().catch(() => {});
      }
    };
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadDashboard(), refreshDashboard()]);
    
    // Reload subject progress
    if (currentStudent) {
      try {
        const response = await progressApi.getOverall(currentStudent.id);
        if (response.success && response.data?.subjectProgress) {
          setSubjectProgress(response.data.subjectProgress);
        }
      } catch (err) {
        console.log('Refresh subject progress error:', err);
      }
    }
    
    setRefreshing(false);
  }, [loadDashboard, refreshDashboard, currentStudent]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning 🌅';
    if (hour < 17) return 'Good Afternoon ☀️';
    return 'Good Evening 🌆';
  };

  // Get student display data
  const studentName = currentStudent?.studentName || 'Student';
  const studentXp = currentStudent?.xp || dashboardStats?.student?.xp || 0;
  const studentLevel = currentStudent?.level || dashboardStats?.student?.level || 1;
  const studentStreak = streak.streakDays || currentStudent?.streakDays || 0;
  const studentClass = currentStudent?.class?.displayName || currentStudent?.class?.className || '10th';
  const studentBoard = currentStudent?.board?.name || 'CBSE';

  // Today's plan items
  const todayItems = todayPlan?.todayItems || [];
  const continueLearning = todayPlan?.continueLearning;

  // Combine subjects with progress
  const subjectsWithProgress = subjects.slice(0, 3).map(subject => {
    const progress = subjectProgress.find(sp => sp.subjectId === subject.id);
    return {
      subject: subject.displayName,
      subjectId: subject.id,
      chaptersCompleted: progress?.completedTopics || 0,
      totalChapters: subject.totalChapters || progress?.totalTopics || 10,
      progress: Math.round(progress?.avgProgress || 0),
    };
  });

  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]);
      return granted['android.permission.ACCESS_FINE_LOCATION'] === 'granted' ||
             granted['android.permission.ACCESS_COARSE_LOCATION'] === 'granted';
    } catch (err) {
      return false;
    }
  };

  const handleCastPress = async () => {
    setCastError(null);
    setShowCastModal(true);
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      setCastError('Location permission is required to discover Cast devices');
      return;
    }
    scanForDevices();
  };

  const scanForDevices = async () => {
    if (!CastModule) {
      setCastError('Cast module not available');
      return;
    }

    setIsScanning(true);
    setCastDevices([]);

    try {
      await CastModule.startDiscovery();
      setTimeout(async () => {
        const devices = await CastModule.getDiscoveredDevices();
        if (devices?.length > 0) {
          setCastDevices(devices.map((d: any) => ({
            deviceId: d.deviceId,
            friendlyName: d.friendlyName,
            modelName: d.modelName,
            isConnected: false,
          })));
        }
        setIsScanning(false);
      }, 5000);
    } catch (err: any) {
      setCastError(err.message);
      setIsScanning(false);
    }
  };

  const connectToDevice = async (device: CastDevice) => {
    if (!CastModule) return;
    try {
      await CastModule.castToDevice(device.deviceId);
      setConnectedDevice({...device, isConnected: true});
      setIsCasting(true);
      setShowCastModal(false);
    } catch (err: any) {
      Alert.alert('Connection Failed', err.message);
    }
  };

  const disconnectDevice = async () => {
    if (!CastModule) return;
    try {
      await CastModule.endSession();
      setConnectedDevice(null);
      setIsCasting(false);
    } catch (err) {
      console.log('Disconnect error:', err);
    }
  };

  const handleSubjectPress = (subjectId: string, subjectName: string) => {
    navigation.navigate('SubjectDetail', {
      subject: subjectName,
      subjectId: subjectId,
    });
  };

  const isLoading = dashboardLoading || progressLoading;

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: background}]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[primary]} />
        }>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, {color: textSecondary}]}>
              {getGreeting()}
            </Text>
            <Text style={[styles.name, {color: text}]}>{studentName}</Text>
            <View style={styles.badges}>
              <Badge
                label={`${studentClass} • ${studentBoard}`}
                variant="primary"
                size="sm"
              />
              <Badge
                label={`⚡ Level ${studentLevel}`}
                variant="level"
                size="sm"
              />
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[
                styles.castButton,
                {
                  backgroundColor: isCasting ? `${success}15` : card,
                  borderColor: isCasting ? success : border,
                },
                Shadows.sm,
              ]}
              onPress={handleCastPress}>
              <Icon 
                name={isCasting ? 'check-circle' : 'cast'} 
                size={20} 
                color={isCasting ? success : primary} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <View style={[styles.avatarContainer, {borderColor: primary}]}>
                <Avatar name={studentName} source={null} size="lg" />
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Casting Banner */}
        {isCasting && connectedDevice && (
          <View style={[styles.castingBanner, {backgroundColor: `${success}15`, borderColor: success}]}>
            <View style={styles.castingBannerLeft}>
              <Text style={styles.castingEmoji}>📺</Text>
              <View>
                <Text style={[styles.castingText, {color: success}]}>
                  Casting to {connectedDevice.friendlyName}
                </Text>
                <Text style={[styles.castingSubtext, {color: textMuted}]}>
                  Screen mirroring active
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.stopCastButton, {backgroundColor: errorColor}]}
              onPress={disconnectDevice}>
              <Icon name="x" size={14} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Stats */}
        <Animated.View
          style={[
            styles.statsContainer,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          <View style={styles.statsRow}>
            <StatsCard
              title="Streak"
              value={studentStreak}
              subtitle="days 🔥"
              icon="flame"
              iconColor="#EF4444"
              delay={0}
            />
            <View style={{width: Spacing.md}} />
            <StatsCard
              title="XP Points"
              value={studentXp.toLocaleString()}
              subtitle="total ⭐"
              icon="star"
              iconColor="#F97316"
              delay={100}
            />
          </View>
        </Animated.View>

        {/* Continue Learning */}
        <Animated.View
          style={[
            styles.section,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          <TouchableOpacity
            style={[styles.continueCard, Shadows.lg]}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Learn')}>
            <View style={[styles.continueGradient, {backgroundColor: primary}]}>
              <View style={styles.continueDecoration1} />
              <View style={styles.continueDecoration2} />
              <View style={styles.continueContent}>
                <View style={styles.continueIcon}>
                  <Icon name="play" size={24} color={primary} />
                </View>
                <View style={styles.continueText}>
                  <Text style={styles.continueTitle}>Continue Learning 🚀</Text>
                  <Text style={styles.continueSubtitle} numberOfLines={1}>
                    {continueLearning?.topic?.topicTitle || 'Start your journey'}
                  </Text>
                  <View style={styles.continueMeta}>
                    <Text style={styles.continueMetaText}>
                      {continueLearning ? 'In Progress' : 'Tap to begin'}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.continueProgress}>
                <ProgressRing
                  progress={dashboardStats?.today?.studyTimeMinutes ? Math.min(100, (dashboardStats.today.studyTimeMinutes / 60) * 100) : 0}
                  size="md"
                  showLabel={true}
                  variant="success"
                />
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Today's Plan */}
        <Animated.View
          style={[
            styles.section,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionTitle, {color: text}]}>Today's Plan</Text>
              <Text style={styles.sectionEmoji}>📋</Text>
            </View>
            <TouchableOpacity>
              <Text style={[styles.seeAll, {color: primary}]}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {isLoading ? (
            <ActivityIndicator size="small" color={primary} />
          ) : todayItems.length > 0 ? (
            todayItems.slice(0, 3).map((item, index) => (
              <StudyPlanCard
                key={item.id || index}
                topic={item.topic?.topicTitle || `Topic ${index + 1}`}
                subject={item.topic?.chapter?.book?.subject?.subjectName || 'Subject'}
                chapter={item.topic?.chapter?.chapterTitle || 'Chapter'}
                duration={item.estimatedMinutes || 30}
                scheduledTime={item.scheduledDate}
                isCompleted={item.status === 'completed'}
                isCurrent={item.status === 'in_progress'}
                onPress={() => console.log('Start topic', item.id)}
              />
            ))
          ) : (
            <View style={[styles.emptyCard, {backgroundColor: card}]}>
              <Text style={styles.emptyEmoji}>📅</Text>
              <Text style={[styles.emptyText, {color: text}]}>No study plan for today</Text>
              <Text style={[styles.emptySubtext, {color: textMuted}]}>
                Create a study plan to get started
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Subjects Progress */}
        <Animated.View
          style={[
            styles.section,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionTitle, {color: text}]}>Your Subjects</Text>
              <Text style={styles.sectionEmoji}>📚</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Learn')}>
              <Text style={[styles.seeAll, {color: primary}]}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {subjectsLoading ? (
            <ActivityIndicator size="small" color={primary} />
          ) : subjectsWithProgress.length > 0 ? (
            subjectsWithProgress.map((subject) => (
              <SubjectCard
                key={subject.subjectId}
                subject={subject.subject}
                chaptersCompleted={subject.chaptersCompleted}
                totalChapters={subject.totalChapters}
                progress={subject.progress}
                onPress={() => handleSubjectPress(subject.subjectId, subject.subject)}
              />
            ))
          ) : (
            <View style={[styles.emptyCard, {backgroundColor: card}]}>
              <Text style={styles.emptyEmoji}>📚</Text>
              <Text style={[styles.emptyText, {color: text}]}>No subjects available</Text>
              <Text style={[styles.emptySubtext, {color: textMuted}]}>
                Subjects will appear here
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          style={[
            styles.section,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitle, {color: text}]}>Quick Actions</Text>
            <Text style={styles.sectionEmoji}>⚡</Text>
          </View>
          <View style={styles.actionsGrid}>
            <QuickAction
              icon="help-circle"
              label="Ask Doubt"
              color="#EF4444"
              emoji="💬"
              onPress={() => navigation.navigate('Doubt')}
            />
            <QuickAction
              icon="file-text"
              label="Take Quiz"
              color="#3B82F6"
              emoji="📝"
              onPress={() => navigation.navigate('Quizzes')}
            />
            <QuickAction
              icon="calendar"
              label="Study Plan"
              color="#22C55E"
              emoji="📅"
              onPress={() => {}}
            />
            <QuickAction
              icon="trophy"
              label="Leaderboard"
              color="#F97316"
              emoji="🏆"
              onPress={() => {}}
            />
          </View>
        </Animated.View>

        <View style={{height: Spacing['2xl']}} />
      </ScrollView>

      {/* Cast Modal */}
      <Modal
        visible={showCastModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCastModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {backgroundColor: card}]}>
            <View style={[styles.modalHeader, {borderBottomColor: border}]}>
              <View style={styles.modalTitleRow}>
                <Text style={styles.modalEmoji}>📺</Text>
                <Text style={[styles.modalTitle, {color: text}]}>Cast Screen</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCastModal(false)}>
                <Icon name="x" size={24} color={textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={[styles.networkInfo, {backgroundColor: `${primary}10`}]}>
                <Icon name="wifi" size={16} color={primary} />
                <Text style={[styles.networkText, {color: textSecondary}]}>
                  Ensure devices are on the same WiFi
                </Text>
              </View>

              {castError && (
                <View style={[styles.errorContainer, {backgroundColor: `${errorColor}15`}]}>
                  <Icon name="alert-circle" size={16} color={errorColor} />
                  <Text style={[styles.errorText, {color: errorColor}]}>{castError}</Text>
                </View>
              )}

              {isScanning && (
                <View style={styles.scanningContainer}>
                  <ActivityIndicator size="large" color={primary} />
                  <Text style={[styles.scanningText, {color: text}]}>Scanning...</Text>
                </View>
              )}

              {castDevices.length > 0 && (
                <View style={styles.devicesList}>
                  <Text style={[styles.devicesTitle, {color: text}]}>
                    Available Devices ({castDevices.length})
                  </Text>
                  {castDevices.map(device => (
                    <TouchableOpacity
                      key={device.deviceId}
                      style={[
                        styles.deviceCard,
                        {backgroundColor: background, borderColor: border},
                      ]}
                      onPress={() => connectToDevice(device)}>
                      <Text style={styles.deviceIcon}>📺</Text>
                      <View style={styles.deviceInfo}>
                        <Text style={[styles.deviceName, {color: text}]}>
                          {device.friendlyName}
                        </Text>
                      </View>
                      <Icon name="cast" size={20} color={primary} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {!isScanning && castDevices.length === 0 && !castError && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyEmoji}>📡</Text>
                  <Text style={[styles.emptyText, {color: text}]}>No devices found</Text>
                  <TouchableOpacity
                    style={[styles.rescanButton, {backgroundColor: primary}]}
                    onPress={scanForDevices}>
                    <Text style={styles.rescanText}>Scan Again</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function QuickAction({
  icon,
  label,
  color,
  emoji,
  onPress,
}: {
  icon: string;
  label: string;
  color: string;
  emoji: string;
  onPress: () => void;
}) {
  const card = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');

  return (
    <TouchableOpacity
      style={[styles.actionCard, {backgroundColor: card}, Shadows.md]}
      onPress={onPress}
      activeOpacity={0.8}>
      <View style={[styles.actionIcon, {backgroundColor: `${color}15`}]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.actionLabel, {color: text}]}>{label}</Text>
      <Text style={styles.actionEmoji}>{emoji}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  scrollContent: {padding: Spacing.lg},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  headerLeft: {flex: 1},
  headerRight: {flexDirection: 'row', alignItems: 'center', gap: Spacing.sm},
  greeting: {fontSize: FontSizes.sm, marginBottom: 4},
  name: {fontSize: FontSizes['2xl'], fontWeight: '700', marginBottom: Spacing.sm},
  badges: {flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap'},
  avatarContainer: {borderWidth: 3, borderRadius: BorderRadius.full, padding: 2},
  castButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  castingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    marginBottom: Spacing.lg,
  },
  castingBannerLeft: {flexDirection: 'row', alignItems: 'center', gap: Spacing.sm},
  castingEmoji: {fontSize: 24},
  castingText: {fontSize: FontSizes.sm, fontWeight: '600'},
  castingSubtext: {fontSize: FontSizes.xs},
  stopCastButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {marginBottom: Spacing.lg},
  statsRow: {flexDirection: 'row'},
  section: {marginBottom: Spacing.xl},
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  sectionTitleRow: {flexDirection: 'row', alignItems: 'center', gap: Spacing.sm},
  sectionTitle: {fontSize: FontSizes.lg, fontWeight: '700'},
  sectionEmoji: {fontSize: FontSizes.lg},
  seeAll: {fontSize: FontSizes.sm, fontWeight: '600'},
  continueCard: {borderRadius: BorderRadius.xl, overflow: 'hidden'},
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  continueDecoration1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  continueDecoration2: {
    position: 'absolute',
    bottom: -50,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  continueContent: {flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: Spacing.base},
  continueIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  continueText: {flex: 1},
  continueTitle: {fontSize: FontSizes.sm, color: 'rgba(255,255,255,0.9)', marginBottom: 4, fontWeight: '600'},
  continueSubtitle: {fontSize: FontSizes.base, fontWeight: '700', color: '#FFF', marginBottom: 6},
  continueMeta: {flexDirection: 'row', alignItems: 'center'},
  continueMetaText: {fontSize: FontSizes.xs, color: 'rgba(255,255,255,0.8)', fontWeight: '500'},
  continueProgress: {zIndex: 1},
  emptyCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  emptyEmoji: {fontSize: 40, marginBottom: Spacing.md},
  emptyText: {fontSize: FontSizes.base, fontWeight: '600', marginBottom: Spacing.xs},
  emptySubtext: {fontSize: FontSizes.sm, textAlign: 'center'},
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  actionCard: {
    width: '47%',
    padding: Spacing.base,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    position: 'relative',
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  actionLabel: {fontSize: FontSizes.sm, fontWeight: '600'},
  actionEmoji: {position: 'absolute', top: Spacing.sm, right: Spacing.sm, fontSize: 16},
  modalOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end'},
  modalContent: {borderTopLeftRadius: BorderRadius['2xl'], borderTopRightRadius: BorderRadius['2xl'], maxHeight: '80%'},
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  modalTitleRow: {flexDirection: 'row', alignItems: 'center', gap: Spacing.sm},
  modalEmoji: {fontSize: 24},
  modalTitle: {fontSize: FontSizes.lg, fontWeight: '700'},
  modalBody: {padding: Spacing.lg},
  networkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  networkText: {fontSize: FontSizes.sm, flex: 1},
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorText: {fontSize: FontSizes.sm, flex: 1},
  scanningContainer: {alignItems: 'center', paddingVertical: Spacing.xl},
  scanningText: {fontSize: FontSizes.sm, marginTop: Spacing.md},
  devicesList: {marginTop: Spacing.sm},
  devicesTitle: {fontSize: FontSizes.sm, fontWeight: '600', marginBottom: Spacing.md},
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    marginBottom: Spacing.sm,
  },
  deviceIcon: {fontSize: 28, marginRight: Spacing.md},
  deviceInfo: {flex: 1},
  deviceName: {fontSize: FontSizes.base, fontWeight: '600'},
  emptyContainer: {alignItems: 'center', paddingVertical: Spacing.lg},
  rescanButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  rescanText: {fontSize: FontSizes.sm, fontWeight: '600', color: '#FFF'},
});
