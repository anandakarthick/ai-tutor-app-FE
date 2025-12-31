/**
 * StatsCard Component
 * Display quick statistics
 */

import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {useThemeColor} from '../../../hooks/useThemeColor';
import {BorderRadius, FontSizes, Shadows, Spacing} from '../../../constants/theme';
import {Icon} from '../Icon';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  iconColor,
  trend,
  delay = 0,
}: StatsCardProps) {
  const card = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');
  const success = useThemeColor({}, 'success');
  const error = useThemeColor({}, 'error');

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

  const color = iconColor || primary;

  return (
    <Animated.View
      style={[
        styles.container,
        {backgroundColor: card},
        Shadows.md,
        {transform: [{scale: scaleAnim}], opacity: opacityAnim},
      ]}>
      <View
        style={[
          styles.iconContainer,
          {backgroundColor: `${color}15`},
        ]}>
        <Icon name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.title, {color: textSecondary}]}>{title}</Text>
      <View style={styles.valueContainer}>
        <Text style={[styles.value, {color: text}]}>{value}</Text>
        {trend && (
          <View
            style={[
              styles.trendBadge,
              {
                backgroundColor: trend.isPositive
                  ? `${success}20`
                  : `${error}20`,
              },
            ]}>
            <Icon
              name={trend.isPositive ? 'arrow-up' : 'arrow-down'}
              size={10}
              color={trend.isPositive ? success : error}
            />
            <Text
              style={[
                styles.trendText,
                {color: trend.isPositive ? success : error},
              ]}>
              {trend.value}%
            </Text>
          </View>
        )}
      </View>
      {subtitle && (
        <Text style={[styles.subtitle, {color: textSecondary}]}>
          {subtitle}
        </Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.base,
    borderRadius: BorderRadius.xl,
    minWidth: 140,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginLeft: Spacing.sm,
  },
  trendText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    marginLeft: 2,
  },
  subtitle: {
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
  },
});
