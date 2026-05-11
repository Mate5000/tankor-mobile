import React, { useState } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { Badge } from '@/components/Badge';
import { Avatar } from '@/components/Avatar';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import { useTheme } from '@/theme/ThemeProvider';
import { useT } from '@/i18n';
import { usersApi } from '@/api/endpoints';
import { useApiErrorMessage } from '@/hooks/useApiError';

export default function AdminUsersScreen() {
  const theme = useTheme();
  const t = useT();
  const getErr = useApiErrorMessage();
  const [q, setQ] = useState('');

  const usersQ = useQuery({
    queryKey: ['admin', 'users', q],
    queryFn: () => usersApi.list({ q, pageSize: 100 }),
  });

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: theme.spacing.xl }}>
        <Header title={t('admin.users')} back />
        <View style={{ marginBottom: theme.spacing.md }}>
          <Input
            value={q}
            onChangeText={setQ}
            placeholder={t('common.search')}
            leftIcon={<Ionicons name="search" size={18} color={theme.colors.textMuted} />}
            autoCapitalize="none"
          />
        </View>
      </View>

      {usersQ.isLoading ? (
        <Loading />
      ) : usersQ.isError ? (
        <View style={{ paddingHorizontal: theme.spacing.xl }}>
          <ErrorBanner message={getErr(usersQ.error)} />
        </View>
      ) : (
        <FlatList
          data={usersQ.data?.items || []}
          keyExtractor={(u) => u.id}
          contentContainerStyle={{ paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing['4xl'], gap: theme.spacing.sm }}
          ListEmptyComponent={<EmptyState icon="people-outline" title={t('common.empty')} />}
          refreshControl={
            <RefreshControl
              refreshing={usersQ.isRefetching}
              onRefresh={() => usersQ.refetch()}
              tintColor={theme.colors.primary}
            />
          }
          renderItem={({ item }) => (
            <Card padded>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
                <Avatar name={item.name} url={item.avatarUrl} size={42} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text variant="bodyMedium" numberOfLines={1}>{item.name}</Text>
                  <Text variant="caption" tone="muted" numberOfLines={1}>{item.email}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Badge label={t(`role.${item.role}`)} tone="primary" />
                  {item.isActive === false ? <Badge label={t('users.deactivate')} tone="danger" /> : null}
                </View>
              </View>
            </Card>
          )}
        />
      )}
    </Screen>
  );
}
