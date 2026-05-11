import React from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { Badge } from '@/components/Badge';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import { useTheme } from '@/theme/ThemeProvider';
import { useT } from '@/i18n';
import { meApi } from '@/api/endpoints';
import { useApiErrorMessage } from '@/hooks/useApiError';

export default function TeachIndex() {
  const theme = useTheme();
  const t = useT();
  const router = useRouter();
  const getErr = useApiErrorMessage();

  const q = useQuery({ queryKey: ['me', 'teaching'], queryFn: () => meApi.teaching() });

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: theme.spacing.xl }}>
        <Header title={t('teach.title')} back />
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
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing['4xl'], gap: theme.spacing.md }}
          ListEmptyComponent={<EmptyState icon="briefcase-outline" title={t('teach.empty')} />}
          refreshControl={
            <RefreshControl refreshing={q.isRefetching} onRefresh={() => q.refetch()} tintColor={theme.colors.primary} />
          }
          renderItem={({ item }) => (
            <Card onPress={() => router.push(`/teach/${item.id}` as any)}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.md }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: theme.radius.md,
                    backgroundColor: theme.colors.primarySoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="briefcase" size={20} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                    <Badge label={t(`courseStatus.${item.status}`)} tone={item.status === 'PUBLISHED' ? 'success' : 'neutral'} />
                    {item.schoolYear ? <Badge label={item.schoolYear} tone="info" /> : null}
                  </View>
                  <Text variant="title" numberOfLines={2}>{item.title}</Text>
                  <Text variant="caption" tone="muted" style={{ marginTop: 4 }}>
                    {t('teach.students', { count: item.enrollmentCount ?? 0 })} · {item.lessonCount ?? 0} {t('courses.lessons').toLowerCase()}
                  </Text>
                </View>
              </View>
            </Card>
          )}
        />
      )}
    </Screen>
  );
}
