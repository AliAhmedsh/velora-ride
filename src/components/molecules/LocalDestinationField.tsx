import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Input } from '@components/atoms/Input';
import { VeloraText } from '@components/atoms/VeloraText';
import { usePlaceSearch } from '@hooks/usePlaceSearch';
import { useTheme } from '@hooks/useTheme';
import { spacing } from '@theme/spacing';
import { ISLAMABAD_CENTER } from '../../utils/locations';
import type { RideLocation } from '../../types/ride';

type Props = {
  value: RideLocation | null;
  onChange: (location: RideLocation | null) => void;
  pickup: RideLocation | null;
};

export function LocalDestinationField({ value, onChange, pickup }: Props) {
  const { theme } = useTheme();
  const [query, setQuery] = useState(value?.address ?? '');
  const searchOrigin = pickup ?? ISLAMABAD_CENTER;
  const { results, searching } = usePlaceSearch(query, searchOrigin);

  useEffect(() => {
    if (value?.address) {
      setQuery(value.address);
    }
  }, [value?.address]);

  const handleChange = (text: string) => {
    setQuery(text);
    if (!text.trim()) {
      onChange(null);
    }
  };

  const pick = (item: (typeof results)[number]) => {
    setQuery(item.address);
    onChange({
      address: item.address,
      latitude: item.latitude,
      longitude: item.longitude,
    });
  };

  const showResults = query.trim().length >= 2 && results.length > 0 && value?.address !== query;

  return (
    <View>
      <Input
        label="Where to?"
        placeholder="Search address or tap map"
        value={query}
        onChangeText={handleChange}
        autoCorrect={false}
      />
      {searching ? (
        <ActivityIndicator size="small" color={theme.colors.primary} style={styles.loader} />
      ) : null}
      {showResults ? (
        <FlatList
          data={results.slice(0, 5)}
          keyExtractor={item => item.id}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={false}
          style={[styles.list, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.row,
                { borderBottomColor: theme.colors.border, opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={() => pick(item)}>
              <VeloraText variant="body" color={theme.colors.text} numberOfLines={2}>
                {item.address}
              </VeloraText>
            </Pressable>
          )}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: spacing.sm },
  list: {
    borderWidth: 1,
    borderRadius: 12,
    marginTop: spacing.sm,
    maxHeight: 180,
  },
  row: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
