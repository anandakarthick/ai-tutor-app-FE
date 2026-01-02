/**
 * Study Plan Screen
 * View and manage AI-generated study plans with API integration
 */

import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useThemeColor} from '../../hooks/useThemeColor';
import {useStudent} from '../../context';
import {useStudyPlans} from '../../hooks';
import {studyPlansApi} from '../../services/api';
import {Icon, Button} from '../../components/ui';
import {BorderRadius, FontSizes, Spacing, Shadows} from '../../constants/theme';
import type {StudyPlan, StudyPlanItem} from '../../types/api';

// Custom Calendar Icon Component that shows today's date
function TodayCalendarIcon({ size = 40, color = '#6366F1' }: { size?: number; color?: string }) {
  const today = new Date();
  const day = today.getDate();
  const month = today.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  
  const iconSize = size;
  const fontSize = size * 0.35;
  const monthFontSize = size * 0.2;
  
  return (
    <View style={[calendarStyles.container, { width: iconSize, height: iconSize }]}>
      <View style={[calendarStyles.topBar, { backgroundColor: color }]}>
        <Text style={[calendarStyles.month, { fontSize: monthFontSize }]}>{month}</Text>
      </View>
      <View style={calendarStyles.body}>
        <Text style={[calendarStyles.day, { fontSize: fontSize, color }]}>{day}</Text>
      </View>
    </View>
  );
}

const calendarStyles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  topBar: {
    height: '30%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  month: {
    color: '#FFF',
    fontWeight: '700',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  day: {
    fontWeight: '800',
  },
});

export function StudyPlanScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const {currentStudent} = useStudent();
  const {plans, loading, generate, refresh} = useStudyPlans();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<StudyPlan | null>(null);
  const [planItems, setPlanItems] = useState<StudyPlanItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Create form state
  const [dailyHours, setDailyHours] = useState('2');
  const [targetExam, setTargetExam] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const primary = useThemeColor({}, 'primary');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const primaryBg = useThemeColor({}, 'primaryBackground');
  const success = useThemeColor({}, 'success');
  const warning = useThemeColor({}, 'warning');

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Select active plan by default
  useEffect(() => {
    if (plans.length > 0 && !selectedPlan) {
      const activePlan = plans.find(p => p.status === 'active') || plans[0];
      setSelectedPlan(activePlan);
    }
  }, [plans, selectedPlan]);

  // Load plan items when plan is selected
  useEffect(() => {
    if (selectedPlan) {
      loadPlanItems(selectedPlan.id);
    }
  }, [selectedPlan]);

  const loadPlanItems = async (planId: string) => {
    try {
      setLoadingItems(true);
      const response = await studyPlansApi.getById(planId);
      if (response.success && response.data?.items) {
        setPlanItems(response.data.items);
      }
    } catch (err) {
      console.log('Load plan items error:', err);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleCreatePlan = async () => {
    if (!endDate) {
      Alert.alert('Error', 'Please select an end date');
      return;
    }

    setCreating(true);
    try {
      const newPlan = await generate({
        startDate,
        endDate,
        dailyHours: parseInt(dailyHours),
        targetExam: targetExam || undefined,
      });

      if (newPlan) {
        setSelectedPlan(newPlan);
        setShowCreateModal(false);
        Alert.alert('Success', 'Study plan created successfully! 🎉');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create study plan');
    } finally {
      setCreating(false);
    }
  };

  const handleCompleteItem = async (itemId: string) => {
    try {
      await studyPlansApi.completeItem(itemId);
      setPlanItems(prev =>
        prev.map(item =>
          item.id === itemId ? {...item, status: 'completed'} : item
        )
      );
    } catch (err) {
      console.log('Complete item error:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return success;
      case 'in_progress': return primary;
      case 'skipped': return textMuted;
      default: return warning;
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'in_progress': return '📖';
      case 'skipped': return '⏭️';
      default: return '⏳';
    }
  };

  const calculateProgress = () => {
    if (planItems.length === 0) return 0;
    const completed = planItems.filter(i => i.status === 'completed').length;
    return Math.round((completed / planItems.length) * 100);
  };

  // Group items by date
  const groupedItems = planItems.reduce((acc, item) => {
    const date = item.scheduledDate?.split('T')[0] || 'Unscheduled';
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {} as Record<string, StudyPlanItem[]>);

  // Get today's formatted date
  const getTodayFormatted = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculate FAB bottom position based on safe area
  const fabBottomPosition = Math.max(insets.bottom + 70, 90);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: background}]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primary} />
          <Text style={[styles.loadingText, {color: textSecondary}]}>Loading study plans...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: background}]}>
      <SafeAreaView style={styles.flex1} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="chevron-left" size={24} color={text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, {color: text}]}>Study Plan 📅</Text>
            <Text style={[styles.headerSubtitle, {color: textSecondary}]}>
              Organize your learning
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TodayCalendarIcon size={36} color={primary} />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[primary]} />
          }>
          
          {/* Stats Cards */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, {backgroundColor: card}, Shadows.sm]}>
              <Icon name="calendar" size={24} color={primary} />
              <Text style={[styles.statValue, {color: text}]}>{plans.length}</Text>
              <Text style={[styles.statLabel, {color: textSecondary}]}>Plans</Text>
            </View>
            <View style={[styles.statCard, {backgroundColor: card}, Shadows.sm]}>
              <Icon name="check-circle" size={24} color={success} />
              <Text style={[styles.statValue, {color: text}]}>{planItems.filter(i => i.status === 'completed').length}</Text>
              <Text style={[styles.statLabel, {color: textSecondary}]}>Completed</Text>
            </View>
            <View style={[styles.statCard, {backgroundColor: card}, Shadows.sm]}>
              <Icon name="target" size={24} color={warning} />
              <Text style={[styles.statValue, {color: text}]}>{calculateProgress()}%</Text>
              <Text style={[styles.statLabel, {color: textSecondary}]}>Progress</Text>
            </View>
          </View>

          {plans.length === 0 ? (
            // Empty State - Colorful like Quizzes
            <View style={[styles.emptyCard, {backgroundColor: card}]}>
              <View style={[styles.emptyIcon, {backgroundColor: primaryBg}]}>
                <TodayCalendarIcon size={50} color={primary} />
              </View>
              <Text style={[styles.emptyTitle, {color: text}]}>
                No Study Plans Yet
              </Text>
              <Text style={[styles.emptyText, {color: textSecondary}]}>
                Create an AI-powered study plan to organize your learning journey and achieve your academic goals!
              </Text>
              <TouchableOpacity
                style={[styles.actionButton, {backgroundColor: primary}]}
                onPress={() => setShowCreateModal(true)}>
                <Icon name="plus" size={18} color="#FFF" />
                <Text style={styles.actionButtonText}>Create Study Plan</Text>
              </TouchableOpacity>
              
              {/* Tips Box */}
              <View style={[styles.tipsBox, {backgroundColor: background, borderColor: border}]}>
                <Text style={[styles.tipsTitle, {color: text}]}>
                  💡 Benefits of Study Plans:
                </Text>
                <Text style={[styles.tipItem, {color: textSecondary}]}>
                  • Personalized daily learning schedule
                </Text>
                <Text style={[styles.tipItem, {color: textSecondary}]}>
                  • AI-optimized for better results
                </Text>
                <Text style={[styles.tipItem, {color: textSecondary}]}>
                  • Track your progress easily
                </Text>
                <Text style={[styles.tipItem, {color: textSecondary}]}>
                  • Stay consistent with reminders
                </Text>
              </View>
            </View>
          ) : (
            <>
              {/* Plan Selector */}
              <Animated.View style={{opacity: fadeAnim}}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.planSelector}>
                  {plans.map(plan => (
                    <TouchableOpacity
                      key={plan.id}
                      style={[
                        styles.planTab,
                        {
                          backgroundColor: selectedPlan?.id === plan.id ? primary : card,
                          borderColor: selectedPlan?.id === plan.id ? primary : border,
                        },
                      ]}
                      onPress={() => setSelectedPlan(plan)}>
                      <Text style={[
                        styles.planTabText,
                        {color: selectedPlan?.id === plan.id ? '#FFF' : text},
                      ]}>
                        {plan.planName || 'Study Plan'}
                      </Text>
                      <Text style={[
                        styles.planTabStatus,
                        {color: selectedPlan?.id === plan.id ? 'rgba(255,255,255,0.8)' : textMuted},
                      ]}>
                        {plan.status}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </Animated.View>

              {/* Progress Card */}
              {selectedPlan && (
                <Animated.View style={[styles.progressCard, {backgroundColor: primaryBg, opacity: fadeAnim}]}>
                  <View style={styles.progressHeader}>
                    <View style={styles.progressHeaderLeft}>
                      <TodayCalendarIcon size={32} color={primary} />
                      <View style={styles.progressHeaderText}>
                        <Text style={[styles.progressTitle, {color: primary}]}>Today's Progress</Text>
                        <Text style={[styles.progressDate, {color: textMuted}]}>{getTodayFormatted()}</Text>
                      </View>
                    </View>
                    <Text style={[styles.progressPercent, {color: primary}]}>{calculateProgress()}%</Text>
                  </View>
                  <View style={[styles.progressBar, {backgroundColor: border}]}>
                    <View 
                      style={[styles.progressFill, {backgroundColor: primary, width: `${calculateProgress()}%`}]} 
                    />
                  </View>
                  <View style={styles.progressStats}>
                    <Text style={[styles.progressStat, {color: textSecondary}]}>
                      ✅ {planItems.filter(i => i.status === 'completed').length} / {planItems.length} topics
                    </Text>
                    <Text style={[styles.progressStat, {color: textSecondary}]}>
                      ⏱️ {selectedPlan.dailyTargetMinutes || 60} min/day
                    </Text>
                  </View>
                </Animated.View>
              )}

              {/* Plan Items */}
              {loadingItems ? (
                <ActivityIndicator size="small" color={primary} style={{marginTop: Spacing.xl}} />
              ) : (
                <Animated.View style={{opacity: fadeAnim}}>
                  {Object.entries(groupedItems).length > 0 ? (
                    Object.entries(groupedItems).map(([date, items]) => (
                      <View key={date} style={styles.dateSection}>
                        <Text style={[styles.dateHeader, {color: text}]}>
                          {formatDate(date)}
                        </Text>
                        {items.map(item => (
                          <TouchableOpacity
                            key={item.id}
                            style={[styles.itemCard, {backgroundColor: card, borderColor: border}, Shadows.sm]}
                            onPress={() => {
                              if (item.topicId) {
                                navigation.navigate('Lesson', {topicId: item.topicId});
                              }
                            }}>
                            <View style={[styles.itemStatus, {backgroundColor: `${getStatusColor(item.status)}15`}]}>
                              <Text style={styles.itemStatusEmoji}>{getStatusEmoji(item.status)}</Text>
                            </View>
                            <View style={styles.itemContent}>
                              <Text style={[styles.itemTitle, {color: text}]} numberOfLines={1}>
                                {item.topic?.topicTitle || 'Topic'}
                              </Text>
                              <Text style={[styles.itemSubject, {color: textMuted}]} numberOfLines={1}>
                                {item.topic?.chapter?.book?.subject?.subjectName || 'Subject'} • {item.estimatedMinutes || 30} min
                              </Text>
                            </View>
                            {item.status !== 'completed' && (
                              <TouchableOpacity
                                style={[styles.completeButton, {backgroundColor: success}]}
                                onPress={() => handleCompleteItem(item.id)}>
                                <Icon name="check" size={16} color="#FFF" />
                              </TouchableOpacity>
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    ))
                  ) : (
                    <View style={[styles.noItemsCard, {backgroundColor: card}]}>
                      <View style={[styles.emptyIcon, {backgroundColor: primaryBg}]}>
                        <TodayCalendarIcon size={40} color={primary} />
                      </View>
                      <Text style={[styles.noItemsText, {color: text}]}>No topics scheduled</Text>
                      <Text style={[styles.noItemsSubtext, {color: textMuted}]}>
                        Topics will appear here when you create a plan
                      </Text>
                    </View>
                  )}
                </Animated.View>
              )}
            </>
          )}
          
          <View style={{height: 140}} />
        </ScrollView>
      </SafeAreaView>

      {/* Floating Action Button - Rounded Rectangle with Text */}
      <TouchableOpacity
        style={[
          styles.fab, 
          {
            backgroundColor: primary,
            bottom: fabBottomPosition,
          }
        ]}
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.8}>
        <Icon name="plus" size={20} color="#FFF" />
        <Text style={styles.fabText}>Add Plan</Text>
      </TouchableOpacity>

      {/* Create Plan Modal */}
      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {backgroundColor: card}]}>
            <View style={[styles.modalHeader, {borderBottomColor: border}]}>
              <View style={styles.modalHeaderLeft}>
                <TodayCalendarIcon size={32} color={primary} />
                <Text style={[styles.modalTitle, {color: text}]}>Create Study Plan</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Icon name="x" size={24} color={textMuted} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={[styles.inputLabel, {color: text}]}>Daily Study Hours</Text>
              <View style={styles.hoursRow}>
                {['1', '2', '3', '4', '5'].map(hour => (
                  <TouchableOpacity
                    key={hour}
                    style={[
                      styles.hourChip,
                      {
                        backgroundColor: dailyHours === hour ? primary : background,
                        borderColor: dailyHours === hour ? primary : border,
                      },
                    ]}
                    onPress={() => setDailyHours(hour)}>
                    <Text style={[styles.hourText, {color: dailyHours === hour ? '#FFF' : text}]}>
                      {hour}h
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, {color: text}]}>Target Exam (Optional)</Text>
              <TextInput
                style={[styles.input, {backgroundColor: background, color: text, borderColor: border}]}
                placeholder="e.g., Board Exams, JEE, NEET"
                placeholderTextColor={textMuted}
                value={targetExam}
                onChangeText={setTargetExam}
              />

              <Text style={[styles.inputLabel, {color: text}]}>Start Date</Text>
              <TextInput
                style={[styles.input, {backgroundColor: background, color: text, borderColor: border}]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={textMuted}
                value={startDate}
                onChangeText={setStartDate}
              />

              <Text style={[styles.inputLabel, {color: text}]}>End Date</Text>
              <TextInput
                style={[styles.input, {backgroundColor: background, color: text, borderColor: border}]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={textMuted}
                value={endDate}
                onChangeText={setEndDate}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.cancelButton, {borderColor: border}]}
                  onPress={() => setShowCreateModal(false)}
                  disabled={creating}>
                  <Text style={[styles.cancelButtonText, {color: text}]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.generateButton, {backgroundColor: primary, opacity: creating ? 0.7 : 1}]}
                  onPress={handleCreatePlan}
                  disabled={creating}>
                  {creating ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Icon name="zap" size={18} color="#FFF" />
                      <Text style={styles.generateButtonText}>Generate Plan</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
              
              <View style={{height: 30}} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function formatDate(dateStr: string): string {
  if (dateStr === 'Unscheduled') return dateStr;
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return '📅 Today';
  if (date.toDateString() === tomorrow.toDateString()) return '📆 Tomorrow';
  
  return date.toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'});
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md, 
    fontSize: FontSizes.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 40, 
    height: 40, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 24, 
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  headerRight: {
    marginRight: Spacing.xs,
  },
  content: {
    padding: 20,
    paddingTop: 8,
    flexGrow: 1,
  },
  
  // Stats Cards
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  
  // Empty State - Colorful like Quizzes
  emptyCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    gap: 10,
    marginBottom: 24,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  tipsBox: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  tipItem: {
    fontSize: 13,
    lineHeight: 24,
  },
  
  // No items card
  noItemsCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  noItemsText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  noItemsSubtext: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
  },
  
  // Plan Selector
  planSelector: {
    paddingBottom: Spacing.lg, 
    gap: Spacing.sm,
  },
  planTab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    minWidth: 120,
  },
  planTabText: {
    fontSize: FontSizes.sm, 
    fontWeight: '600',
  },
  planTabStatus: {
    fontSize: FontSizes.xs, 
    marginTop: 2, 
    textTransform: 'capitalize',
  },
  
  // Progress Card
  progressCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: Spacing.md,
  },
  progressHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  progressHeaderText: {
    flex: 1,
  },
  progressTitle: {
    fontSize: FontSizes.base, 
    fontWeight: '600',
  },
  progressDate: {
    fontSize: FontSizes.xs, 
    marginTop: 2,
  },
  progressPercent: {
    fontSize: FontSizes.xl, 
    fontWeight: '700',
  },
  progressBar: {
    height: 8, 
    borderRadius: 4, 
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%', 
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: Spacing.md,
  },
  progressStat: {
    fontSize: FontSizes.sm,
  },
  
  // Date Section
  dateSection: {
    marginBottom: Spacing.lg,
  },
  dateHeader: {
    fontSize: FontSizes.base, 
    fontWeight: '700', 
    marginBottom: Spacing.md,
  },
  
  // Item Card
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  itemStatus: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  itemStatusEmoji: {
    fontSize: 18,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: FontSizes.sm, 
    fontWeight: '600', 
    marginBottom: 2,
  },
  itemSubject: {
    fontSize: FontSizes.xs,
  },
  completeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // FAB - Rounded Rectangle with Text
  fab: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  
  // Modal
  modalOverlay: {
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
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
    marginTop: Spacing.md,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: FontSizes.base,
  },
  hoursRow: {
    flexDirection: 'row', 
    gap: Spacing.sm,
  },
  hourChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
  },
  hourText: {
    fontSize: FontSizes.sm, 
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
  generateButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  generateButtonText: {
    color: '#FFF',
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
});
