import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Button } from '@components/atoms/Button';
import { GradientBackdrop } from '@components/atoms/GradientBackdrop';
import { VeloraText } from '@components/atoms/VeloraText';
import { useTheme } from '@hooks/useTheme';
import { spacing } from '@theme/spacing';
import { AuthStackParamList } from '@navigation/types';

export function WelcomeScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(withTiming(1.04, { duration: 1800 }), withTiming(1, { duration: 1800 })),
      -1,
      true,
    );
  }, [scale]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primaryDark }]}>
      <GradientBackdrop
        colors={[theme.colors.gradientStart, theme.colors.gradientEnd, theme.colors.primaryDark]}
      />

      <View style={styles.content}>
        <Animated.View style={[styles.logoRing, logoStyle]}>
          <View style={styles.logoInner}>
            <VeloraText variant="hero" color={theme.colors.accent}>V</VeloraText>
          </View>
        </Animated.View>
        <VeloraText variant="hero" color={theme.colors.white} align="center">Velora</VeloraText>
        <VeloraText variant="h3" color={theme.colors.brown200} align="center" style={styles.tagline}>
          Premium rides, crafted for you
        </VeloraText>
        <View style={styles.divider} />
        <VeloraText variant="body" color={theme.colors.brown200} align="center">
          Local · City to City · Rental
        </VeloraText>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.xxl }]}>
        <Button label="Get started" fullWidth onPress={() => navigation.navigate('SignUp')} />
        <TouchableOpacity
          activeOpacity={0.7}
          delayPressIn={0}
          onPress={() => navigation.navigate('Login')}
          style={styles.loginLink}>
          <VeloraText variant="label" color={theme.colors.brown200} align="center">
            Already have an account? Sign in
          </VeloraText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  logoRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(201, 166, 107, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  logoInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagline: { marginTop: spacing.sm, marginBottom: spacing.xxxl },
  divider: {
    width: 48,
    height: 3,
    backgroundColor: 'rgba(201, 166, 107, 0.6)',
    borderRadius: 2,
    marginBottom: spacing.lg,
  },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  loginLink: {
    paddingVertical: spacing.sm,
  },
});
