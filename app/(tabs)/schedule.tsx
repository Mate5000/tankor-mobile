import React, { useMemo } from 'react';
import { View, SectionList, RefreshControl, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import { useTheme } from '@/theme/ThemeProvider';
import { useT, useI18n } from '@/i18n';
import { meApi } from '@/api/endpoints';
import { useApiErrorMessage } from '@/hooks/useApiError';
import { formatRelativeDay, formatTime, formatTimeRange } from '@/utils/format';
import type { Lesson } from '@/types/api';

export default function ScheduleScreen() {
  const theme = useTheme();
  const t = useT();
  const { locale } = useI18n();
  const router = useRouter();
  const getErr = useApiErrorMessage();

  const range = useMemo(() => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const to = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30).toISOString();
    return { from, to };
  }, []);

  const scheduleQ = useQuery({
    queryKey: ['schedule', range.from, range.to],
    queryFn: () => meApi.schedule(range.from, range.to),
  });

  const sections = useMemo(() => {
    const lessons = scheduleQ.data || [];
    const groups = new Map<string, Lesson[]>();
    for (const l of lessons) {
      const d = new Date(l.startsAt);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(l);
    }
    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, items]) => ({
        title: formatRelativeDay(items[0].startsAt, locale),
        data: items.sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
      }));
  }, [scheduleQ.data, locale]);

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: theme.spacing.xl, paddingTop: theme.spacing.md, marginBottom: theme.spacing.lg }}>
        <Text variant="h1">{t('schedule.title')}</Text>
        <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
          {t('schedule.subtitle')}
        </Text>
      </View>

      {scheduleQ.isError ? (
        <View style={{ paddingHorizontal: theme.spacing.xl }}>
          <ErrorBanner message={getErr(scheduleQ.error)} />
        </View>
      ) : null}

      {scheduleQ.isLoading ? (
        <Loading />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing['4xl'] }}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={<EmptyState icon="calendar-outline" title={t('schedule.noUpcoming')} />}
          renderSectionHeader={({ section }) => (
            <View style={{ marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm }}>
              <Text variant="label" tone="muted">
                {section.title.toUpperCase()}
              </Text>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: theme.spacing.sm }} />}
          renderItem={({ item }) => (
            <Card onPress={() => router.push(`/courses/${item.courseId}` as any)}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
                <View
                  style={{
                    width: 4,
                    backgroundColor: theme.colors.primary,
                    alignSelf: 'stretch',
                    borderRadius: 2,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text variant="caption" tone="primary" weight="600">
                    {formatTimeRange(item.startsAt, item.endsAt, locale)}
                  </Text>
                  <Text variant="bodyMedium" style={{ marginTop: 2 }} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text variant="caption" tone="muted" numberOfLines={1} style={{ marginTop: 2 }}>
                    {item.course?.title}
                    {item.location ? ` · ${item.location}` : ''}
                  </Text>
                </View>
                <Pressable
                  onPress={() => router.push(`/lessons/${item.id}/checkin` as any)}
                  hitSlop={8}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: theme.colors.primarySoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="qr-code-outline" size={18} color={theme.colors.primary} />
                </Pressable>
              </View>
            </Card>
          )}
          refreshControl={
            <RefreshControl
              refreshing={scheduleQ.isRefetching}
              onRefresh={() => scheduleQ.refetch()}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}
    </Screen>
  );
}
