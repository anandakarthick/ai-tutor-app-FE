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
  getSubjectTheme,
} from '../../constants/theme';

const SUBJECTS = [
  {id: '1', name: 'Mathematics', icon: 'function', progress: 20, chapters: 15, emoji: '📐'},
  {id: '2', name: 'Science', icon: 'flask', progress: 12, chapters: 16, emoji: '🔬'},
  {id: '3', name: 'English', icon: 'book', progress: 33, chapters: 12, emoji: '📖'},
  {id: '4', name: 'Social Science', icon: 'globe', progress: 4, chapters: 24, emoji: '🌍'},
  {id: '5', name: 'Hindi', icon: 'book', progress: 20, chapters: 10, emoji: '📚'},
  {id: '6', name: 'Physics', icon: 'atom', progress: 15, chapters: 12, emoji: '⚛️'},
];

export function LearnScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const card = useThemeColor({}, 'card');
  const primary = useThemeColor({}, 'primary');

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

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: background}]}
      edges={['top']}>
      <Animated.View
        style={[
          styles.header,
          {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
        ]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.title, {color: text}]}>Learn 📚</Text>
            <Text style={[styles.subtitle, {color: textSecondary}]}>
              Pick a subject to start
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.searchBtn, {backgroundColor: card}, Shadows.sm]}>
            <Icon name="search" size={20} color={primary} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <Animated.View
          style={[
            styles.subjectsGrid,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          {SUBJECTS.map((subject, index) => {
            const subjectTheme = getSubjectTheme(subject.name, colorScheme);
            return (
              <SubjectGridCard
                key={subject.id}
                name={subject.name}
                icon={subject.icon}
                emoji={subject.emoji}
                progress={subject.progress}
                chapters={subject.chapters}
                theme={subjectTheme}
                cardColor={card}
                textColor={text}
                textSecondary={textSecondary}
                delay={index * 50}
              />
            );
          })}
        </Animated.View>
        <View style={{height: Spacing.xl}} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SubjectGridCard({
  name,
  icon,
  emoji,
  progress,
  chapters,
  theme,
  cardColor,
  textColor,
  textSecondary,
  delay,
}: {
  name: string;
  icon: string;
  emoji: string;
  progress: number;
  chapters: number;
  theme: {primary: string; background: string; icon: string};
  cardColor: string;
  textColor: string;
  textSecondary: string;
  delay: number;
}) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        delay,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay]);

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
    <Animated.View
      style={[
        styles.subjectCardWrapper,
        {transform: [{scale: scaleAnim}], opacity: opacityAnim},
      ]}>
      <TouchableOpacity
        style={[styles.subjectCard, {backgroundColor: cardColor}, Shadows.md]}
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}>
        <View style={styles.emojiCorner}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <View style={[styles.subjectIcon, {backgroundColor: theme.background}]}>
          <Icon name={icon} size={28} color={theme.icon} />
        </View>
        <Text style={[styles.subjectName, {color: textColor}]} numberOfLines={1}>
          {name}
        </Text>
        <Text style={[styles.subjectMeta, {color: textSecondary}]}>
          {chapters} chapters
        </Text>
        <View style={styles.progressContainer}>
          <ProgressBar progress={progress} size="sm" showLabel={false} />
          <Text style={[styles.progressText, {color: theme.primary}]}>
            {progress}%
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  subtitle: {fontSize: FontSizes.base},
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    position: 'relative',
    overflow: 'hidden',
  },
  emojiCorner: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
  },
  emoji: {
    fontSize: 16,
  },
  subjectIcon: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  subjectName: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  subjectMeta: {
    fontSize: FontSizes.xs,
    marginBottom: Spacing.md,
  },
  progressContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    minWidth: 30,
  },
});
