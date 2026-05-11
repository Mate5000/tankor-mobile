import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { ErrorBanner } from '@/components/ErrorBanner';
import { useTheme } from '@/theme/ThemeProvider';
import { useT } from '@/i18n';
import { loadApiUrl, saveApiUrl, probeApiUrl } from '@/api/config';
import { useToast } from '@/components/Toast';
import { useAuthStore } from '@/store/auth';

export default function SetupScreen() {
  const theme = useTheme();
  const t = useT();
  const router = useRouter();
  const toast = useToast();
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bootstrap = useAuthStore((s) => s.bootstrap);

  useEffect(() => {
    loadApiUrl().then((v) => {
      if (v) setUrl(v);
      else setUrl('http://');
    });
  }, []);

  const onConnect = async () => {
    setBusy(true);
    setError(null);
    const result = await probeApiUrl(url);
    if (!result.ok) {
      setError(result.error || 'Unknown error');
      setBusy(false);
      return;
    }
    await saveApiUrl(url);
    toast.show(t('setup.success'), 'success');
    // Re-bootstrap auth — there might be a stored refresh token from before.
    await bootstrap();
    setBusy(false);
    router.replace('/(auth)/login');
  };

  return (
    <Screen padded keyboardAvoiding>
      <View style={{ flex: 1, justifyContent: 'center', gap: theme.spacing.xl }}>
        <View style={{ alignItems: 'center', marginBottom: theme.spacing.lg }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              backgroundColor: theme.colors.primarySoft,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: theme.spacing.lg,
            }}
          >
            <Ionicons name="server-outline" size={36} color={theme.colors.primary} />
          </View>
          <Text variant="display" align="center">
            {t('setup.title')}
          </Text>
          <Text variant="body" tone="muted" align="center" style={{ marginTop: theme.spacing.sm }}>
            {t('setup.subtitle')}
          </Text>
        </View>

        <Input
          label={t('setup.urlLabel')}
          placeholder={t('setup.urlPlaceholder')}
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          hint={t('setup.hint')}
          editable={!busy}
        />

        {error ? <ErrorBanner message={error} tone="danger" /> : null}

        <Button
          title={busy ? t('setup.testing') : t('setup.connect')}
          onPress={onConnect}
          loading={busy}
          fullWidth
          size="lg"
        />
      </View>
    </Screen>
  );
}
