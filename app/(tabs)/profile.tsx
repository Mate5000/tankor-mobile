import React, { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Input } from '@/components/Input';
import { ListRow } from '@/components/ListRow';
import { useTheme } from '@/theme/ThemeProvider';
import { useThemePreference } from '@/theme/ThemeProvider';
import { useT, useI18n } from '@/i18n';
import { useAuthStore } from '@/store/auth';
import { meApi } from '@/api/endpoints';
import { useToast } from '@/components/Toast';
import { useApiErrorMessage } from '@/hooks/useApiError';
import { loadApiUrl, clearApiUrl } from '@/api/config';

export default function ProfileScreen() {
  const theme = useTheme();
  const t = useT();
  const router = useRouter();
  const toast = useToast();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const setUser = useAuthStore((s) => s.setUser);
  const { locale, setLocale } = useI18n();
  const { preference, setPreference } = useThemePreference();
  const getErr = useApiErrorMessage();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [apiUrl, setApiUrl] = useState<string | null>(null);

  useEffect(() => {
    loadApiUrl().then(setApiUrl);
  }, []);

  const saveProfile = async () => {
    setBusy(true);
    try {
      const updates: any = { name, locale };
      if (newPw && currentPw) {
        updates.currentPassword = currentPw;
        updates.newPassword = newPw;
      }
      const updated = await meApi.update(updates);
      setUser(updated);
      toast.show(t('profile.updated'), 'success');
      setEditing(false);
      setCurrentPw('');
      setNewPw('');
    } catch (e) {
      toast.show(getErr(e), 'danger');
    } finally {
      setBusy(false);
    }
  };

  const onLogout = () => {
    Alert.alert(t('profile.signOut'), t('profile.signOutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.signOut'),
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const onChangeServer = () => {
    Alert.alert(t('profile.changeServer'), apiUrl || '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.changeServer'),
        style: 'destructive',
        onPress: async () => {
          await logout();
          await clearApiUrl();
          router.replace('/setup');
        },
      },
    ]);
  };

  return (
    <Screen>
      {/* Header card */}
      <Card padded style={{ marginBottom: theme.spacing.lg, alignItems: 'center' }}>
        <Avatar name={user?.name} url={user?.avatarUrl} size={84} />
        <Text variant="h2" align="center" style={{ marginTop: theme.spacing.md }}>
          {user?.name}
        </Text>
        <Text variant="caption" tone="muted" align="center">
          {user?.email}
        </Text>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: theme.spacing.sm }}>
          <Badge label={user ? t(`role.${user.role}`) : ''} tone="primary" size="md" />
          {user?.studyClass ? <Badge label={user.studyClass.name} tone="info" /> : null}
        </View>
      </Card>

      {editing ? (
        <Card padded style={{ marginBottom: theme.spacing.lg }}>
          <Text variant="title" style={{ marginBottom: theme.spacing.md }}>
            {t('profile.title')}
          </Text>
          <View style={{ gap: theme.spacing.md }}>
            <Input label={t('profile.name')} value={name} onChangeText={setName} editable={!busy} />
            <View>
              <Text variant="label" tone="muted" style={{ marginBottom: 6 }}>
                {t('profile.locale')}
              </Text>
              <SegmentedControl
                value={locale}
                onChange={(v) => setLocale(v)}
                options={[
                  { value: 'HU', label: 'Magyar' },
                  { value: 'EN', label: 'English' },
                ]}
              />
            </View>
            <Input
              label={t('profile.currentPassword')}
              value={currentPw}
              onChangeText={setCurrentPw}
              secureTextEntry
              editable={!busy}
              hint={`${t('profile.currentPassword')} ${t('profile.newPassword').toLowerCase()}`}
            />
            <Input
              label={t('profile.newPassword')}
              value={newPw}
              onChangeText={setNewPw}
              secureTextEntry
              editable={!busy}
            />
            <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.sm }}>
              <Button title={t('common.cancel')} variant="outline" onPress={() => setEditing(false)} style={{ flex: 1 }} />
              <Button title={t('common.save')} loading={busy} onPress={saveProfile} style={{ flex: 1 }} />
            </View>
          </View>
        </Card>
      ) : (
        <Card padded={false} style={{ marginBottom: theme.spacing.lg, overflow: 'hidden' }}>
          <ListRow
            title={t('profile.title')}
            subtitle={user?.name}
            leading={<Ionicons name="person-outline" size={20} color={theme.colors.textMuted} />}
            onPress={() => setEditing(true)}
            showChevron
          />
        </Card>
      )}

      {/* Appearance */}
      <Card padded style={{ marginBottom: theme.spacing.lg }}>
        <Text variant="title" style={{ marginBottom: theme.spacing.md }}>
          {t('profile.theme')}
        </Text>
        <SegmentedControl
          value={preference}
          onChange={(v) => setPreference(v)}
          options={[
            { value: 'light', label: t('profile.themeLight') },
            { value: 'system', label: t('profile.themeSystem') },
            { value: 'dark', label: t('profile.themeDark') },
          ]}
        />
      </Card>

      {/* Role-specific links */}
      {user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' ? (
        <Card padded={false} style={{ marginBottom: theme.spacing.lg, overflow: 'hidden' }}>
          {(user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
            <ListRow
              title={t('teach.title')}
              leading={<Ionicons name="briefcase-outline" size={20} color={theme.colors.textMuted} />}
              onPress={() => router.push('/teach' as any)}
              showChevron
            />
          )}
          {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
            <>
              <View style={{ height: 1, backgroundColor: theme.colors.border }} />
              <ListRow
                title={t('admin.users')}
                leading={<Ionicons name="people-outline" size={20} color={theme.colors.textMuted} />}
                onPress={() => router.push('/admin/users' as any)}
                showChevron
              />
              <View style={{ height: 1, backgroundColor: theme.colors.border }} />
              <ListRow
                title={t('admin.invites')}
                leading={<Ionicons name="ticket-outline" size={20} color={theme.colors.textMuted} />}
                onPress={() => router.push('/admin/invites' as any)}
                showChevron
              />
            </>
          )}
        </Card>
      ) : null}

      {/* Server */}
      <Card padded={false} style={{ marginBottom: theme.spacing.lg, overflow: 'hidden' }}>
        <ListRow
          title={t('profile.server')}
          subtitle={apiUrl || ''}
          leading={<Ionicons name="server-outline" size={20} color={theme.colors.textMuted} />}
          onPress={onChangeServer}
          showChevron
        />
      </Card>

      {/* Logout */}
      <Button title={t('profile.signOut')} variant="outline" onPress={onLogout} fullWidth />

      <View style={{ alignItems: 'center', marginTop: theme.spacing.xl, gap: 4 }}>
        <Text variant="caption" tone="dim">{t('profile.about')}</Text>
        <Text variant="caption" tone="dim">
          {t('profile.version')} {Constants.expoConfig?.version || '0.1.0'}
        </Text>
      </View>
    </Screen>
  );
}
