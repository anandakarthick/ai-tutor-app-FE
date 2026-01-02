/**
 * No Internet Screen
 * Beautiful offline screen matching the app's orange theme
 */

import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useThemeColor} from '../../hooks/useThemeColor';
import {useNetwork} from '../../context/NetworkContext';
import {Icon} from '../ui';
import {BorderRadius, FontSizes, Spacing, Shadows} from '../../constants/theme';

export function NoInternetScreen() {
  const {checkConnection} = useNetwork();
  const [isRetrying, setIsRetrying] = useState(false);

  // Theme colors
  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const primary = useThemeColor({}, 'primary');
  const primaryLight = useThemeColor({}, 'primaryLight');
  const primaryBg = useThemeColor({}, 'primaryBackground');
  const card = useThemeColor({}, 'card');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim1 = useRef(new Animated.Value(0)).current;
  const waveAnim2 = useRef(new Animated.Value(0)).current;
  const waveAnim3 = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for the icon
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Wave animations (ripple effect)
    const createWaveAnimation = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(anim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    createWaveAnimation(waveAnim1, 0).start();
    createWaveAnimation(waveAnim2, 600).start();
    createWaveAnimation(waveAnim3, 1200).start();

    // Bounce animation for emoji
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    bounceAnimation.start();

    return () => {
      pulseAnimation.stop();
      bounceAnimation.stop();
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    
    // Animate button
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    await checkConnection();
    
    // Delay to show loading state
    setTimeout(() => {
      setIsRetrying(false);
    }, 1500);
  };

  const waveStyle = (anim: Animated.Value) => ({
    opacity: anim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.6, 0.3, 0],
    }),
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 2.5],
        }),
      },
    ],
  });

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: background}]} edges={['top', 'bottom']}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{scale: scaleAnim}],
          },
        ]}
      >
        {/* Animated Icon Section */}
        <View style={styles.iconSection}>
          {/* Ripple waves */}
          <Animated.View style={[styles.wave, {borderColor: primary}, waveStyle(waveAnim1)]} />
          <Animated.View style={[styles.wave, {borderColor: primary}, waveStyle(waveAnim2)]} />
          <Animated.View style={[styles.wave, {borderColor: primary}, waveStyle(waveAnim3)]} />
          
          {/* Main icon container */}
          <Animated.View 
            style={[
              styles.iconContainer,
              {
                backgroundColor: primary,
                transform: [{scale: pulseAnim}],
              },
              Shadows.lg,
            ]}
          >
            <Icon name="wifi-off" size={48} color="#FFFFFF" />
          </Animated.View>
        </View>

        {/* Bouncing Emoji */}
        <Animated.Text 
          style={[
            styles.emoji,
            {transform: [{translateY: bounceAnim}]},
          ]}
        >
          😔
        </Animated.Text>

        {/* Text Content */}
        <View style={styles.textSection}>
          <Text style={[styles.title, {color: text}]}>
            Oops! No Internet
          </Text>
          <Text style={[styles.subtitle, {color: textSecondary}]}>
            It looks like you're not connected to the internet.
          </Text>
          <Text style={[styles.description, {color: textMuted}]}>
            Please check your Wi-Fi or mobile data connection and try again.
          </Text>
        </View>

        {/* Tips Card */}
        <View style={[styles.tipsCard, {backgroundColor: card, borderColor: primaryBg}, Shadows.sm]}>
          <View style={styles.tipsHeader}>
            <View style={[styles.tipIconBg, {backgroundColor: primaryBg}]}>
              <Icon name="zap" size={16} color={primary} />
            </View>
            <Text style={[styles.tipsTitle, {color: primary}]}>Quick Tips</Text>
          </View>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <View style={[styles.tipBullet, {backgroundColor: primary}]} />
              <Text style={[styles.tipText, {color: textSecondary}]}>
                Turn on Wi-Fi or mobile data
              </Text>
            </View>
            <View style={styles.tipItem}>
              <View style={[styles.tipBullet, {backgroundColor: primary}]} />
              <Text style={[styles.tipText, {color: textSecondary}]}>
                Check if airplane mode is off
              </Text>
            </View>
            <View style={styles.tipItem}>
              <View style={[styles.tipBullet, {backgroundColor: primary}]} />
              <Text style={[styles.tipText, {color: textSecondary}]}>
                Move closer to your router
              </Text>
            </View>
          </View>
        </View>

        {/* Retry Button */}
        <TouchableOpacity
          style={[
            styles.retryButton,
            {backgroundColor: isRetrying ? '#A8A29E' : primary},
            Shadows.md,
          ]}
          onPress={handleRetry}
          disabled={isRetrying}
          activeOpacity={0.8}
        >
          {isRetrying ? (
            <>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.retryText}>Checking Connection...</Text>
            </>
          ) : (
            <>
              <Icon name="refresh-cw" size={20} color="#FFFFFF" />
              <Text style={styles.retryText}>Try Again</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Icon name="shield" size={14} color={textMuted} />
          <Text style={[styles.footerText, {color: textMuted}]}>
            Your progress is safely saved offline
          </Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  iconSection: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  wave: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  textSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSizes['3xl'],
    fontWeight: '800',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSizes.lg,
    fontWeight: '500',
    marginBottom: Spacing.sm,
    textAlign: 'center',
    lineHeight: 24,
  },
  description: {
    fontSize: FontSizes.base,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.lg,
  },
  tipsCard: {
    width: '100%',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tipIconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipsTitle: {
    fontSize: FontSizes.base,
    fontWeight: '700',
  },
  tipsList: {
    gap: Spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tipText: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
    flex: 1,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  footerText: {
    fontSize: FontSizes.sm,
  },
});

export default NoInternetScreen;
