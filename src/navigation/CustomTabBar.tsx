import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VeloraText } from '@components/atoms/VeloraText';
import { useTheme } from '@hooks/useTheme';
import { spacing, radius, shadow } from '@theme/spacing';

const ICONS: Record<string, string> = {
  Home: '⌂',
  History: '☰',
  Wallet: '◈',
  Profile: '⚉',
};

function TabButton({
  label,
  focused,
  onPress,
}: {
  label: string;
  focused: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const scale = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  }, [focused, scale]);

  const pillScale = scale.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });
  const pillOpacity = scale;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      delayPressIn={0}
      onPress={onPress}
      style={styles.tabButton}
      hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.pill,
          {
            opacity: pillOpacity,
            transform: [{ scale: pillScale }],
            backgroundColor: theme.colors.primary,
          },
        ]}
      />
      <VeloraText
        variant="h3"
        pointerEvents="none"
        color={focused ? theme.colors.textOnPrimary : theme.colors.textSecondary}
        style={styles.icon}>
        {ICONS[label] ?? '•'}
      </VeloraText>
    </TouchableOpacity>
  );
}

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'ios' ? spacing.md : spacing.sm);

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingBottom: bottomInset,
          backgroundColor: theme.colors.background,
        },
      ]}>
      <View
        style={[
          styles.bar,
          shadow.lg,
          { backgroundColor: theme.colors.tabBar, borderColor: theme.colors.border },
        ]}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const label = route.name;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return <TabButton key={route.key} label={label} focused={focused} onPress={onPress} />;
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: radius.full,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  pill: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  icon: {
    fontSize: 21,
    lineHeight: 24,
  },
});
