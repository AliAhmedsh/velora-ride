import React, { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { VeloraText } from '@components/atoms/VeloraText';
import { useTheme } from '@hooks/useTheme';
import { spacing, radius } from '@theme/spacing';
import type { ServiceType } from '../../types/booking';
import {
  getDefaultRideTypeSlug,
  getRideTypesForService,
  isRideTypeAllowedForService,
  type RideServiceType,
} from '../../data/rideServiceTypes';

type Props = {
  value: string | null;
  onChange: (slug: string, multiplier: number) => void;
  /** local = all types; city_to_city / rental = Car & AC Car only */
  serviceType?: ServiceType;
};

export function VehicleCategoryPicker({
  value,
  onChange,
  serviceType = 'local',
}: Props) {
  const { theme } = useTheme();
  const options = useMemo(() => getRideTypesForService(serviceType), [serviceType]);

  const hint =
    serviceType === 'local'
      ? 'Car, Mini Car, Rickshaw, Bike, Chingchi, or AC Car'
      : 'Inter-city rides are available with Car or AC Car only';

  useEffect(() => {
    if (!value || !isRideTypeAllowedForService(value, serviceType)) {
      const slug = getDefaultRideTypeSlug(serviceType);
      const type = options.find(t => t.slug === slug) ?? options[0];
      if (type) onChange(type.slug, type.base_multiplier);
    }
  }, [value, serviceType, options, onChange]);

  return (
    <View style={styles.wrap}>
      <VeloraText variant="label" color={theme.colors.textSecondary}>
        Ride type
      </VeloraText>
      <VeloraText variant="caption" color={theme.colors.textMuted}>
        {hint}
      </VeloraText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}>
        {options.map(type => (
          <RideTypeChip
            key={type.slug}
            type={type}
            selected={value === type.slug}
            onPress={() => onChange(type.slug, type.base_multiplier)}
          />
        ))}
      </ScrollView>
      {value ? (
        <VeloraText variant="caption" color={theme.colors.textSecondary}>
          {options.find(t => t.slug === value)?.description}
        </VeloraText>
      ) : null}
    </View>
  );
}

function RideTypeChip({
  type,
  selected,
  onPress,
}: {
  type: RideServiceType;
  selected: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      delayPressIn={0}
      onPress={onPress}
      style={[
        styles.chip,
        {
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          backgroundColor: selected ? theme.colors.primary : theme.colors.card,
        },
      ]}>
      <VeloraText variant="caption" color={selected ? theme.colors.white : theme.colors.text}>
        {type.icon} {type.name}
      </VeloraText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.lg, gap: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    minHeight: 40,
    justifyContent: 'center',
  },
});
