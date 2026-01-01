/**
 * Home Screen / Dashboard
 * Student's main dashboard with Chromecast feature
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
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
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

// Get the native Cast module
const {CastModule} = NativeModules;

// Mock data
const STUDENT = {
  name: 'Rahul Kumar',
  avatar: null,
  class: '10th',
  board: 'CBSE',
  streak: 7,
  xp: 2450,
  level: 12,
};

const TODAY_PLAN = [
  {
    id: '1',
    topic: 'Quadratic Equations - Introduction',
    subject: 'Mathematics',
    chapter: 'Chapter 4',
    duration: 30,
    scheduledTime: '9:00 AM',
    isCompleted: true,
  },
  {
    id: '2',
    topic: 'Chemical Reactions and Equations',
    subject: 'Science',
    chapter: 'Chapter 1',
    duration: 45,
    scheduledTime: '10:00 AM',
    isCurrent: true,
  },
  {
    id: '3',
    topic: 'The Rise of Nationalism in Europe',
    subject: 'History',
    chapter: 'Chapter 1',
    duration: 30,
    scheduledTime: '11:30 AM',
  },
];

const SUBJECTS = [
  {
    subject: 'Mathematics',
    chaptersCompleted: 3,
    totalChapters: 15,
    progress: 20,
  },
  {subject: 'Science', chaptersCompleted: 2, totalChapters: 16, progress: 12},
  {subject: 'English', chaptersCompleted: 4, totalChapters: 12, progress: 33},
];

interface CastDevice {
  deviceId: string;
  friendlyName: string;
  modelName?: string;
  isConnected: boolean;
}

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme() ?? 'light';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Cast state
  const [showCastModal, setShowCastModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [castDevices, setCastDevices] = useState<CastDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<CastDevice | null>(null);
  const [isCasting, setIsCasting] = useState(false);
  const [castError, setCastError] = useState<string | null>(null);
  const [isCastInitialized, setIsCastInitialized] = useState(false);

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const primary = useThemeColor({}, 'primary');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const success = useThemeColor({}, 'success');
  const errorColor = useThemeColor({}, 'error');

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

  // Initialize Cast on mount
  useEffect(() => {
    if (CastModule) {
      CastModule.initialize()
        .then(() => {
          console.log('Cast module initialized');
          setIsCastInitialized(true);
        })
        .catch((err: any) => {
          console.log('Cast init error (non-fatal):', err.message);
          // Still mark as initialized to allow usage
          setIsCastInitialized(true);
        });
    }
  }, []);

  // Setup Cast event listeners
  useEffect(() => {
    if (!CastModule) return;

    const eventEmitter = new NativeEventEmitter(CastModule);
    
    const deviceDiscoveredListener = eventEmitter.addListener(
      'castDeviceDiscovered',
      (device: any) => {
        console.log('Device discovered:', device);
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

    const sessionStartedListener = eventEmitter.addListener(
      'castSessionStarted',
      () => {
        console.log('Cast session started');
        setIsCasting(true);
      }
    );

    const sessionEndedListener = eventEmitter.addListener(
      'castSessionEnded',
      () => {
        console.log('Cast session ended');
        setIsCasting(false);
        setConnectedDevice(null);
        setCastDevices(prev => prev.map(d => ({...d, isConnected: false})));
      }
    );

    return () => {
      deviceDiscoveredListener.remove();
      sessionStartedListener.remove();
      sessionEndedListener.remove();
      
      // Stop discovery on unmount
      if (CastModule) {
        CastModule.stopDiscovery().catch(() => {});
      }
    };
  }, []);

  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]);
      
      const fineGranted = granted['android.permission.ACCESS_FINE_LOCATION'] === 'granted';
      const coarseGranted = granted['android.permission.ACCESS_COARSE_LOCATION'] === 'granted';
      
      return fineGranted || coarseGranted;
    } catch (err) {
      console.warn('Permission error:', err);
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
      setCastError('Cast module not available. Please rebuild the app.');
      return;
    }

    setIsScanning(true);
    setCastDevices([]);
    setCastError(null);

    try {
      // Start discovery
      await CastModule.startDiscovery();
      console.log('Discovery started');

      // Poll for devices multiple times
      const pollForDevices = async (attempts: number) => {
        if (attempts <= 0) {
          setIsScanning(false);
          return;
        }

        try {
          const devices = await CastModule.getDiscoveredDevices();
          console.log(`Poll attempt ${6 - attempts}: Found ${devices?.length || 0} devices`);
          
          if (devices && devices.length > 0) {
            const mappedDevices = devices.map((device: any) => ({
              deviceId: device.deviceId,
              friendlyName: device.friendlyName,
              modelName: device.modelName,
              isConnected: false,
            }));
            setCastDevices(mappedDevices);
          }
          
          // Continue polling
          setTimeout(() => pollForDevices(attempts - 1), 1500);
        } catch (e) {
          console.error('Error polling devices:', e);
          setTimeout(() => pollForDevices(attempts - 1), 1500);
        }
      };

      // Start polling after initial delay
      setTimeout(() => pollForDevices(5), 1000);

    } catch (err: any) {
      console.error('Scan error:', err);
      setCastError(err.message || 'Failed to scan for devices');
      setIsScanning(false);
    }
  };

  const showNativeCastDialog = async () => {
    if (!CastModule) {
      Alert.alert('Error', 'Cast module not available');
      return;
    }

    try {
      await CastModule.showCastDialog();
      setShowCastModal(false);
    } catch (err: any) {
      console.error('Cast dialog error:', err);
      Alert.alert('Error', err.message || 'Failed to show cast dialog');
    }
  };

  const connectToDevice = async (device: CastDevice) => {
    if (!CastModule) return;

    try {
      console.log('Connecting to:', device.friendlyName);
      await CastModule.castToDevice(device.deviceId);
      
      setConnectedDevice({...device, isConnected: true});
      setIsCasting(true);
      setCastDevices(prev => prev.map(d => ({
        ...d,
        isConnected: d.deviceId === device.deviceId,
      })));
      
      setShowCastModal(false);
      Alert.alert('Connected!', `Now casting to ${device.friendlyName}`);
    } catch (err: any) {
      console.error('Connection error:', err);
      Alert.alert('Connection Failed', err.message || 'Could not connect to device');
    }
  };

  const disconnectDevice = async () => {
    if (!CastModule) return;

    try {
      await CastModule.endSession();
      setConnectedDevice(null);
      setIsCasting(false);
      setCastDevices(prev => prev.map(d => ({...d, isConnected: false})));
    } catch (err: any) {
      console.error('Disconnect error:', err);
    }
  };

  const getDeviceIcon = (modelName?: string) => {
    const model = (modelName || '').toLowerCase();
    if (model.includes('chromecast')) return '📺';
    if (model.includes('tv')) return '🖥️';
    if (model.includes('shield')) return '🎮';
    return '📺';
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: background}]}
      edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, {color: textSecondary}]}>
              Good Morning 🌅
            </Text>
            <Text style={[styles.name, {color: text}]}>{STUDENT.name}</Text>
            <View style={styles.badges}>
              <Badge
                label={`${STUDENT.class} • ${STUDENT.board}`}
                variant="primary"
                size="sm"
              />
              <Badge
                label={`⚡ Level ${STUDENT.level}`}
                variant="level"
                size="sm"
              />
            </View>
          </View>
          <View style={styles.headerRight}>
            {/* Cast Button */}
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
              {isCasting && (
                <View style={[styles.castingDot, {backgroundColor: success}]} />
              )}
            </TouchableOpacity>
            
            {/* Profile Avatar */}
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <View style={[styles.avatarContainer, {borderColor: primary}]}>
                <Avatar name={STUDENT.name} source={STUDENT.avatar} size="lg" />
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Casting Banner */}
        {isCasting && connectedDevice && (
          <Animated.View
            style={[
              styles.castingBanner,
              {backgroundColor: `${success}15`, borderColor: success},
              {opacity: fadeAnim},
            ]}>
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
          </Animated.View>
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
              value={STUDENT.streak}
              subtitle="days 🔥"
              icon="flame"
              iconColor="#EF4444"
              delay={0}
            />
            <View style={{width: Spacing.md}} />
            <StatsCard
              title="XP Points"
              value={STUDENT.xp.toLocaleString()}
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
            activeOpacity={0.9}>
            <View style={[styles.continueGradient, {backgroundColor: primary}]}>
              <View style={styles.continueDecoration1} />
              <View style={styles.continueDecoration2} />
              <View style={styles.continueDecoration3} />
              <View style={styles.continueContent}>
                <View style={styles.continueIcon}>
                  <Icon name="play" size={24} color={primary} />
                </View>
                <View style={styles.continueText}>
                  <Text style={styles.continueTitle}>Continue Learning 🚀</Text>
                  <Text style={styles.continueSubtitle} numberOfLines={1}>
                    Chemical Reactions and Equations
                  </Text>
                  <View style={styles.continueMeta}>
                    <Text style={styles.continueMetaText}>Science</Text>
                    <View style={styles.dot} />
                    <Text style={styles.continueMetaText}>15 min left</Text>
                  </View>
                </View>
              </View>
              <View style={styles.continueProgress}>
                <ProgressRing
                  progress={65}
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
              <Text style={[styles.sectionTitle, {color: text}]}>
                Today's Plan
              </Text>
              <Text style={styles.sectionEmoji}>📋</Text>
            </View>
            <TouchableOpacity>
              <Text style={[styles.seeAll, {color: primary}]}>See All</Text>
            </TouchableOpacity>
          </View>
          {TODAY_PLAN.map((item) => (
            <StudyPlanCard
              key={item.id}
              topic={item.topic}
              subject={item.subject}
              chapter={item.chapter}
              duration={item.duration}
              scheduledTime={item.scheduledTime}
              isCompleted={item.isCompleted}
              isCurrent={item.isCurrent}
              onPress={() => console.log('Start learning', item.id)}
            />
          ))}
        </Animated.View>

        {/* Subjects Progress */}
        <Animated.View
          style={[
            styles.section,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionTitle, {color: text}]}>
                Your Subjects
              </Text>
              <Text style={styles.sectionEmoji}>📚</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Learn')}>
              <Text style={[styles.seeAll, {color: primary}]}>View All</Text>
            </TouchableOpacity>
          </View>
          {SUBJECTS.map((subject) => (
            <SubjectCard
              key={subject.subject}
              subject={subject.subject}
              chaptersCompleted={subject.chaptersCompleted}
              totalChapters={subject.totalChapters}
              progress={subject.progress}
              onPress={() => navigation.navigate('Learn')}
            />
          ))}
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          style={[
            styles.section,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitle, {color: text}]}>
              Quick Actions
            </Text>
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
        onRequestClose={() => {
          setShowCastModal(false);
          if (CastModule) {
            CastModule.stopDiscovery().catch(() => {});
          }
        }}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {backgroundColor: card}]}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, {borderBottomColor: border}]}>
              <View style={styles.modalTitleRow}>
                <Text style={styles.modalEmoji}>📺</Text>
                <Text style={[styles.modalTitle, {color: text}]}>Cast Screen</Text>
              </View>
              <TouchableOpacity onPress={() => {
                setShowCastModal(false);
                if (CastModule) {
                  CastModule.stopDiscovery().catch(() => {});
                }
              }}>
                <Icon name="x" size={24} color={textMuted} />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Native Cast Dialog Button */}
              {CastModule && (
                <TouchableOpacity
                  style={[styles.nativeCastButton, {backgroundColor: primary}]}
                  onPress={showNativeCastDialog}>
                  <Icon name="cast" size={20} color="#FFF" />
                  <Text style={styles.nativeCastText}>Open Native Cast Picker</Text>
                </TouchableOpacity>
              )}

              {/* Network Info */}
              <View style={[styles.networkInfo, {backgroundColor: `${primary}10`}]}>
                <Icon name="wifi" size={16} color={primary} />
                <Text style={[styles.networkText, {color: textSecondary}]}>
                  Ensure your phone and TV are connected to the same WiFi network
                </Text>
              </View>

              {/* Error Message */}
              {castError && (
                <View style={[styles.errorContainer, {backgroundColor: `${errorColor}15`}]}>
                  <Icon name="alert-circle" size={16} color={errorColor} />
                  <Text style={[styles.errorText, {color: errorColor}]}>{castError}</Text>
                </View>
              )}

              {/* Scanning */}
              {isScanning && (
                <View style={styles.scanningContainer}>
                  <ActivityIndicator size="large" color={primary} />
                  <Text style={[styles.scanningText, {color: text}]}>
                    Scanning for Cast devices...
                  </Text>
                  <Text style={[styles.scanningHint, {color: textMuted}]}>
                    This may take up to 10 seconds
                  </Text>
                </View>
              )}

              {/* Device List */}
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
                        {
                          backgroundColor: device.isConnected ? `${success}10` : background,
                          borderColor: device.isConnected ? success : border,
                        },
                      ]}
                      onPress={() => device.isConnected ? disconnectDevice() : connectToDevice(device)}>
                      <Text style={styles.deviceIcon}>{getDeviceIcon(device.modelName)}</Text>
                      <View style={styles.deviceInfo}>
                        <Text style={[styles.deviceName, {color: text}]}>
                          {device.friendlyName}
                        </Text>
                        <Text style={[styles.deviceType, {color: textMuted}]}>
                          {device.modelName || 'Cast Device'}
                        </Text>
                      </View>
                      {device.isConnected ? (
                        <View style={[styles.connectedBadge, {backgroundColor: success}]}>
                          <Icon name="check" size={12} color="#FFF" />
                          <Text style={styles.connectedText}>Connected</Text>
                        </View>
                      ) : (
                        <Icon name="cast" size={20} color={primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* No Devices Found */}
              {!isScanning && castDevices.length === 0 && !castError && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyEmoji}>📡</Text>
                  <Text style={[styles.emptyText, {color: text}]}>
                    No Cast devices found
                  </Text>
                  <Text style={[styles.emptyHint, {color: textMuted}]}>
                    Make sure your Chromecast or Smart TV is turned on
                  </Text>
                  <TouchableOpacity
                    style={[styles.rescanButton, {backgroundColor: primary}]}
                    onPress={scanForDevices}>
                    <Icon name="refresh-cw" size={16} color="#FFF" />
                    <Text style={styles.rescanText}>Scan Again</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Troubleshooting Tips */}
              <View style={[styles.tipsContainer, {backgroundColor: `${textMuted}08`}]}>
                <Text style={[styles.tipsTitle, {color: text}]}>💡 Troubleshooting Tips</Text>
                <Text style={[styles.tipText, {color: textMuted}]}>
                  • Both devices must be on the same WiFi network{'\n'}
                  • Restart your Chromecast/TV if not visible{'\n'}
                  • Grant location permission for device discovery{'\n'}
                  • Make sure Google Home app can see your Cast device{'\n'}
                  • Try the "Open Native Cast Picker" button above
                </Text>
              </View>

              <View style={{height: Spacing.xl}} />
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
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{transform: [{scale: scaleAnim}], width: '47%'}}>
      <TouchableOpacity
        style={[styles.actionCard, {backgroundColor: card}, Shadows.md]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}>
        <View style={[styles.actionIcon, {backgroundColor: `${color}15`}]}>
          <Icon name={icon} size={24} color={color} />
        </View>
        <Text style={[styles.actionLabel, {color: text}]}>{label}</Text>
        <Text style={styles.actionEmoji}>{emoji}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  greeting: {
    fontSize: FontSizes.sm,
    marginBottom: 4,
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
  },
  avatarContainer: {
    borderWidth: 3,
    borderRadius: BorderRadius.full,
    padding: 2,
  },
  castButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    position: 'relative',
  },
  castingDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
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
  castingBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  castingEmoji: {
    fontSize: 24,
  },
  castingText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  castingSubtext: {
    fontSize: FontSizes.xs,
  },
  stopCastButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  sectionEmoji: {
    fontSize: FontSizes.lg,
  },
  seeAll: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  continueCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
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
  continueDecoration3: {
    position: 'absolute',
    top: 20,
    left: '40%',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  continueContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.base,
  },
  continueIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  continueText: {
    flex: 1,
  },
  continueTitle: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
    fontWeight: '600',
  },
  continueSubtitle: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  continueMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  continueMetaText: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: Spacing.sm,
  },
  continueProgress: {
    zIndex: 1,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  actionCard: {
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
  actionLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  actionEmoji: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    fontSize: 16,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  modalEmoji: {
    fontSize: 24,
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  modalBody: {
    padding: Spacing.lg,
  },
  nativeCastButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  nativeCastText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: '#FFF',
  },
  networkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  networkText: {
    fontSize: FontSizes.sm,
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: FontSizes.sm,
    flex: 1,
  },
  scanningContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  scanningText: {
    fontSize: FontSizes.sm,
    marginTop: Spacing.md,
    fontWeight: '500',
  },
  scanningHint: {
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  emptyHint: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  rescanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  rescanText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: '#FFF',
  },
  devicesList: {
    marginTop: Spacing.sm,
  },
  devicesTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    marginBottom: Spacing.sm,
  },
  deviceIcon: {
    fontSize: 28,
    marginRight: Spacing.md,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    marginBottom: 2,
  },
  deviceType: {
    fontSize: FontSizes.xs,
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  connectedText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: '#FFF',
  },
  tipsContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  tipsTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  tipText: {
    fontSize: FontSizes.xs,
    lineHeight: 18,
  },
});
