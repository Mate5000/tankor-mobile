import React, { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ErrorBanner } from '@/components/ErrorBanner';
import { useTheme } from '@/theme/ThemeProvider';
import { useT } from '@/i18n';
import { useAuthStore } from '@/store/auth';
import { useApiErrorMessage } from '@/hooks/useApiError';

const DEMO_ACCOUNTS = [
  { email: 'szuperadmin@demo.local', password: 'szuper123', role: 'SUPER_ADMIN' },
  { email: 'admin@demo.local', password: 'admin123', role: 'ADMIN' },
  { email: 'oktato1@demo.local', password: 'oktato123', role: 'INSTRUCTOR' },
  { email: 'diak1@demo.local', password: 'diak123', role: 'STUDENT' },
];

export default function LoginScreen() {
  const theme = useTheme();
  const t = useT();
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const getErr = useApiErrorMessage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setBusy(true);
    setError(null);
    try {
      await login(email.trim(), password);
      // navigation handled by root layout effect
    } catch (e) {
      setError(getErr(e));
    } finally {
      setBusy(false);
    }
  };

  const fillDemo = (acc: typeof DEMO_ACCOUNTS[number]) => {
    setEmail(acc.email);
    setPassword(acc.password);
  };

  return (
    <Screen keyboardAvoiding>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: theme.spacing['3xl'] }}
      >
        <View style={{ alignItems: 'center', marginBottom: theme.spacing['2xl'] }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 22,
              backgroundColor: theme.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: theme.spacing.lg,
              ...theme.shadows.md,
            }}
          >
            <Ionicons name="school" size={36} color="#fff" />
          </View>
          <Text variant="display" align="center">
            {t('login.title')}
          </Text>
          <Text variant="body" tone="muted" align="center" style={{ marginTop: theme.spacing.sm }}>
            {t('login.subtitle')}
          </Text>
        </View>

        <View style={{ gap: theme.spacing.md }}>
          <Input
            label={t('login.email')}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            editable={!busy}
            leftIcon={<Ionicons name="mail-outline" size={18} color={theme.colors.textMuted} />}
          />
          <Input
            label={t('login.password')}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry={!showPw}
            autoCapitalize="none"
            autoComplete="password"
            editable={!busy}
            leftIcon={<Ionicons name="lock-closed-outline" size={18} color={theme.colors.textMuted} />}
            rightIcon={<Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color={theme.colors.textMuted} />}
            onRightPress={() => setShowPw((v) => !v)}
          />

          {error ? <ErrorBanner message={error} /> : null}

          <Button
            title={busy ? t('login.submitting') : t('login.submit')}
            onPress={onSubmit}
            loading={busy}
            disabled={!email || !password}
            size="lg"
            fullWidth
            style={{ marginTop: theme.spacing.xs }}
          />

          <Pressable
            onPress={() => router.push('/(auth)/register')}
            style={{ paddingVertical: theme.spacing.sm, alignSelf: 'center' }}
          >
            <Text variant="bodyMedium" tone="primary">
              {t('login.useInvite')}
            </Text>
          </Pressable>
        </View>

        <Card style={{ marginTop: theme.spacing['2xl'] }} elevated>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm }}>
            <Ionicons name="information-circle-outline" size={18} color={theme.colors.primary} />
            <Text variant="label" tone="primary" style={{ marginLeft: 6 }}>
              {t('login.demoTitle')}
            </Text>
          </View>
          <Text variant="caption" tone="muted" style={{ marginBottom: theme.spacing.md }}>
            {t('login.demoHint')}
          </Text>
          <View style={{ gap: 6 }}>
            {DEMO_ACCOUNTS.map((acc) => (
              <Pressable
                key={acc.email}
                onPress={() => fillDemo(acc)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  backgroundColor: pressed ? theme.colors.surfaceHover : theme.colors.surfaceMuted,
                  borderRadius: theme.radius.sm,
                })}
              >
                <Text variant="caption" style={{ fontFamily: 'Courier' }}>
                  {acc.email}
                </Text>
                <Text variant="caption" tone="muted">{t(`role.${acc.role}`)}</Text>
              </Pressable>
            ))}
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}
