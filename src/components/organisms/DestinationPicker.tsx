import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Input } from '@components/atoms/Input';
import { VeloraText } from '@components/atoms/VeloraText';
import { useTheme } from '@hooks/useTheme';
import { useDestinationCatalog } from '@hooks/useDestinationCatalog';
import { usePlaceSearch } from '@hooks/usePlaceSearch';
import { spacing, radius } from '@theme/spacing';
import type { RideLocation } from '../../types/ride';
import type { DestinationOption } from '@utils/locations';
import { distanceKm, formatDistanceKm } from '@utils/locations';
import { PAKISTAN_CITIES } from '../../data/pakistanLandmarks';
import type { DestinationCategoryId } from '../../services/destinationCatalog';

export type DistanceFilterKm = 5 | 10 | 25 | 50 | 80 | 0;
export type SortMode = 'nearest' | 'name';

type DestinationPickerProps = {
  pickup: RideLocation;
  selected: DestinationOption | null;
  onSelect: (destination: DestinationOption) => void;
  maxDistanceKm?: number;
};

const CATEGORY_ICONS: Partial<Record<DestinationCategoryId, string>> = {
  nearby: '◎',
  popular: '★',
  airport: '✈',
  market: '▣',
  mall: '◆',
  hospital: '+',
  university: '⌂',
  transport: '→',
  landmark: '●',
};

const DISTANCE_FILTERS: { id: DistanceFilterKm; label: string }[] = [
  { id: 5, label: '5 km' },
  { id: 10, label: '10 km' },
  { id: 25, label: '25 km' },
  { id: 50, label: '50 km' },
  { id: 80, label: '80 km' },
  { id: 0, label: 'All' },
];

export function DestinationPicker({
  pickup,
  selected,
  onSelect,
  maxDistanceKm: externalMaxKm,
}: DestinationPickerProps) {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [distanceFilter, setDistanceFilter] = useState<DistanceFilterKm>(25);
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [sortMode, setSortMode] = useState<SortMode>('nearest');
  const [showAll, setShowAll] = useState(false);

  const { categories, activeCategory, setActiveCategory, activeItems, loading } =
    useDestinationCatalog(pickup);
  const { results: searchResults, searching } = usePlaceSearch(query, pickup);

  const isSearching = query.trim().length >= 2;
  const rawItems = isSearching ? searchResults : activeItems;
  const effectiveMaxKm = externalMaxKm ?? distanceFilter;

  const filteredItems = useMemo(() => {
    let items = rawItems.filter(item => {
      const km = distanceKm(pickup, item);
      if (effectiveMaxKm > 0 && km > effectiveMaxKm) return false;
      if (cityFilter !== 'all' && item.city !== cityFilter) return false;
      return true;
    });

    if (sortMode === 'nearest') {
      items = [...items].sort((a, b) => distanceKm(pickup, a) - distanceKm(pickup, b));
    } else {
      items = [...items].sort((a, b) => a.address.localeCompare(b.address));
    }

    return items;
  }, [rawItems, pickup, effectiveMaxKm, cityFilter, sortMode]);

  const visibleItems = filteredItems.slice(0, showAll ? filteredItems.length : 12);

  return (
    <View style={styles.wrap}>
      <Input
        label="Search destination"
        value={query}
        onChangeText={setQuery}
        placeholder="Search address, mall, hospital, airport…"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />

      <VeloraText variant="caption" color={theme.colors.textMuted}>Distance</VeloraText>
      <View style={styles.filterRow}>
        {DISTANCE_FILTERS.map(f => {
          const active = distanceFilter === f.id;
          return (
            <Pressable
              key={f.id}
              onPress={() => setDistanceFilter(f.id)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: active ? theme.colors.accent + '22' : theme.colors.surface,
                  borderColor: active ? theme.colors.accent : theme.colors.border,
                },
              ]}>
              <VeloraText variant="caption" color={active ? theme.colors.primary : theme.colors.textSecondary}>
                {f.label}
              </VeloraText>
            </Pressable>
          );
        })}
      </View>

      <VeloraText variant="caption" color={theme.colors.textMuted}>City</VeloraText>
      <View style={styles.filterRow}>
        <Pressable
          onPress={() => setCityFilter('all')}
          style={[
            styles.filterChip,
            {
              backgroundColor: cityFilter === 'all' ? theme.colors.accent + '22' : theme.colors.surface,
              borderColor: cityFilter === 'all' ? theme.colors.accent : theme.colors.border,
            },
          ]}>
          <VeloraText variant="caption" color={cityFilter === 'all' ? theme.colors.primary : theme.colors.textSecondary}>
            All cities
          </VeloraText>
        </Pressable>
        {PAKISTAN_CITIES.slice(0, 8).map(c => {
          const active = cityFilter === c.name;
          return (
            <Pressable
              key={c.name}
              onPress={() => setCityFilter(c.name)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: active ? theme.colors.accent + '22' : theme.colors.surface,
                  borderColor: active ? theme.colors.accent : theme.colors.border,
                },
              ]}>
              <VeloraText variant="caption" color={active ? theme.colors.primary : theme.colors.textSecondary}>
                {c.name}
              </VeloraText>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.sortRow}>
        <Pressable onPress={() => setSortMode('nearest')}>
          <VeloraText variant="caption" color={sortMode === 'nearest' ? theme.colors.primary : theme.colors.textMuted}>
            Sort: nearest
          </VeloraText>
        </Pressable>
        <VeloraText variant="caption" color={theme.colors.textMuted}> · </VeloraText>
        <Pressable onPress={() => setSortMode('name')}>
          <VeloraText variant="caption" color={sortMode === 'name' ? theme.colors.primary : theme.colors.textMuted}>
            name
          </VeloraText>
        </Pressable>
        <VeloraText variant="caption" color={theme.colors.textMuted} style={styles.count}>
          {filteredItems.length} places
        </VeloraText>
      </View>

      {!isSearching && (
        <View style={styles.categoryRow}>
          {categories.map(cat => {
            const active = activeCategory === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => setActiveCategory(cat.id)}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: active ? theme.colors.primary : theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}>
                <VeloraText
                  variant="caption"
                  color={active ? theme.colors.textOnPrimary : theme.colors.text}>
                  {CATEGORY_ICONS[cat.id] ? `${CATEGORY_ICONS[cat.id]} ` : ''}{cat.label}
                </VeloraText>
              </Pressable>
            );
          })}
        </View>
      )}

      {(loading || searching) && (
        <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
      )}

      {visibleItems.length === 0 && !loading && !searching ? (
        <VeloraText variant="caption" color={theme.colors.textMuted} style={styles.empty}>
          No places match filters. Try &quot;All&quot; distance or another city.
        </VeloraText>
      ) : (
        visibleItems.map(item => {
          const isSelected = selected?.id === item.id;
          const km = distanceKm(pickup, item);
          return (
            <Pressable
              key={item.id}
              onPress={() => onSelect(item)}
              style={[
                styles.row,
                {
                  backgroundColor: isSelected ? theme.colors.primary + '18' : theme.colors.surface,
                  borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                },
              ]}>
              <View style={styles.rowBody}>
                <VeloraText variant="bodyMedium" numberOfLines={2}>{item.address}</VeloraText>
                {item.city ? (
                  <VeloraText variant="caption" color={theme.colors.textSecondary}>
                    {item.city}{item.category ? ` · ${item.category}` : ''}
                  </VeloraText>
                ) : null}
              </View>
              <VeloraText variant="caption" color={theme.colors.textMuted}>
                {formatDistanceKm(km)}
              </VeloraText>
            </Pressable>
          );
        })
      )}

      {filteredItems.length > 12 && !showAll ? (
        <Pressable onPress={() => setShowAll(true)} style={styles.more}>
          <VeloraText variant="label" color={theme.colors.primary}>
            Show all {filteredItems.length} places
          </VeloraText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, marginTop: spacing.sm },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  sortRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  count: { marginLeft: 'auto' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  loader: { marginVertical: spacing.sm },
  empty: { paddingVertical: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  rowBody: { flex: 1 },
  more: { alignItems: 'center', paddingVertical: spacing.sm },
});
