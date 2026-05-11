import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Loading } from '@/components/Loading';
import { ErrorBanner } from '@/components/ErrorBanner';
import { useTheme } from '@/theme/ThemeProvider';
import { useT, useI18n } from '@/i18n';
import { useAuthStore } from '@/store/auth';
import { assignmentsApi } from '@/api/endpoints';
import { useToast } from '@/components/Toast';
import { useApiErrorMessage } from '@/hooks/useApiError';
import { formatDateTime } from '@/utils/format';

export default function AssignmentDetailScreen() {
  const theme = useTheme();
  const t = useT();
  const { locale } = useI18n();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const toast = useToast();
  const getErr = useApiErrorMessage();
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);

  const q = useQuery({ queryKey: ['assignment', id], queryFn: () => assignmentsApi.get(id!) });

  useEffect(() => {
    if (q.data?.mySubmission?.content) setContent(q.data.mySubmission.content);
  }, [q.data]);

  if (q.isLoading) {
    return (
      <Screen>
        <Header title={t('common.loading')} back />
        <Loading />
      </Screen>
    );
  }
  if (q.isError || !q.data) {
    return (
      <Screen>
        <Header title={t('error.NOT_FOUND')} back />
        <ErrorBanner message={getErr(q.error)} />
      </Screen>
    );
  }

  const a = q.data;
  const isStudent = user?.role === 'STUDENT';
  const submission = a.mySubmission;
  const grade = submission?.grade;
  const overdue = a.dueAt ? new Date(a.dueAt) < new Date() : false;
  const submitted = !!submission;

  const onSubmit = async () => {
    setBusy(true);
    try {
      await assignmentsApi.submit(a.id, { content });
      toast.show(t('assignment.submitted'), 'success');
      qc.invalidateQueries({ queryKey: ['assignment', id] });
      qc.invalidateQueries({ queryKey: ['me', 'assignments'] });
    } catch (e) {
      toast.show(getErr(e), 'danger');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen keyboardAvoiding>
      <Header title={a.title} subtitle={a.course?.title} back />

      <Card padded style={{ marginBottom: theme.spacing.lg }}>
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: theme.spacing.sm, flexWrap: 'wrap' }}>
          <Badge label={`${a.maxPoints} pt`} tone="primary" />
          {overdue ? <Badge label={t('assignment.overdue')} tone="danger" /> : null}
          {grade ? <Badge label={t('assignment.graded')} tone="success" /> : submitted ? <Badge label={t('assignment.submitted')} tone="info" /> : null}
        </View>
        {a.dueAt ? (
          <Text variant="caption" tone="muted">
            {t('assignment.dueAt')}: {formatDateTime(a.dueAt, locale)}
          </Text>
        ) : (
          <Text variant="caption" tone="muted">
            {t('assignment.noDeadline')}
          </Text>
        )}
        {a.description ? (
          <Text variant="body" style={{ marginTop: theme.spacing.md }}>
            {a.description}
          </Text>
        ) : null}
      </Card>

      {grade ? (
        <Card padded style={{ marginBottom: theme.spacing.lg, borderColor: theme.colors.success, borderWidth: 1.5 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.sm }}>
            <Ionicons name="trophy" size={20} color={theme.colors.success} />
            <Text variant="title" tone="success">
              {grade.points} / {a.maxPoints}
            </Text>
          </View>
          {grade.feedback ? (
            <>
              <Text variant="label" tone="muted" style={{ marginBottom: 4 }}>
                {t('assignment.feedback')}
              </Text>
              <Text variant="body">{grade.feedback}</Text>
            </>
          ) : null}
        </Card>
      ) : null}

      {isStudent ? (
        <Card padded>
          <Text variant="title" style={{ marginBottom: theme.spacing.md }}>
            {submitted ? t('assignment.submitted') : t('assignment.submit')}
          </Text>
          <Input
            label={t('assignment.content')}
            value={content}
            onChangeText={setContent}
            placeholder={t('assignment.contentPlaceholder')}
            multiline
            numberOfLines={6}
            style={{ minHeight: 120, textAlignVertical: 'top' }}
            editable={!busy}
          />
          <Button
            title={submitted ? t('assignment.resubmit') : t('assignment.submit')}
            onPress={onSubmit}
            loading={busy}
            disabled={!content.trim()}
            fullWidth
            style={{ marginTop: theme.spacing.md }}
          />
        </Card>
      ) : null}
    </Screen>
  );
}
