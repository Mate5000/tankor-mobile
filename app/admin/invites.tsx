import React, { useState } from 'react';
import { View, FlatList, RefreshControl, Pressable, Alert } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import { useTheme } from '@/theme/ThemeProvider';
import { useT, useI18n } from '@/i18n';
import { invitesApi } from '@/api/endpoints';
import { useToast } from '@/components/Toast';
import { useApiErrorMessage } from '@/hooks/useApiError';
import { formatDateTime, timeAgo } from '@/utils/format';
import type { Role } from '@/types/api';

export default function AdminInvitesScreen() {
  const theme = useTheme();
  const t = useT();
  const { locale } = useI18n();
  const toast = useToast();
  const qc = useQueryClient();
  const getErr = useApiErrorMessage();
  const [showCreate, setShowCreate] = useState(false);
  const [role, setRole] = useState<Role>('STUDENT');
  const [email, setEmail] = useState('');
  const [hours, setHours] = useState('72');
  const [busy, setBusy] = useState(false);

  const q = useQuery({ queryKey: ['admin', 'invites'], queryFn: () => invitesApi.list() });

  const create = async () => {
    setBusy(true);
    try {
      await invitesApi.create({
        role,
        email: email || undefined,
        expiresInHours: parseInt(hours, 10) || 72,
      });
      toast.show(t('common.save'), 'success');
      setShowCreate(false);
      setEmail('');
      qc.invalidateQueries({ queryKey: ['admin', 'invites'] });
    } catch (e) {
      toast.show(getErr(e), 'danger');
    } finally {
      setBusy(false);
    }
  };

  const onCopy = async (token: string) => {
    await Clipboard.setStringAsync(token);
    toast.show(t('common.copied'), 'success');
  };

  const onRevoke = (id: string) => {
    Alert.alert(t('common.delete'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await invitesApi.delete(id);
            qc.invalidateQueries({ queryKey: ['admin', 'invites'] });
          } catch (e) {
            toast.show(getErr(e), 'danger');
          }
        },
      },
    ]);
  };

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: theme.spacing.xl }}>
        <Header
          title={t('admin.invites')}
          back
          right={
            <Pressable
              onPress={() => setShowCreate((v) => !v)}
              hitSlop={8}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: theme.colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name={showCreate ? 'close' : 'add'} size={20} color="#fff" />
            </Pressable>
          }
        />

        {showCreate && (
          <Card padded style={{ marginBottom: theme.spacing.lg }}>
            <Text variant="title" style={{ marginBottom: theme.spacing.md }}>
              {t('admin.invites')}
            </Text>
            <View style={{ gap: theme.spacing.md }}>
              <View>
                <Text variant="label" tone="muted" style={{ marginBottom: 6 }}>
                  {t('profile.role')}
                </Text>
                <SegmentedControl<Role>
                  value={role}
                  onChange={setRole}
                  options={[
                    { value: 'STUDENT', label: t('role.STUDENT') },
                    { value: 'INSTRUCTOR', label: t('role.INSTRUCTOR') },
                    { value: 'ADMIN', label: t('role.ADMIN') },
                  ]}
                />
              </View>
              <Input label={t('common.email')} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
              <Input label="Expires (hours)" value={hours} onChangeText={setHours} keyboardType="numeric" />
              <Button title={t('common.save')} onPress={create} loading={busy} fullWidth />
            </View>
          </Card>
        )}
      </View>

      {q.isLoading ? (
        <Loading />
      ) : q.isError ? (
        <View style={{ paddingHorizontal: theme.spacing.xl }}>
          <ErrorBanner message={getErr(q.error)} />
        </View>
      ) : (
        <FlatList
          data={q.data || []}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing['4xl'], gap: theme.spacing.sm }}
          ListEmptyComponent={<EmptyState icon="ticket-outline" title={t('common.empty')} />}
          refreshControl={
            <RefreshControl refreshing={q.isRefetching} onRefresh={() => q.refetch()} tintColor={theme.colors.primary} />
          }
          renderItem={({ item }) => {
            const used = !!item.usedAt;
            const expired = !used && new Date(item.expiresAt) < new Date();
            return (
              <Card padded>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                  <Badge label={t(`role.${item.role}`)} tone="primary" />
                  {used ? (
                    <Badge label="Used" tone="success" />
                  ) : expired ? (
                    <Badge label="Expired" tone="danger" />
                  ) : (
                    <Badge label="Active" tone="info" />
                  )}
                </View>
                <Text variant="bodyMedium" numberOfLines={1}>
                  {item.email || '(no email)'}
                </Text>
                <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
                  Expires {formatDateTime(item.expiresAt, locale)}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
                  <Pressable
                    onPress={() => onCopy(item.token)}
                    style={({ pressed }) => ({
                      flex: 1,
                      backgroundColor: pressed ? theme.colors.surfaceHover : theme.colors.surfaceMuted,
                      padding: 10,
                      borderRadius: theme.radius.sm,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                    })}
                  >
                    <Ionicons name="copy-outline" size={16} color={theme.colors.textMuted} />
                    <Text variant="caption" style={{ fontFamily: 'Courier', flex: 1 }} numberOfLines={1}>
                      {item.token}
                    </Text>
                  </Pressable>
                  {!used && (
                    <Pressable onPress={() => onRevoke(item.id)} hitSlop={8}>
                      <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
                    </Pressable>
                  )}
                </View>
              </Card>
            );
          }}
        />
      )}
    </Screen>
  );
}
