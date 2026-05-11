import React from 'react';
import { View, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { Badge } from '@/components/Badge';
import { Avatar } from '@/components/Avatar';
import { Section } from '@/components/Section';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import { useTheme } from '@/theme/ThemeProvider';
import { useT, useI18n } from '@/i18n';
import { coursesApi } from '@/api/endpoints';
import { useApiErrorMessage } from '@/hooks/useApiError';
import { formatDateTime } from '@/utils/format';
import { useState } from 'react';

type Tab = 'lessons' | 'assignments' | 'students';

export default function TeachCourseScreen() {
  const theme = useTheme();
  const t = useT();
  const { locale } = useI18n();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const getErr = useApiErrorMessage();
  const [tab, setTab] = useState<Tab>('lessons');

  const courseQ = useQuery({ queryKey: ['course', id], queryFn: () => coursesApi.get(id!) });
  const lessonsQ = useQuery({ queryKey: ['course', id, 'lessons'], queryFn: () => coursesApi.lessons(id!), enabled: tab === 'lessons' });
  const assignmentsQ = useQuery({ queryKey: ['course', id, 'assignments'], queryFn: () => coursesApi.assignments(id!), enabled: tab === 'assignments' });
  const enrollmentsQ = useQuery({ queryKey: ['course', id, 'enrollments'], queryFn: () => coursesApi.enrollments(id!), enabled: tab === 'students' });

  if (courseQ.isLoading) {
    return (
      <Screen>
        <Header title={t('common.loading')} back />
        <Loading />
      </Screen>
    );
  }
  if (!courseQ.data) {
    return (
      <Screen>
        <Header title={t('error.NOT_FOUND')} back />
      </Screen>
    );
  }

  const c = courseQ.data;

  return (
    <Screen>
      <Header title={c.title} subtitle={t(`courseStatus.${c.status}`)} back />

      <Card padded style={{ marginBottom: theme.spacing.lg }}>
        <View style={{ flexDirection: 'row', gap: theme.spacing.xl }}>
          <View style={{ flex: 1 }}>
            <Text variant="caption" tone="dim">{t('dashboard.students')}</Text>
            <Text variant="h2">
              {c.enrollmentCount ?? 0}
              {c.capacity ? ` / ${c.capacity}` : ''}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="caption" tone="dim">{t('courses.lessons')}</Text>
            <Text variant="h2">{c.lessonCount ?? 0}</Text>
          </View>
        </View>
      </Card>

      <View style={{ marginBottom: theme.spacing.md }}>
        <SegmentedControl<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: 'lessons', label: t('courses.lessons') },
            { value: 'assignments', label: t('courses.assignments') },
            { value: 'students', label: t('dashboard.students') },
          ]}
        />
      </View>

      {tab === 'lessons' && (
        <Section title={t('courses.lessons')}>
          {lessonsQ.isLoading ? <Loading /> : (lessonsQ.data || []).length === 0 ? (
            <EmptyState icon="calendar-outline" title={t('courses.noLessonsYet')} />
          ) : (
            <View style={{ gap: theme.spacing.sm }}>
              {lessonsQ.data!.map((l) => (
                <Card key={l.id} padded onPress={() => router.push(`/lessons/${l.id}/checkin` as any)}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyMedium">{l.title}</Text>
                      <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
                        {formatDateTime(l.startsAt, locale)}
                      </Text>
                    </View>
                    <Ionicons name="qr-code-outline" size={18} color={theme.colors.textMuted} />
                  </View>
                </Card>
              ))}
            </View>
          )}
        </Section>
      )}

      {tab === 'assignments' && (
        <Section title={t('courses.assignments')}>
          {assignmentsQ.isLoading ? <Loading /> : (assignmentsQ.data || []).length === 0 ? (
            <EmptyState icon="document-text-outline" title={t('assignment.empty')} />
          ) : (
            <View style={{ gap: theme.spacing.sm }}>
              {assignmentsQ.data!.map((a) => (
                <Card key={a.id} padded onPress={() => router.push(`/assignments/${a.id}` as any)}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyMedium">{a.title}</Text>
                      <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
                        {a.dueAt ? formatDateTime(a.dueAt, locale) : t('assignment.noDeadline')}
                      </Text>
                    </View>
                    <Badge label={`${a.maxPoints} pt`} tone="primary" />
                  </View>
                </Card>
              ))}
            </View>
          )}
        </Section>
      )}

      {tab === 'students' && (
        <Section title={t('dashboard.students')}>
          {enrollmentsQ.isLoading ? <Loading /> : (enrollmentsQ.data || []).length === 0 ? (
            <EmptyState icon="people-outline" title={t('courseForm.noEnrollments')} />
          ) : (
            <View style={{ gap: theme.spacing.xs }}>
              {enrollmentsQ.data!.map((e) => (
                <Card key={e.id} padded>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
                    <Avatar name={e.student?.name} url={e.student?.avatarUrl} size={36} />
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyMedium">{e.student?.name}</Text>
                      <Text variant="caption" tone="muted">{e.student?.email}</Text>
                    </View>
                    <Badge label={e.status} tone={e.status === 'ACTIVE' ? 'success' : 'neutral'} />
                  </View>
                </Card>
              ))}
            </View>
          )}
        </Section>
      )}
    </Screen>
  );
}
