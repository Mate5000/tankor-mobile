import React, { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { SegmentedControl } from '@/components/SegmentedControl';
import { ErrorBanner } from '@/components/ErrorBanner';
import { useTheme } from '@/theme/ThemeProvider';
import { useT } from '@/i18n';
import { useAuthStore } from '@/store/auth';
import { useApiErrorMessage } from '@/hooks/useApiError';
import { Header } from '@/components/Header';

export default function RegisterScreen() {
  const theme = useTheme();
  const t = useT();
  const params = useLocalSearchParams<{ token?: string }>();
  const acceptInvite = useAuthStore((s) => s.acceptInvite);
  const getErr = useApiErrorMessage();
  const [token, setToken] = useState(params.token || '');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [locale, setLocale] = useState<'HU' | 'EN'>('HU');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setBusy(true);
    setError(null);
    try {
      await acceptInvite(token.trim(), name.trim(), password, locale);
    } catch (e) {
      setError(getErr(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen keyboardAvoiding>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingVertical: theme.spacing.lg }}>
        <Header title={t('register.title')} subtitle={t('register.subtitle')} back />

        <View style={{ gap: theme.spacing.md }}>
          <Input
            label={t('register.tokenLabel')}
            value={token}
            onChangeText={setToken}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!busy}
            leftIcon={<Ionicons name="ticket-outline" size={18} color={theme.colors.textMuted} />}
          />
          <Input
            label={t('register.name')}
            value={name}
            onChangeText={setName}
            placeholder="Kovács Anna"
            autoCapitalize="words"
            editable={!busy}
            leftIcon={<Ionicons name="person-outline" size={18} color={theme.colors.textMuted} />}
          />
          <Input
            label={t('register.password')}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry={!showPw}
            autoCapitalize="none"
            hint={t('register.passwordHint')}
            editable={!busy}
            leftIcon={<Ionicons name="lock-closed-outline" size={18} color={theme.colors.textMuted} />}
            rightIcon={<Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color={theme.colors.textMuted} />}
            onRightPress={() => setShowPw((v) => !v)}
          />

          <View>
            <Text variant="label" tone="muted" style={{ marginBottom: 6 }}>
              {t('register.locale')}
            </Text>
            <SegmentedControl
              options={[
                { value: 'HU', label: 'Magyar' },
                { value: 'EN', label: 'English' },
              ]}
              value={locale}
              onChange={setLocale}
            />
          </View>

          {error ? <ErrorBanner message={error} /> : null}

          <Button
            title={t('register.submit')}
            onPress={onSubmit}
            loading={busy}
            disabled={!token || !name || password.length < 8}
            size="lg"
            fullWidth
            style={{ marginTop: theme.spacing.sm }}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
