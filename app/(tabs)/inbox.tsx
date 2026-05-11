import React, { useState } from 'react';
import { View, FlatList, RefreshControl, Pressable } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import { useTheme } from '@/theme/ThemeProvider';
import { useT, useI18n } from '@/i18n';
import { announcementsApi, notificationsApi } from '@/api/endpoints';
import { useApiErrorMessage } from '@/hooks/useApiError';
import { timeAgo } from '@/utils/format';

type Tab = 'announcements' | 'notifications';

export default function InboxScreen() {
  const theme = useTheme();
  const t = useT();
  const { locale } = useI18n();
  const router = useRouter();
  const qc = useQueryClient();
  const getErr = useApiErrorMessage();
  const [tab, setTab] = useState<Tab>('announcements');

  const annQ = useQuery({
    queryKey: ['announcements', 'list'],
    queryFn: () => announcementsApi.list({ limit: 50 }),
  });

  const notifQ = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: () => notificationsApi.list(false, 50),
    refetchInterval: tab === 'notifications' ? 20_000 : false,
  });

  const onMarkAllRead = async () => {
    await notificationsApi.markAllRead();
    qc.invalidateQueries({ queryKey: ['notifications'] });
  };

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: theme.spacing.xl, paddingTop: theme.spacing.md, marginBottom: theme.spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
          <Text variant="h1">{t('tabs.inbox')}</Text>
          {tab === 'notifications' && (notifQ.data?.unreadCount ?? 0) > 0 ? (
            <Pressable onPress={onMarkAllRead} hitSlop={8}>
              <Text variant="caption" tone="primary" weight="600">
                {t('notifications.readAll')}
              </Text>
            </Pressable>
          ) : null}
        </View>
        <SegmentedControl<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: 'announcements', label: t('announcement.title') },
            {
              value: 'notifications',
              label:
                (notifQ.data?.unreadCount ?? 0) > 0
                  ? `${t('notifications.title')} (${notifQ.data!.unreadCount})`
                  : t('notifications.title'),
            },
          ]}
        />
      </View>

      {tab === 'announcements' ? (
        annQ.isLoading ? (
          <Loading />
        ) : annQ.isError ? (
          <View style={{ paddingHorizontal: theme.spacing.xl }}>
            <ErrorBanner message={getErr(annQ.error)} />
          </View>
        ) : (
          <FlatList
            data={annQ.data || []}
            keyExtractor={(a) => a.id}
            contentContainerStyle={{ paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing['4xl'], gap: theme.spacing.sm }}
            ListEmptyComponent={<EmptyState icon="megaphone-outline" title={t('announcement.empty')} />}
            renderItem={({ item }) => (
              <Card padded>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  {item.pinned ? <Badge label={t('announcement.pinned')} tone="warning" /> : null}
                  <Badge label={item.course?.title || t('announcement.global')} tone={item.course ? 'primary' : 'info'} />
                  <Text variant="caption" tone="dim" style={{ marginLeft: 'auto' }}>
                    {timeAgo(item.createdAt, locale)}
                  </Text>
                </View>
                <Text variant="title" style={{ marginBottom: 4 }}>
                  {item.title}
                </Text>
                <Text variant="body" tone="muted" numberOfLines={4}>
                  {item.body}
                </Text>
              </Card>
            )}
            refreshControl={
              <RefreshControl refreshing={annQ.isRefetching} onRefresh={() => annQ.refetch()} tintColor={theme.colors.primary} />
            }
          />
        )
      ) : notifQ.isLoading ? (
        <Loading />
      ) : notifQ.isError ? (
        <View style={{ paddingHorizontal: theme.spacing.xl }}>
          <ErrorBanner message={getErr(notifQ.error)} />
        </View>
      ) : (
        <FlatList
          data={notifQ.data?.items || []}
          keyExtractor={(n) => n.id}
          contentContainerStyle={{ paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing['4xl'], gap: theme.spacing.sm }}
          ListEmptyComponent={<EmptyState icon="notifications-off-outline" title={t('notifications.empty')} />}
          renderItem={({ item }) => {
            const isUnread = !item.readAt;
            return (
              <Card
                padded
                onPress={async () => {
                  if (isUnread) {
                    await notificationsApi.markRead(item.id);
                    qc.invalidateQueries({ queryKey: ['notifications'] });
                  }
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.md }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: isUnread ? theme.colors.primarySoft : theme.colors.surfaceMuted,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons
                      name={item.type === 'grade' ? 'trophy-outline' : 'megaphone-outline'}
                      size={18}
                      color={isUnread ? theme.colors.primary : theme.colors.textMuted}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text variant="bodyMedium" weight={isUnread ? '700' : '500'}>
                        {item.type === 'grade' ? t('notifications.newGrade') : t('notifications.newAnnouncement')}
                      </Text>
                      {isUnread ? (
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary }} />
                      ) : null}
                    </View>
                    <Text variant="caption" tone="muted" style={{ marginTop: 2 }} numberOfLines={2}>
                      {item.payload?.title || item.payload?.assignmentTitle || ''}
                    </Text>
                    <Text variant="caption" tone="dim" style={{ marginTop: 4 }}>
                      {timeAgo(item.createdAt, locale)}
                    </Text>
                  </View>
                </View>
              </Card>
            );
          }}
          refreshControl={
            <RefreshControl refreshing={notifQ.isRefetching} onRefresh={() => notifQ.refetch()} tintColor={theme.colors.primary} />
          }
        />
      )}
    </Screen>
  );
}
