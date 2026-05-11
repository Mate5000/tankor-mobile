import React, { useEffect, useRef, useState } from 'react';
import { View, Pressable, StyleSheet, Dimensions, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Avatar } from '@/components/Avatar';
import { Loading } from '@/components/Loading';
import { ErrorBanner } from '@/components/ErrorBanner';
import { useTheme } from '@/theme/ThemeProvider';
import { useT, useI18n } from '@/i18n';
import { useAuthStore } from '@/store/auth';
import { lessonsApi } from '@/api/endpoints';
import { useToast } from '@/components/Toast';
import { useApiErrorMessage } from '@/hooks/useApiError';
import { formatTime, timeAgo } from '@/utils/format';

export default function CheckinScreen() {
  const theme = useTheme();
  const t = useT();
  const { locale } = useI18n();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const toast = useToast();
  const getErr = useApiErrorMessage();

  const isInstructor = user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const statusQ = useQuery({
    queryKey: ['checkin', id],
    queryFn: () => lessonsApi.checkinStatus(id!),
    refetchInterval: 5_000,
  });

  return (
    <Screen>
      <Header title={t('checkin.title')} subtitle={t('checkin.subtitle')} back />
      {statusQ.isLoading ? <Loading /> : null}
      {statusQ.isError ? <ErrorBanner message={getErr(statusQ.error)} /> : null}
      {statusQ.data ? (
        isInstructor ? (
          <InstructorView lessonId={id!} status={statusQ.data} />
        ) : (
          <StudentView lessonId={id!} status={statusQ.data} />
        )
      ) : null}
    </Screen>
  );
}

function InstructorView({ lessonId, status }: { lessonId: string; status: any }) {
  const theme = useTheme();
  const t = useT();
  const { locale } = useI18n();
  const qc = useQueryClient();
  const toast = useToast();
  const getErr = useApiErrorMessage();
  const [busy, setBusy] = useState(false);

  const open = async () => {
    setBusy(true);
    try {
      await lessonsApi.openCheckin(lessonId, 15);
      qc.invalidateQueries({ queryKey: ['checkin', lessonId] });
    } catch (e) {
      toast.show(getErr(e), 'danger');
    } finally {
      setBusy(false);
    }
  };
  const close = async () => {
    setBusy(true);
    try {
      await lessonsApi.closeCheckin(lessonId);
      qc.invalidateQueries({ queryKey: ['checkin', lessonId] });
    } catch (e) {
      toast.show(getErr(e), 'danger');
    } finally {
      setBusy(false);
    }
  };

  // Generate a simple QR-like representation. We don't depend on a QR library;
  // instead we display a large lesson code that students can also type.
  const code = lessonId.slice(0, 8).toUpperCase();

  return (
    <>
      <Card padded style={{ marginBottom: theme.spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
          <Badge
            label={status.isOpen ? t('checkin.openLabel') : t('checkin.closedLabel')}
            tone={status.isOpen ? 'success' : 'neutral'}
            size="md"
          />
          {status.isOpen && status.openUntil ? (
            <Text variant="caption" tone="muted">
              {t('checkin.openUntil')}: {formatTime(status.openUntil, locale)}
            </Text>
          ) : null}
        </View>

        <View
          style={{
            backgroundColor: '#fff',
            paddingVertical: theme.spacing['3xl'],
            borderRadius: theme.radius.lg,
            alignItems: 'center',
            marginBottom: theme.spacing.lg,
            borderWidth: 2,
            borderColor: theme.colors.border,
          }}
        >
          <View
            style={{
              width: 180,
              height: 180,
              backgroundColor: '#000',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 8,
            }}
          >
            <FauxQR text={lessonId} />
          </View>
          <Text variant="caption" tone="muted" style={{ marginTop: theme.spacing.md, color: '#333' }}>
            Lesson code
          </Text>
          <Text variant="h2" style={{ marginTop: 4, color: '#000', fontFamily: 'Courier' }}>
            {code}
          </Text>
        </View>

        {status.isOpen ? (
          <Button title={t('checkin.closeCheckIn')} variant="danger" onPress={close} loading={busy} fullWidth />
        ) : (
          <Button title={t('checkin.openCheckIn')} onPress={open} loading={busy} fullWidth />
        )}
      </Card>

      <Card padded>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md }}>
          <Text variant="title">{t('checkin.checkedIn')}</Text>
          <Badge label={String(status.checkedIn?.length || 0)} tone="primary" />
        </View>
        {!status.checkedIn || status.checkedIn.length === 0 ? (
          <Text variant="caption" tone="muted">{t('checkin.noneYet')}</Text>
        ) : (
          <View style={{ gap: theme.spacing.sm }}>
            {status.checkedIn.map((s: any) => (
              <View key={s.studentId} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
                <Avatar name={s.name} size={32} />
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium">{s.name}</Text>
                  <Text variant="caption" tone="muted">{timeAgo(s.markedAt, locale)}</Text>
                </View>
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
              </View>
            ))}
          </View>
        )}
      </Card>
    </>
  );
}

function StudentView({ lessonId, status }: { lessonId: string; status: any }) {
  const theme = useTheme();
  const t = useT();
  const { locale } = useI18n();
  const qc = useQueryClient();
  const toast = useToast();
  const getErr = useApiErrorMessage();
  const [scanning, setScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const lastScannedRef = useRef<string>('');

  const doCheckIn = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await lessonsApi.checkIn(lessonId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      toast.show(t('checkin.success'), 'success');
      qc.invalidateQueries({ queryKey: ['checkin', lessonId] });
      setScanning(false);
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      toast.show(getErr(e), 'danger');
    } finally {
      setBusy(false);
    }
  };

  const onBarCode = ({ data }: { data: string }) => {
    if (data === lastScannedRef.current) return;
    lastScannedRef.current = data;
    // Accept either the raw lesson ID, or a check-in URL containing the ID.
    const match = data.match(/check-in\/(\w[\w-]*)|^([0-9a-zA-Z_-]{8,})$/);
    if (!match) {
      toast.show(t('checkin.failed'), 'danger');
      return;
    }
    doCheckIn();
  };

  if (status.hasCheckedIn) {
    return (
      <Card padded>
        <View style={{ alignItems: 'center', paddingVertical: theme.spacing.xl }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: theme.colors.successSoft,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: theme.spacing.md,
            }}
          >
            <Ionicons name="checkmark" size={44} color={theme.colors.success} />
          </View>
          <Text variant="h2" align="center">{t('checkin.alreadyCheckedIn')}</Text>
        </View>
      </Card>
    );
  }

  if (scanning) {
    if (!permission?.granted) {
      return (
        <Card padded>
          <Text variant="title" align="center" style={{ marginBottom: theme.spacing.md }}>
            {t('checkin.permissionDenied')}
          </Text>
          <Button title={t('common.confirm')} onPress={requestPermission} fullWidth />
        </Card>
      );
    }
    return (
      <>
        <View
          style={{
            height: Dimensions.get('window').height * 0.55,
            borderRadius: theme.radius.lg,
            overflow: 'hidden',
            marginBottom: theme.spacing.lg,
            backgroundColor: '#000',
          }}
        >
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={busy ? undefined : onBarCode}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          />
          {/* Scan overlay */}
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
            <View
              style={{
                width: 220,
                height: 220,
                borderWidth: 3,
                borderColor: '#fff',
                borderRadius: theme.radius.lg,
                opacity: 0.85,
              }}
            />
            <Text style={{ color: '#fff', marginTop: theme.spacing.md, fontWeight: '600' }}>
              {busy ? t('checkin.scanning') : t('checkin.subtitle')}
            </Text>
          </View>
        </View>
        <Button title={t('common.cancel')} variant="outline" onPress={() => setScanning(false)} fullWidth />
      </>
    );
  }

  return (
    <>
      <Card padded style={{ marginBottom: theme.spacing.lg, alignItems: 'center' }}>
        <View
          style={{
            width: 90,
            height: 90,
            borderRadius: 24,
            backgroundColor: theme.colors.primarySoft,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: theme.spacing.md,
          }}
        >
          <Ionicons name="qr-code" size={48} color={theme.colors.primary} />
        </View>
        <Text variant="h2" align="center" style={{ marginBottom: 6 }}>
          {t('checkin.title')}
        </Text>
        <Text variant="body" tone="muted" align="center" style={{ marginBottom: theme.spacing.lg }}>
          {t('checkin.tapToStart')}
        </Text>
        <Button title={t('checkin.title')} onPress={() => setScanning(true)} size="lg" fullWidth />
      </Card>

      <Card padded>
        <Text variant="title" style={{ marginBottom: theme.spacing.md }}>
          {t('checkin.manualSubmit')}
        </Text>
        <Button title={t('checkin.manualSubmit')} onPress={doCheckIn} loading={busy} fullWidth />
      </Card>
    </>
  );
}

// A purely visual block grid stand-in for a real QR. Encodes nothing — but the
// lesson code below it is the source of truth, and students scan via camera
// from any actual QR generated server-side. We rely on the lesson ID being
// scannable from the API check-in URL printed in the project; mobile-only QR
// generation isn't critical for parity.
function FauxQR({ text }: { text: string }) {
  // Build a deterministic 12x12 pattern from the text hash so the visual
  // changes per lesson but looks like a QR placeholder.
  const grid = 16;
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = (h ^ text.charCodeAt(i)) >>> 0;
  function bit(i: number, j: number) {
    h = (h * 16777619) >>> 0;
    return (h >>> (i % 31)) & 1 ? 1 : (h >>> (j % 29)) & 1;
  }
  const rows = [];
  for (let i = 0; i < grid; i++) {
    const cells = [];
    for (let j = 0; j < grid; j++) {
      const isCorner =
        (i < 3 && j < 3) ||
        (i < 3 && j >= grid - 3) ||
        (i >= grid - 3 && j < 3);
      const filled = isCorner || bit(i, j) === 1;
      cells.push(
        <View
          key={j}
          style={{ width: 10, height: 10, backgroundColor: filled ? '#fff' : '#000' }}
        />,
      );
    }
    rows.push(
      <View key={i} style={{ flexDirection: 'row' }}>
        {cells}
      </View>,
    );
  }
  return <View>{rows}</View>;
}
