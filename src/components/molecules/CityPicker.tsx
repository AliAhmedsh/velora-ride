import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Input } from '@components/atoms/Input';
import { VeloraText } from '@components/atoms/VeloraText';
import { useTheme } from '@hooks/useTheme';
import { PAKISTAN_CITY_LIST, searchPakistanCities, type PakistanCity } from '../../data/pakistanCities';
import { spacing, radius } from '@theme/spacing';

type Props = {
  label: string;
  value: string;
  onSelect: (cityName: string) => void;
  excludeCity?: string;
};

export function CityPicker({ label, value, onSelect, excludeCity }: Props) {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);

  const cities = useMemo(() => {
    const list = searchPakistanCities(query).filter(c => c.name !== excludeCity);
    return list;
  }, [query, excludeCity]);

  const renderCity = ({ item }: { item: PakistanCity }) => {
    const selected = item.name === value;
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        delayPressIn={0}
        onPress={() => {
          onSelect(item.name);
          setExpanded(false);
          setQuery('');
        }}
        style={[
          styles.cityRow,
          {
            backgroundColor: selected ? theme.colors.primary + '14' : theme.colors.card,
            borderColor: selected ? theme.colors.primary : theme.colors.border,
          },
        ]}>
        <View style={styles.cityInfo}>
          <VeloraText variant="bodyMedium" color={selected ? theme.colors.primary : theme.colors.text}>
            {item.name}
          </VeloraText>
          <VeloraText variant="caption" color={theme.colors.textSecondary}>
            {item.province}
          </VeloraText>
        </View>
        {selected ? (
          <VeloraText variant="label" color={theme.colors.primary}>✓</VeloraText>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.wrap}>
      <VeloraText variant="label" color={theme.colors.textSecondary}>{label}</VeloraText>

      <TouchableOpacity
        activeOpacity={0.9}
        delayPressIn={0}
        onPress={() => setExpanded(v => !v)}
        style={[styles.selectedBox, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}>
        <VeloraText variant="bodyMedium" color={theme.colors.text}>{value}</VeloraText>
        <VeloraText variant="caption" color={theme.colors.primary}>
          {expanded ? 'Close' : 'Change city'}
        </VeloraText>
      </TouchableOpacity>

      {expanded ? (
        <View style={styles.searchWrap}>
          <Input
            value={query}
            onChangeText={setQuery}
            placeholder="Search city (e.g. Lahore, Swat, Gilgit…)"
            autoCapitalize="words"
          />
          <FlatList
            data={cities}
            keyExtractor={item => item.name}
            renderItem={renderCity}
            keyboardShouldPersistTaps="handled"
            style={[styles.list, { borderColor: theme.colors.border }]}
            nestedScrollEnabled
            ListEmptyComponent={
              <VeloraText variant="caption" color={theme.colors.textMuted} style={styles.empty}>
                No city found
              </VeloraText>
            }
          />
          <VeloraText variant="caption" color={theme.colors.textMuted}>
            {PAKISTAN_CITY_LIST.length} cities across Pakistan
          </VeloraText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, marginTop: spacing.lg },
  selectedBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  searchWrap: { gap: spacing.sm },
  list: {
    maxHeight: 220,
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  cityInfo: { flex: 1 },
  empty: { padding: spacing.md },
});
