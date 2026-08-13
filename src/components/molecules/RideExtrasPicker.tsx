import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { VeloraText } from '@components/atoms/VeloraText';
import { useTheme } from '@hooks/useTheme';
import { spacing, radius } from '@theme/spacing';

type RideExtras = {
  acPreferred: boolean;
  extraLuggage: boolean;
  quietRide: boolean;
  notes: string;
};

type RideExtrasPickerProps = {
  value: RideExtras;
  onChange: (value: RideExtras) => void;
};

export function buildSpecialRequirements(extras: RideExtras): string | undefined {
  const tags: string[] = [];
  if (extras.acPreferred) tags.push('AC preferred');
  if (extras.extraLuggage) tags.push('Extra luggage');
  if (extras.quietRide) tags.push('Quiet ride');
  const notes = extras.notes.trim();
  if (notes) tags.push(notes);
  return tags.length ? tags.join(' · ') : undefined;
}

export const DEFAULT_RIDE_EXTRAS: RideExtras = {
  acPreferred: false,
  extraLuggage: false,
  quietRide: false,
  notes: '',
};

export function RideExtrasPicker({ value, onChange }: RideExtrasPickerProps) {
  const { theme } = useTheme();

  const toggles = [
    { key: 'acPreferred' as const, label: 'AC car' },
    { key: 'extraLuggage' as const, label: 'Extra luggage' },
    { key: 'quietRide' as const, label: 'Quiet ride' },
  ];

  return (
    <View style={styles.wrap}>
      <VeloraText variant="label" color={theme.colors.textSecondary}>Ride preferences</VeloraText>
      <View style={styles.row}>
        {toggles.map(t => {
          const on = value[t.key];
          return (
            <Pressable
              key={t.key}
              onPress={() => onChange({ ...value, [t.key]: !on })}
              style={[
                styles.chip,
                {
                  borderColor: on ? theme.colors.primary : theme.colors.border,
                  backgroundColor: on ? theme.colors.primary + '14' : theme.colors.surface,
                },
              ]}>
              <VeloraText variant="caption" color={on ? theme.colors.primary : theme.colors.textSecondary}>
                {t.label}
              </VeloraText>
            </Pressable>
          );
        })}
      </View>
      <TextInput
        value={value.notes}
        onChangeText={notes => onChange({ ...value, notes })}
        placeholder="Notes for driver (optional)"
        placeholderTextColor={theme.colors.textMuted}
        multiline
        style={[
          styles.notes,
          {
            borderColor: theme.colors.border,
            color: theme.colors.text,
            backgroundColor: theme.colors.surface,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, marginTop: spacing.md },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  notes: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 44,
    textAlignVertical: 'top',
  },
});
