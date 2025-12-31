/**
 * Main Tab Navigator
 * Bottom tab navigation for main app screens
 */

import React from 'react';
import {Platform, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import {HomeScreen} from '../screens/main/HomeScreen';
import {LearnScreen} from '../screens/main/LearnScreen';
import {QuizzesScreen} from '../screens/main/QuizzesScreen';
import {ProgressScreen} from '../screens/main/ProgressScreen';
import {ProfileScreen} from '../screens/main/ProfileScreen';
import {Icon} from '../components/ui/Icon';
import {Shadows} from '../constants/theme';
import {useThemeColor} from '../hooks/useThemeColor';
import type {MainTabParamList} from '../types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({
  name,
  color,
  focused,
}: {
  name: string;
  color: string;
  focused: boolean;
}) {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withSpring(focused ? 1.1 : 1, {
      damping: 15,
      stiffness: 200,
    });
  }, [focused, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Icon name={name} size={24} color={color} />
    </Animated.View>
  );
}

export function MainTabNavigator() {
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');
  const tabIconDefault = useThemeColor({}, 'tabIconDefault');

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: primaryColor,
        tabBarInactiveTintColor: tabIconDefault,
        tabBarStyle: {
          backgroundColor: cardColor,
          borderTopColor: borderColor,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          ...Shadows.md,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({color, focused}) => (
            <TabIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Learn"
        component={LearnScreen}
        options={{
          tabBarIcon: ({color, focused}) => (
            <TabIcon name="book-open" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Quizzes"
        component={QuizzesScreen}
        options={{
          tabBarIcon: ({color, focused}) => (
            <TabIcon name="file-text" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          tabBarIcon: ({color, focused}) => (
            <TabIcon name="bar-chart-2" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({color, focused}) => (
            <TabIcon name="user" color={color} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
