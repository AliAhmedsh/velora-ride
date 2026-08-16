import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { VeloraText } from '@components/atoms/VeloraText';
import { GradientBackdrop } from '@components/atoms/GradientBackdrop';
import { useTheme } from '@hooks/useTheme';
import { radius, spacing, shadow } from '@theme/spacing';

type ServiceCardProps = {
  title: string;
  subtitle: string;
  icon: string;
  accentColor?: string;
  onPress?: () => void;
  featured?: boolean;
};

export function ServiceCard({
  title,
  subtitle,
  icon,
  accentColor,
  onPress,
  featured = false,
}: ServiceCardProps) {
  const { theme } = useTheme();
  const accent = accentColor ?? theme.colors.accent;

  if (featured) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        delayPressIn={0}
        onPress={onPress}
        accessibilityRole="button"
        style={[
          styles.featured,
          shadow.md,
          { backgroundColor: theme.colors.primaryDark, borderColor: theme.colors.accent },
        ]}>
        <GradientBackdrop colors={[theme.colors.primaryDark, theme.colors.primary]} />
        <View style={styles.featuredContent}>
          <View style={[styles.featuredIcon, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
            <VeloraText variant="h2" color={theme.colors.accent}>{icon}</VeloraText>
          </View>
          <VeloraText variant="h2" color={theme.colors.white}>
            {title}
          </VeloraText>
          <VeloraText variant="body" color={theme.colors.brown200} style={styles.subtitle}>
            {subtitle}
          </VeloraText>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      delayPressIn={0}
      onPress={onPress}
      accessibilityRole="button"
      style={[
        styles.card,
        shadow.sm,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}>
      <View style={[styles.iconWrap, { backgroundColor: `${accent}22` }]}>
        <VeloraText variant="h3" color={accent}>{icon}</VeloraText>
      </View>
      <VeloraText variant="h3" color={theme.colors.text} style={styles.cardTitle}>
        {title}
      </VeloraText>
      <VeloraText variant="caption" color={theme.colors.textSecondary}>
        {subtitle}
      </VeloraText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  featured: {
    borderRadius: radius.xl,
    marginBottom: spacing.lg,
    minHeight: 148,
    overflow: 'hidden',
    borderWidth: 1,
  },
  featuredContent: {
    padding: spacing.xl,
    zIndex: 1,
  },
  featuredIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  subtitle: { marginTop: spacing.xs },
  card: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    minHeight: 124,
  } as ViewStyle,
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: { marginBottom: spacing.xs },
});
