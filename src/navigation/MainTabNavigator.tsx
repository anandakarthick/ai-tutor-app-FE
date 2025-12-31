/**
 * Main Tab Navigator
 * Bottom tab navigation for main app screens
 */

import React, {useEffect, useRef} from 'react';
import {Platform, StyleSheet, Animated, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {HomeScreen} from '../screens/main/HomeScreen';
import {LearnScreen} from '../screens/main/LearnScreen';
import {QuizzesScreen} from '../screens/main/QuizzesScreen';
import {ProgressScreen} from '../screens/main/ProgressScreen';
import {ProfileScreen} from '../screens/main/ProfileScreen';
import {Icon} from '../components/ui/Icon';
import {Shadows, BorderRadius} from '../constants/theme';
import {useThemeColor} from '../hooks/useThemeColor';
import type {MainTabParamList} from '../types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({
  name,
  color,
  focused,
  isCenter,
}: {
  name: string;
  color: string;
  focused: boolean;
  isCenter?: boolean;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const primary = useThemeColor({}, 'primary');

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1.15 : 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [focused]);

  if (isCenter) {
    return (
      <Animated.View
        style={[
          styles.centerIcon,
          {
            backgroundColor: primary,
            transform: [{scale: scaleAnim}],
          },
          focused && Shadows.glow,
        ]}>
        <Icon name={name} size={24} color="#FFFFFF" />
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{transform: [{scale: scaleAnim}]}}>
      <Icon name={name} size={24} color={color} />
    </Animated.View>
  );
}

export function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');
  const tabIconDefault = useThemeColor({}, 'tabIconDefault');

  // Calculate bottom padding based on device
  const bottomPadding = Math.max(insets.bottom, 10);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: primaryColor,
        tabBarInactiveTintColor: tabIconDefault,
        tabBarStyle: {
          backgroundColor: cardColor,
          borderTopColor: borderColor,
          borderTopWidth: 1,
          height: 65 + bottomPadding,
          paddingTop: 10,
          paddingBottom: bottomPadding,
          ...Shadows.md,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({color, focused}) => (
            <TabIcon name="home" color={color} focused={focused} />
          ),
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Learn"
        component={LearnScreen}
        options={{
          tabBarIcon: ({color, focused}) => (
            <TabIcon name="book-open" color={color} focused={focused} />
          ),
          tabBarLabel: 'Learn',
        }}
      />
      <Tab.Screen
        name="Quizzes"
        component={QuizzesScreen}
        options={{
          tabBarIcon: ({color, focused}) => (
            <TabIcon
              name="file-text"
              color={focused ? '#FFFFFF' : color}
              focused={focused}
              isCenter
            />
          ),
          tabBarLabel: 'Quiz',
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          tabBarIcon: ({color, focused}) => (
            <TabIcon name="bar-chart-2" color={color} focused={focused} />
          ),
          tabBarLabel: 'Progress',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({color, focused}) => (
            <TabIcon name="user" color={color} focused={focused} />
          ),
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  centerIcon: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
});
