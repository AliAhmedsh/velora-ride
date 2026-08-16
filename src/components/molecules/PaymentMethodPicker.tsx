import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { VeloraText } from '@components/atoms/VeloraText';
import { useTheme } from '@hooks/useTheme';
import type { PaymentMethod } from '../../types/booking';
import { spacing, radius } from '@theme/spacing';

const OPTIONS: { id: PaymentMethod; label: string }[] = [
  { id: 'cash', label: 'Cash' },
  { id: 'wallet', label: 'Wallet' },
  { id: 'card', label: 'Card (top up wallet)' },
  { id: 'easypaisa', label: 'Easypaisa' },
  { id: 'jazzcash', label: 'JazzCash' },
];

type Props = {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
};

export function PaymentMethodPicker({ value, onChange }: Props) {
  const { theme } = useTheme();

  return (
    <View style={styles.row}>
      {OPTIONS.map(opt => {
        const selected = value === opt.id;
        return (
          <TouchableOpacity
            key={opt.id}
            activeOpacity={0.85}
            delayPressIn={0}
            onPress={() => onChange(opt.id)}
            style={[
              styles.chip,
              {
                borderColor: selected ? theme.colors.primary : theme.colors.border,
                backgroundColor: selected ? theme.colors.surface : theme.colors.card,
              },
            ]}>
            <VeloraText variant="caption" color={selected ? theme.colors.primary : theme.colors.textSecondary}>
              {opt.label}
            </VeloraText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
});
