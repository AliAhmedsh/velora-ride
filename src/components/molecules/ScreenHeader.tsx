import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VeloraText } from '@components/atoms/VeloraText';
import { useTheme } from '@hooks/useTheme';
import { spacing } from '@theme/spacing';

type Props = {
  title?: string;
  subtitle?: string;
  onBack: () => void;
  backLabel?: string;
};

export function ScreenHeader({ title, subtitle, onBack, backLabel = 'Back' }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + spacing.sm }]}>
      <TouchableOpacity
        activeOpacity={0.7}
        delayPressIn={0}
        onPress={onBack}
        style={styles.backBtn}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        accessibilityRole="button"
        accessibilityLabel={backLabel}>
        <VeloraText variant="label" color={theme.colors.primary}>← {backLabel}</VeloraText>
      </TouchableOpacity>
      {title ? (
        <VeloraText variant="hero" style={styles.title} color={theme.colors.text}>
          {title}
        </VeloraText>
      ) : null}
      {subtitle ? (
        <VeloraText variant="body" color={theme.colors.textSecondary}>
          {subtitle}
        </VeloraText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  backBtn: { alignSelf: 'flex-start', paddingVertical: spacing.sm, marginBottom: spacing.sm },
  title: { marginBottom: spacing.xs },
});
