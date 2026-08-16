import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenHeader } from '@components/molecules/ScreenHeader';
import { VeloraText } from '@components/atoms/VeloraText';
import { useTheme } from '@hooks/useTheme';
import { MainStackParamList } from '@navigation/types';
import { spacing, radius, shadow } from '@theme/spacing';
import {
  AppNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../../services/notificationService';

type Props = NativeStackScreenProps<MainStackParamList, 'Notifications'>;

const ICONS: Record<AppNotification['type'], string> = {
  ride_status: '🚗',
  driver_offer: '💬',
  promo: '🎁',
  support: '🛟',
  document: '📄',
  sos: '🚨',
  system: '🔔',
};

export function NotificationsScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const data = await fetchNotifications();
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleOpen = async (item: AppNotification) => {
    if (!item.readAt) {
      await markNotificationRead(item.id);
      setItems(prev => prev.map(n => (n.id === item.id ? { ...n, readAt: new Date().toISOString() } : n)));
    }
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <View style={{ paddingHorizontal: spacing.xxl }}>
        <ScreenHeader title="Notifications" onBack={() => navigation.goBack()} />
        <Pressable onPress={() => markAllNotificationsRead().then(load)} style={styles.markAll}>
          <VeloraText variant="label" color={theme.colors.primary}>Mark all read</VeloraText>
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing.xxl }]}
        refreshing={loading}
        onRefresh={load}
        ListEmptyComponent={
          !loading ? (
            <VeloraText variant="body" color={theme.colors.textMuted} style={styles.empty}>
              You're all caught up.
            </VeloraText>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleOpen(item)}
            style={[
              styles.card,
              shadow.sm,
              {
                backgroundColor: item.readAt ? theme.colors.card : theme.colors.surface,
                borderColor: item.readAt ? theme.colors.border : theme.colors.accent,
              },
            ]}>
            <VeloraText variant="h3">{ICONS[item.type] ?? '🔔'}</VeloraText>
            <View style={styles.cardBody}>
              <VeloraText variant="bodyMedium">{item.title}</VeloraText>
              <VeloraText variant="caption" color={theme.colors.textSecondary}>{item.body}</VeloraText>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  markAll: { alignSelf: 'flex-end', marginBottom: spacing.sm, paddingVertical: spacing.xs },
  list: { paddingHorizontal: spacing.xxl },
  empty: { textAlign: 'center', marginTop: spacing.huge },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    alignItems: 'flex-start',
  },
  cardBody: { flex: 1, gap: spacing.xs },
});
