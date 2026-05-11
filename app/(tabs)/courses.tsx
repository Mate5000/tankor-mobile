import React, { useMemo, useState } from 'react';
import { View, FlatList, RefreshControl, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Avatar } from '@/components/Avatar';
import { Input } from '@/components/Input';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import { useTheme } from '@/theme/ThemeProvider';
import { useT } from '@/i18n';
import { useAuthStore } from '@/store/auth';
import { coursesApi, meApi } from '@/api/endpoints';
import { useApiErrorMessage } from '@/hooks/useApiError';
import type { Course } from '@/types/api';

type CourseView = 'browse' | 'mine';

export default function CoursesScreen() {
  const theme = useTheme();
  const t = useT();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const getErr = useApiErrorMessage();
  const [q, setQ] = useState('');
  const [view, setView] = useState<CourseView>(user?.role === 'STUDENT' ? 'browse' : 'mine');

  const isStudent = user?.role === 'STUDENT';
  const isInstructor = user?.role === 'INSTRUCTOR';

  const browseQ = useQuery({
    queryKey: ['courses', 'browse', q],
    queryFn: () => coursesApi.list({ q, status: 'PUBLISHED', pageSize: 50 }),
    enabled: view === 'browse',
  });

  const mineQ = useQuery({
    queryKey: isInstructor ? ['me', 'teaching'] : ['me', 'enrollments'],
    queryFn: () => (isInstructor ? meApi.teaching() : meApi.enrollments()),
    enabled: view === 'mine',
  });

  const items = useMemo<Course[]>(() => {
    if (view === 'browse') return browseQ.data?.items || [];
    return mineQ.data || [];
  }, [view, browseQ.data, mineQ.data]);

  const filtered = view === 'mine' && q
    ? items.filter((c) => c.title.toLowerCase().includes(q.toLowerCase()))
    : items;

  const isLoading = view === 'browse' ? browseQ.isLoading : mineQ.isLoading;
  const error = view === 'browse' ? browseQ.error : mineQ.error;

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: theme.spacing.xl }}>
        <View style={{ paddingTop: theme.spacing.md, marginBottom: theme.spacing.lg }}>
          <Text variant="h1">{t('courses.title')}</Text>
          <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
            {t('courses.subtitle')}
          </Text>
        </View>

        {(isStudent || isInstructor) && (
          <View style={{ marginBottom: theme.spacing.md }}>
            <SegmentedControl<CourseView>
              value={view}
              onChange={setView}
              options={
                isInstructor
                  ? [
                      { value: 'mine', label: t('teach.title') },
                      { value: 'browse', label: t('courses.title') },
                    ]
                  : [
                      { value: 'browse', label: t('courses.title') },
                      { value: 'mine', label: t('dashboard.myCourses') },
                    ]
              }
            />
          </View>
        )}

        <View style={{ marginBottom: theme.spacing.md }}>
          <Input
            value={q}
            onChangeText={setQ}
            placeholder={t('courses.search')}
            leftIcon={<Ionicons name="search" size={18} color={theme.colors.textMuted} />}
            autoCapitalize="none"
          />
        </View>
      </View>

      {error ? (
        <View style={{ paddingHorizontal: theme.spacing.xl }}>
          <ErrorBanner message={getErr(error)} />
        </View>
      ) : null}

      {isLoading ? (
        <Loading />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.xl,
            paddingBottom: theme.spacing['4xl'],
            gap: theme.spacing.md,
          }}
          ListEmptyComponent={
            <EmptyState
              icon="library-outline"
              title={t('courses.empty')}
              description={view === 'mine' ? t('teach.empty') : undefined}
            />
          }
          renderItem={({ item }) => (
            <CourseCard course={item} onPress={() => router.push(`/courses/${item.id}` as any)} />
          )}
          refreshControl={
            <RefreshControl
              refreshing={view === 'browse' ? browseQ.isRefetching : mineQ.isRefetching}
              onRefresh={() => (view === 'browse' ? browseQ.refetch() : mineQ.refetch())}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}
    </Screen>
  );
}

function CourseCard({ course, onPress }: { course: Course; onPress: () => void }) {
  const theme = useTheme();
  const t = useT();
  return (
    <Card onPress={onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.md }}>
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.primarySoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="book" size={22} color={theme.colors.primary} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            {course.status !== 'PUBLISHED' ? (
              <Badge label={t(`courseStatus.${course.status}`)} tone={course.status === 'DRAFT' ? 'warning' : 'neutral'} />
            ) : null}
            {course.isEnrolled ? <Badge label={t('courses.enrolled')} tone="success" /> : null}
          </View>
          <Text variant="title" numberOfLines={2}>
            {course.title}
          </Text>
          {course.instructor ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
              <Avatar name={course.instructor.name} url={course.instructor.avatarUrl} size={18} />
              <Text variant="caption" tone="muted" numberOfLines={1}>
                {course.instructor.name}
              </Text>
            </View>
          ) : null}
          <View style={{ flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.sm }}>
            {course.lessonCount !== undefined ? (
              <MetaPill icon="calendar-outline" label={t('courses.lessonsCount', { count: course.lessonCount })} />
            ) : null}
            {course.capacity ? (
              <MetaPill
                icon="people-outline"
                label={t('courses.capacity', { count: course.enrollmentCount ?? 0, total: course.capacity })}
              />
            ) : null}
          </View>
        </View>
      </View>
    </Card>
  );
}

function MetaPill({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Ionicons name={icon} size={13} color={theme.colors.textMuted} />
      <Text variant="caption" tone="muted">
        {label}
      </Text>
    </View>
  );
}
