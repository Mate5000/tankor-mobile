import React from 'react';
import { View, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { StatCard } from '@/components/StatCard';
import { Section } from '@/components/Section';
import { Badge } from '@/components/Badge';
import { Avatar } from '@/components/Avatar';
import { EmptyState } from '@/components/EmptyState';
import { Loading } from '@/components/Loading';
import { ErrorBanner } from '@/components/ErrorBanner';
import { useTheme } from '@/theme/ThemeProvider';
import { useT, useI18n } from '@/i18n';
import { useAuthStore } from '@/store/auth';
import { meApi, notificationsApi } from '@/api/endpoints';
import { useApiErrorMessage } from '@/hooks/useApiError';
import { formatDateTime, formatRelativeDay, formatTime, timeAgo } from '@/utils/format';
import type { DashboardData, Lesson } from '@/types/api';

export default function DashboardScreen() {
  const theme = useTheme();
  const t = useT();
  const { locale } = useI18n();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const getErr = useApiErrorMessage();

  const dashQ = useQuery({ queryKey: ['dashboard'], queryFn: () => meApi.dashboard() });
  const notifQ = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => notificationsApi.list(true, 1),
    refetchInterval: 30_000,
  });

  const role = user?.role;
  const unreadCount = notifQ.data?.unreadCount ?? 0;

  return (
    <Screen
      refreshing={dashQ.isRefetching}
      onRefresh={() => {
        dashQ.refetch();
        notifQ.refetch();
      }}
    >
      {/* Greeting + bell */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: theme.spacing['2xl'],
          marginTop: theme.spacing.sm,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, flex: 1 }}>
          <Avatar name={user?.name} url={user?.avatarUrl} size={48} />
          <View style={{ flex: 1 }}>
            <Text variant="caption" tone="muted">
              {role ? t(`role.${role}`) : ''}
            </Text>
            <Text variant="h2" numberOfLines={1}>
              {t('dashboard.greeting', { name: (user?.name || '').split(' ')[0] || '' })}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={() => router.push('/notifications')}
          hitSlop={10}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="notifications-outline" size={20} color={theme.colors.text} />
          {unreadCount > 0 ? (
            <View
              style={{
                position: 'absolute',
                top: 6,
                right: 7,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: theme.colors.danger,
                borderWidth: 2,
                borderColor: theme.colors.surface,
              }}
            />
          ) : null}
        </Pressable>
      </View>

      {dashQ.isError ? <ErrorBanner message={getErr(dashQ.error)} /> : null}
      {dashQ.isLoading ? <Loading /> : null}

      {dashQ.data ? (
        <DashboardContent data={dashQ.data} />
      ) : null}
    </Screen>
  );
}

function DashboardContent({ data }: { data: DashboardData }) {
  const theme = useTheme();
  const t = useT();
  const { locale } = useI18n();
  const router = useRouter();
  const role = data.role;

  return (
    <>
      {/* Stats grid */}
      <View style={{ flexDirection: 'row', gap: theme.spacing.md, marginBottom: theme.spacing.lg }}>
        {role === 'STUDENT' ? (
          <>
            <StatCard
              label={t('dashboard.enrolledCourses')}
              value={data.enrolledCourses ?? 0}
              icon="library-outline"
              tone="primary"
            />
            <StatCard
              label={t('dashboard.pendingAssignments')}
              value={data.pendingAssignments ?? 0}
              icon="document-text-outline"
              tone="warning"
            />
          </>
        ) : role === 'INSTRUCTOR' ? (
          <>
            <StatCard
              label={t('dashboard.coursesTaught')}
              value={data.coursesTaught ?? 0}
              icon="briefcase-outline"
              tone="primary"
            />
            <StatCard
              label={t('dashboard.pendingGrading')}
              value={data.pendingGrading ?? 0}
              icon="checkmark-done-outline"
              tone="warning"
            />
          </>
        ) : (
          <>
            <StatCard
              label={t('dashboard.totalUsers')}
              value={data.totalUsers ?? 0}
              icon="people-outline"
              tone="primary"
            />
            <StatCard
              label={t('dashboard.activeCourses')}
              value={data.activeCourses ?? 0}
              icon="library-outline"
              tone="info"
            />
          </>
        )}
      </View>

      {role === 'INSTRUCTOR' && (
        <View style={{ flexDirection: 'row', gap: theme.spacing.md, marginBottom: theme.spacing['2xl'] }}>
          <StatCard label={t('dashboard.students')} value={data.students ?? 0} icon="school-outline" tone="info" />
          <View style={{ flex: 1 }} />
        </View>
      )}

      {role === 'ADMIN' || role === 'SUPER_ADMIN' ? (
        <View style={{ flexDirection: 'row', gap: theme.spacing.md, marginBottom: theme.spacing['2xl'] }}>
          <StatCard label={t('dashboard.instructors')} value={data.instructors ?? 0} icon="ribbon-outline" tone="success" />
          <StatCard label={t('dashboard.activeEnrollments')} value={data.activeEnrollments ?? 0} icon="people-outline" tone="info" />
        </View>
      ) : null}

      {/* Upcoming lessons (student) */}
      {role === 'STUDENT' && (
        <Section title={t('dashboard.upcomingLessons')} action={<SeeAllButton onPress={() => router.push('/(tabs)/schedule')} />}>
          {data.upcomingLessons && data.upcomingLessons.length > 0 ? (
            <View style={{ gap: theme.spacing.sm }}>
              {data.upcomingLessons.slice(0, 3).map((l) => (
                <LessonRow key={l.id} lesson={l} onPress={() => router.push(`/courses/${l.courseId}` as any)} />
              ))}
            </View>
          ) : (
            <EmptyCard icon="calendar-outline" message={t('dashboard.noUpcoming')} />
          )}
        </Section>
      )}

      {/* To grade (instructor) */}
      {role === 'INSTRUCTOR' && (
        <Section title={t('dashboard.toGrade')}>
          {data.toGrade && data.toGrade.length > 0 ? (
            <View style={{ gap: theme.spacing.sm }}>
              {data.toGrade.slice(0, 4).map((g) => (
                <Card key={g.id} padded onPress={() => router.push(`/assignments/${g.id}` as any)}>
                  <Text variant="bodyMedium" numberOfLines={1}>{g.assignmentTitle}</Text>
                  <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
                    {g.courseTitle} · {g.studentName}
                  </Text>
                  <Text variant="caption" tone="dim" style={{ marginTop: 4 }}>
                    {timeAgo(g.submittedAt, locale)}
                  </Text>
                </Card>
              ))}
            </View>
          ) : (
            <EmptyCard icon="checkmark-done-outline" message={t('dashboard.noPendingGrading')} />
          )}
        </Section>
      )}

      {/* Recent grades (student) */}
      {role === 'STUDENT' && (
        <Section title={t('dashboard.recentGrades')}>
          {data.recentGrades && data.recentGrades.length > 0 ? (
            <View style={{ gap: theme.spacing.sm }}>
              {data.recentGrades.slice(0, 3).map((g) => (
                <Card key={g.id} padded>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyMedium" numberOfLines={1}>{g.assignmentTitle}</Text>
                      <Text variant="caption" tone="muted">
                        {g.courseTitle}
                      </Text>
                    </View>
                    <Badge label={`${g.points} pt`} tone="success" size="md" />
                  </View>
                </Card>
              ))}
            </View>
          ) : (
            <EmptyCard icon="trophy-outline" message={t('dashboard.noGrades')} />
          )}
        </Section>
      )}

      {/* Recent announcements */}
      <Section title={t('dashboard.recentAnnouncements')}>
        {data.recentAnnouncements && data.recentAnnouncements.length > 0 ? (
          <View style={{ gap: theme.spacing.sm }}>
            {data.recentAnnouncements.slice(0, 3).map((a) => (
              <Card key={a.id} padded>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  {a.pinned ? <Badge label={t('announcement.pinned')} tone="warning" /> : null}
                  <Badge
                    label={a.course?.title || t('announcement.global')}
                    tone={a.course ? 'primary' : 'info'}
                  />
                </View>
                <Text variant="bodyMedium" numberOfLines={1}>
                  {a.title}
                </Text>
                <Text variant="caption" tone="muted" numberOfLines={2} style={{ marginTop: 2 }}>
                  {a.body}
                </Text>
              </Card>
            ))}
          </View>
        ) : (
          <EmptyCard icon="megaphone-outline" message={t('dashboard.noAnnouncements')} />
        )}
      </Section>

      {/* Recent courses (admin) */}
      {(role === 'ADMIN' || role === 'SUPER_ADMIN') && data.recentCourses && data.recentCourses.length > 0 && (
        <Section title={t('dashboard.recentCourses')}>
          <View style={{ gap: theme.spacing.sm }}>
            {data.recentCourses.slice(0, 4).map((c) => (
              <Card key={c.id} padded onPress={() => router.push(`/courses/${c.id}` as any)}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text variant="bodyMedium" numberOfLines={1} style={{ flex: 1 }}>
                    {c.title}
                  </Text>
                  <Badge label={t(`courseStatus.${c.status}`)} tone={c.status === 'PUBLISHED' ? 'success' : 'neutral'} />
                </View>
              </Card>
            ))}
          </View>
        </Section>
      )}
    </>
  );
}

function LessonRow({ lesson, onPress }: { lesson: Lesson; onPress?: () => void }) {
  const theme = useTheme();
  const { locale } = useI18n();
  return (
    <Card padded onPress={onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: 10,
            backgroundColor: theme.colors.primarySoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text variant="caption" tone="primary" weight="700">
            {formatRelativeDay(lesson.startsAt, locale).slice(0, 3).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="bodyMedium" numberOfLines={1}>
            {lesson.title}
          </Text>
          <Text variant="caption" tone="muted">
            {lesson.course?.title}
          </Text>
        </View>
        <Text variant="caption" tone="muted">
          {formatTime(lesson.startsAt, locale)}
        </Text>
      </View>
    </Card>
  );
}

function EmptyCard({ icon, message }: { icon: keyof typeof Ionicons.glyphMap; message: string }) {
  const theme = useTheme();
  return (
    <Card padded>
      <View style={{ alignItems: 'center', paddingVertical: 8, gap: 6 }}>
        <Ionicons name={icon} size={28} color={theme.colors.textDim} />
        <Text variant="caption" tone="muted" align="center">
          {message}
        </Text>
      </View>
    </Card>
  );
}

function SeeAllButton({ onPress }: { onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <Text variant="caption" tone="primary" weight="600">
        →
      </Text>
    </Pressable>
  );
}
