import React, { useState } from 'react';
import { View, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Avatar } from '@/components/Avatar';
import { Section } from '@/components/Section';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Loading } from '@/components/Loading';
import { ErrorBanner } from '@/components/ErrorBanner';
import { EmptyState } from '@/components/EmptyState';
import { useTheme } from '@/theme/ThemeProvider';
import { useT, useI18n } from '@/i18n';
import { useAuthStore } from '@/store/auth';
import { coursesApi } from '@/api/endpoints';
import { useToast } from '@/components/Toast';
import { useApiErrorMessage } from '@/hooks/useApiError';
import { formatDateTime, formatTimeRange, timeAgo } from '@/utils/format';

type Tab = 'overview' | 'lessons' | 'assignments' | 'announcements';

export default function CourseDetailScreen() {
  const theme = useTheme();
  const t = useT();
  const { locale } = useI18n();
  const router = useRouter();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const getErr = useApiErrorMessage();
  const [tab, setTab] = useState<Tab>('overview');
  const [busyEnroll, setBusyEnroll] = useState(false);

  const courseQ = useQuery({ queryKey: ['course', id], queryFn: () => coursesApi.get(id!) });
  const lessonsQ = useQuery({ queryKey: ['course', id, 'lessons'], queryFn: () => coursesApi.lessons(id!), enabled: tab === 'lessons' });
  const assignmentsQ = useQuery({ queryKey: ['course', id, 'assignments'], queryFn: () => coursesApi.assignments(id!), enabled: tab === 'assignments' });
  const annQ = useQuery({ queryKey: ['course', id, 'announcements'], queryFn: () => coursesApi.announcements(id!), enabled: tab === 'announcements' });

  if (courseQ.isLoading) {
    return (
      <Screen>
        <Header title={t('common.loading')} back />
        <Loading />
      </Screen>
    );
  }

  if (courseQ.isError || !courseQ.data) {
    return (
      <Screen>
        <Header title={t('error.NOT_FOUND')} back />
        <ErrorBanner message={getErr(courseQ.error)} />
      </Screen>
    );
  }

  const course = courseQ.data;
  const isStudent = user?.role === 'STUDENT';
  const isOwner = user?.id === course.instructorId;
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const onEnroll = async () => {
    setBusyEnroll(true);
    try {
      if (course.isEnrolled) {
        await coursesApi.withdraw(course.id);
        toast.show(t('courses.withdrewOk'), 'success');
      } else {
        await coursesApi.enroll(course.id);
        toast.show(t('courses.enrolledOk'), 'success');
      }
      qc.invalidateQueries({ queryKey: ['course', id] });
      qc.invalidateQueries({ queryKey: ['me', 'enrollments'] });
    } catch (e) {
      toast.show(getErr(e), 'danger');
    } finally {
      setBusyEnroll(false);
    }
  };

  return (
    <Screen>
      <Header
        title={course.title}
        back
        right={
          isOwner || isAdmin ? (
            <Pressable
              onPress={() => router.push(`/teach/${course.id}` as any)}
              hitSlop={8}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="settings-outline" size={18} color={theme.colors.text} />
            </Pressable>
          ) : undefined
        }
      />

      {/* Course header card */}
      <Card padded style={{ marginBottom: theme.spacing.lg }}>
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: theme.spacing.sm, flexWrap: 'wrap' }}>
          <Badge label={t(`courseStatus.${course.status}`)} tone={course.status === 'PUBLISHED' ? 'success' : 'neutral'} />
          {course.isEnrolled ? <Badge label={t('courses.enrolled')} tone="primary" /> : null}
          {course.schoolYear ? <Badge label={course.schoolYear} tone="info" /> : null}
        </View>

        {course.instructor ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.md }}>
            <Avatar name={course.instructor.name} url={course.instructor.avatarUrl} size={28} />
            <View>
              <Text variant="caption" tone="dim">
                {t('courses.byInstructor')}
              </Text>
              <Text variant="bodyMedium">{course.instructor.name}</Text>
            </View>
          </View>
        ) : null}

        {course.description ? (
          <Text variant="body" tone="muted" style={{ marginBottom: theme.spacing.md }}>
            {course.description}
          </Text>
        ) : null}

        <View style={{ flexDirection: 'row', gap: theme.spacing.xl, marginBottom: theme.spacing.md }}>
          <View>
            <Text variant="caption" tone="dim">
              {t('courses.lessons')}
            </Text>
            <Text variant="title">{course.lessonCount ?? 0}</Text>
          </View>
          <View>
            <Text variant="caption" tone="dim">
              {t('dashboard.students')}
            </Text>
            <Text variant="title">
              {course.enrollmentCount ?? 0}
              {course.capacity ? ` / ${course.capacity}` : ''}
            </Text>
          </View>
        </View>

        {isStudent && course.status === 'PUBLISHED' ? (
          <Button
            title={course.isEnrolled ? t('courses.withdraw') : t('courses.enroll')}
            variant={course.isEnrolled ? 'outline' : 'primary'}
            onPress={onEnroll}
            loading={busyEnroll}
            disabled={
              !course.isEnrolled &&
              course.capacity > 0 &&
              (course.enrollmentCount ?? 0) >= course.capacity
            }
            fullWidth
          />
        ) : null}
      </Card>

      {/* Tabs */}
      <View style={{ marginBottom: theme.spacing.md }}>
        <SegmentedControl<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: 'overview', label: t('courses.description') },
            { value: 'lessons', label: t('courses.lessons') },
            { value: 'assignments', label: t('courses.assignments') },
            { value: 'announcements', label: t('courses.announcements') },
          ]}
        />
      </View>

      {tab === 'overview' && (
        <Section title={t('courses.description')}>
          <Card padded>
            <Text variant="body" tone={course.description ? 'default' : 'muted'}>
              {course.description || t('common.empty')}
            </Text>
          </Card>
        </Section>
      )}

      {tab === 'lessons' && (
        <Section title={t('courses.lessons')}>
          {lessonsQ.isLoading ? (
            <Loading />
          ) : (lessonsQ.data || []).length === 0 ? (
            <EmptyState icon="calendar-outline" title={t('courses.noLessonsYet')} />
          ) : (
            <View style={{ gap: theme.spacing.sm }}>
              {lessonsQ.data!.map((l) => (
                <Card key={l.id} padded onPress={() => router.push(`/lessons/${l.id}/checkin` as any)}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyMedium" numberOfLines={1}>{l.title}</Text>
                      <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
                        {formatDateTime(l.startsAt, locale)}
                      </Text>
                      {l.location ? (
                        <Text variant="caption" tone="dim" style={{ marginTop: 2 }}>
                          {l.location}
                        </Text>
                      ) : null}
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
          {assignmentsQ.isLoading ? (
            <Loading />
          ) : (assignmentsQ.data || []).length === 0 ? (
            <EmptyState icon="document-text-outline" title={t('assignment.empty')} />
          ) : (
            <View style={{ gap: theme.spacing.sm }}>
              {assignmentsQ.data!.map((a) => (
                <Card key={a.id} padded onPress={() => router.push(`/assignments/${a.id}` as any)}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: theme.spacing.md }}>
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyMedium" numberOfLines={1}>{a.title}</Text>
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

      {tab === 'announcements' && (
        <Section title={t('courses.announcements')}>
          {annQ.isLoading ? (
            <Loading />
          ) : (annQ.data || []).length === 0 ? (
            <EmptyState icon="megaphone-outline" title={t('announcement.empty')} />
          ) : (
            <View style={{ gap: theme.spacing.sm }}>
              {annQ.data!.map((a) => (
                <Card key={a.id} padded>
                  {a.pinned ? <Badge label={t('announcement.pinned')} tone="warning" style={{ marginBottom: 6 }} /> : null}
                  <Text variant="bodyMedium" style={{ marginBottom: 2 }}>{a.title}</Text>
                  <Text variant="caption" tone="dim" style={{ marginBottom: 6 }}>
                    {timeAgo(a.createdAt, locale)}
                  </Text>
                  <Text variant="body" tone="muted">{a.body}</Text>
                </Card>
              ))}
            </View>
          )}
        </Section>
      )}
    </Screen>
  );
}
