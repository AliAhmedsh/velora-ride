import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMainStackNavigation } from '@navigation/useMainStackNavigation';
import { VeloraText } from '@components/atoms/VeloraText';
import { useTheme } from '@hooks/useTheme';
import { useAuth } from '@app/providers/AuthProvider';
import { spacing, radius, shadow } from '@theme/spacing';
import { fetchProfile, updateProfile } from '../../../services/profileService';

export function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { signOut, session } = useAuth();
  const insets = useSafeAreaInsets();
  const navigation = useMainStackNavigation();
  const [profile, setProfile] = useState<{
    full_name?: string;
    phone?: string;
    email?: string;
    tier?: string;
    language?: string;
    prefers_women_driver?: boolean;
    referral_code?: string;
  } | null>(null);

  useEffect(() => {
    fetchProfile().then(setProfile).catch(() => {});
  }, [session]);

  const name = profile?.full_name ?? 'Velora User';
  const phone = profile?.phone ?? session?.user?.email ?? '';
  const tier = profile?.tier ?? 'standard';
  const isUrdu = profile?.language === 'ur';

  const handleToggleLanguage = async () => {
    const nextLanguage = isUrdu ? 'en' : 'ur';
    setProfile(prev => (prev ? { ...prev, language: nextLanguage } : prev));
    await updateProfile({ language: nextLanguage }).catch(() => {});
  };

  const handleToggleWomenDriver = async () => {
    const next = !profile?.prefers_women_driver;
    setProfile(prev => (prev ? { ...prev, prefers_women_driver: next } : prev));
    await updateProfile({ prefers_women_driver: next }).catch(() => {});
  };

  const menu = [
    { label: 'Help & Support', action: () => navigation.navigate('Support') },
    { label: 'Notifications', action: () => navigation.navigate('Notifications') },
    {
      label: 'Invite friends',
      action: () =>
        Alert.alert('Your referral code', profile?.referral_code ?? 'Loading...', [
          { text: 'OK' },
        ]),
      value: profile?.referral_code,
    },
    { label: 'Prefer women drivers', action: handleToggleWomenDriver, value: profile?.prefers_women_driver ? 'On' : 'Off' },
    { label: 'اردو / English', action: handleToggleLanguage, value: isUrdu ? 'اردو' : 'English' },
    { label: 'Dark mode', action: toggleTheme, value: isDark ? 'On' : 'Off' },
  ];

  const handleDelete = () => {
    Alert.alert(
      'Delete account',
      'Contact support to delete your account. This will be available in-app soon.',
    );
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
          <VeloraText variant="h1" color={theme.colors.white}>
            {name.charAt(0).toUpperCase()}
          </VeloraText>
        </View>
        <VeloraText variant="h2" style={styles.name}>{name}</VeloraText>
        <VeloraText variant="body" color={theme.colors.textSecondary}>{phone}</VeloraText>
        <VeloraText variant="caption" color={theme.colors.textSecondary} style={styles.tier}>
          {tier} tier
        </VeloraText>
      </View>

      <View style={styles.menu}>
        {menu.map(item => (
          <TouchableOpacity
            key={item.label}
            activeOpacity={0.85}
            delayPressIn={0}
            onPress={item.action}
            style={[
              styles.menuItem,
              shadow.sm,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}>
            <VeloraText variant="bodyMedium" style={styles.menuLabel}>{item.label}</VeloraText>
            <View style={styles.menuRight}>
              {item.value ? (
                <VeloraText variant="caption" color={theme.colors.textSecondary}>{item.value}</VeloraText>
              ) : null}
              {(item.label === 'Help & Support' || item.label === 'Notifications') ? (
                <VeloraText variant="body" color={theme.colors.textMuted}> ›</VeloraText>
              ) : null}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity activeOpacity={0.85} delayPressIn={0} style={styles.logout} onPress={signOut}>
        <VeloraText variant="bodyMedium" color={theme.colors.error}>Log out</VeloraText>
      </TouchableOpacity>
      <TouchableOpacity activeOpacity={0.85} delayPressIn={0} style={styles.delete} onPress={handleDelete}>
        <VeloraText variant="caption" color={theme.colors.textMuted}>Request account deletion</VeloraText>
      </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { alignItems: 'center', paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxl },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  name: { marginBottom: spacing.xs },
  tier: { marginTop: spacing.sm },
  menu: { paddingHorizontal: spacing.xxl, gap: spacing.md },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  menuLabel: { flex: 1 },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  logout: { alignItems: 'center', paddingVertical: spacing.xxxl },
  delete: { alignItems: 'center', paddingBottom: spacing.xl },
});
