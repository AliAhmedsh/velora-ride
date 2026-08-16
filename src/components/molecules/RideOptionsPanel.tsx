import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { VeloraText } from '@components/atoms/VeloraText';
import { Input } from '@components/atoms/Input';
import { useTheme } from '@hooks/useTheme';
import { spacing, radius } from '@theme/spacing';
import type { AcPreference } from '../../types/booking';
import { previewPromoCode, PromoApplication } from '../../services/promoService';

type Props = {
  fare: number;
  womenOnly: boolean;
  onWomenOnlyChange: (value: boolean) => void;
  acPreference: AcPreference;
  onAcPreferenceChange: (value: AcPreference) => void;
  onPromoApplied: (application: PromoApplication | null) => void;
};

const AC_OPTIONS: { id: AcPreference; label: string }[] = [
  { id: 'any', label: 'Any' },
  { id: 'ac', label: 'AC' },
  { id: 'non_ac', label: 'Non-AC' },
];

export function RideOptionsPanel({
  fare,
  womenOnly,
  onWomenOnlyChange,
  acPreference,
  onAcPreferenceChange,
  onPromoApplied,
}: Props) {
  const { theme } = useTheme();
  const [promoCode, setPromoCode] = useState('');
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState<PromoApplication | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setApplying(true);
    setPromoError(null);
    try {
      const result = await previewPromoCode(promoCode, fare);
      setApplied(result);
      onPromoApplied(result);
    } catch (e: any) {
      setPromoError(e?.message ?? 'Invalid promo code');
      setApplied(null);
      onPromoApplied(null);
    } finally {
      setApplying(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <VeloraText variant="label" color={theme.colors.textSecondary}>Ride preferences</VeloraText>
      <View style={styles.row}>
        <Pressable
          onPress={() => onWomenOnlyChange(!womenOnly)}
          style={[
            styles.chip,
            {
              borderColor: womenOnly ? theme.colors.primary : theme.colors.border,
              backgroundColor: womenOnly ? theme.colors.primary + '14' : theme.colors.surface,
            },
          ]}>
          <VeloraText variant="caption" color={womenOnly ? theme.colors.primary : theme.colors.textSecondary}>
            👩 Women-only driver
          </VeloraText>
        </Pressable>
      </View>

      <View style={styles.row}>
        {AC_OPTIONS.map(opt => {
          const selected = acPreference === opt.id;
          return (
            <Pressable
              key={opt.id}
              onPress={() => onAcPreferenceChange(opt.id)}
              style={[
                styles.chip,
                {
                  borderColor: selected ? theme.colors.primary : theme.colors.border,
                  backgroundColor: selected ? theme.colors.primary + '14' : theme.colors.surface,
                },
              ]}>
              <VeloraText variant="caption" color={selected ? theme.colors.primary : theme.colors.textSecondary}>
                {opt.label}
              </VeloraText>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.promoRow}>
        <Input
          style={styles.promoInput}
          value={promoCode}
          onChangeText={setPromoCode}
          placeholder="Promo code"
          autoCapitalize="characters"
        />
        <Pressable
          onPress={handleApplyPromo}
          style={[styles.applyBtn, { backgroundColor: theme.colors.primary }]}>
          {applying ? (
            <ActivityIndicator color={theme.colors.white} size="small" />
          ) : (
            <VeloraText variant="label" color={theme.colors.white}>Apply</VeloraText>
          )}
        </Pressable>
      </View>
      {promoError && <VeloraText variant="caption" color={theme.colors.error}>{promoError}</VeloraText>}
      {applied && (
        <VeloraText variant="caption" color={theme.colors.success}>
          "{applied.promo.code}" applied — PKR {applied.discountPkr} off
        </VeloraText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.lg, gap: spacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, borderWidth: 1 },
  promoRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  promoInput: { flex: 1 },
  applyBtn: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.lg, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
});
