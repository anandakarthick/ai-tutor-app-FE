/**
 * Learn Screen
 * Browse subjects and chapters
 */

import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  useColorScheme,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useThemeColor} from '../../hooks/useThemeColor';
import {Icon, ProgressBar} from '../../components/ui';
import {
  BorderRadius,
  FontSizes,
  Shadows,
  Spacing,
  getSubjectColor,
} from '../../constants/theme';

const SUBJECTS = [
  {id: '1', name: 'Mathematics', icon: 'function', progress: 20, chapters: 15},
  {id: '2', name: 'Science', icon: 'flask', progress: 12, chapters: 16},
  {id: '3', name: 'English', icon: 'book', progress: 33, chapters: 12},
  {id: '4', name: 'Social Science', icon: 'globe', progress: 4, chapters: 24},
  {id: '5', name: 'Hindi', icon: 'book', progress: 20, chapters: 10},
];

export function LearnScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const card = useThemeColor({}, 'card');

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: background}]}
      edges={['top']}>
      <Animated.View style={[styles.header, {opacity: fadeAnim}]}>
        <Text style={[styles.title, {color: text}]}>Learn</Text>
        <Text style={[styles.subtitle, {color: textSecondary}]}>
          Select a subject to start learning
        </Text>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.subjectsGrid, {opacity: fadeAnim}]}>
          {SUBJECTS.map((subject) => (
            <View key={subject.id} style={styles.subjectCardWrapper}>
              <TouchableOpacity
                style={[styles.subjectCard, {backgroundColor: card}, Shadows.md]}
                activeOpacity={0.8}>
                <View
                  style={[
                    styles.subjectIcon,
                    {
                      backgroundColor: `${getSubjectColor(
                        subject.name,
                        colorScheme,
                      )}15`,
                    },
                  ]}>
                  <Icon
                    name={subject.icon}
                    size={28}
                    color={getSubjectColor(subject.name, colorScheme)}
                  />
                </View>
                <Text
                  style={[styles.subjectName, {color: text}]}
                  numberOfLines={1}>
                  {subject.name}
                </Text>
                <Text style={[styles.subjectMeta, {color: textSecondary}]}>
                  {subject.chapters} chapters
                </Text>
                <View style={styles.progressContainer}>
                  <ProgressBar
                    progress={subject.progress}
                    size="sm"
                    showLabel={false}
                  />
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  subtitle: {fontSize: FontSizes.base},
  scrollContent: {
    padding: Spacing.lg,
    paddingTop: 0,
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  subjectCardWrapper: {width: '47%'},
  subjectCard: {
    padding: Spacing.base,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  subjectIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  subjectName: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  subjectMeta: {
    fontSize: FontSizes.xs,
    marginBottom: Spacing.md,
  },
  progressContainer: {width: '100%'},
});
