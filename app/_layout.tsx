import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { I18nProvider } from '@/i18n';
import { ToastProvider } from '@/components/Toast';
import { useAuthStore } from '@/store/auth';
import { getCachedApiUrl, loadApiUrl } from '@/api/config';
import { Loading } from '@/components/Loading';

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

function RootInner() {
  const theme = useTheme();
  const router = useRouter();
  const segments = useSegments();
  const status = useAuthStore((s) => s.status);
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [hasApiUrl, setHasApiUrl] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const url = await loadApiUrl();
      setHasApiUrl(!!url);
      if (url) {
        await bootstrap();
      } else {
        useAuthStore.setState({ status: 'unauthenticated' });
      }
      setBootstrapped(true);
      SplashScreen.hideAsync().catch(() => {});
    })();
  }, [bootstrap]);

  useEffect(() => {
    if (!bootstrapped) return;
    const first = segments[0] as string | undefined;
    const inAuth = first === '(auth)';
    const inSetup = first === 'setup';
    // Read cached URL live — local state doesn't update after the setup screen
    // saves it, but the cached value does.
    const hasUrl = !!getCachedApiUrl();

    if (!hasUrl) {
      if (!inSetup) router.replace('/setup');
      return;
    }

    if (status === 'unauthenticated' && !inAuth) {
      router.replace('/(auth)/login');
    } else if (status === 'authenticated' && (inAuth || inSetup)) {
      router.replace('/(tabs)');
    }
  }, [status, bootstrapped, segments, router]);

  if (!bootstrapped) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Loading />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.bg },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="setup" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="courses/[id]" />
      <Stack.Screen name="assignments/[id]" />
      <Stack.Screen name="lessons/[id]/checkin" options={{ presentation: 'modal' }} />
      <Stack.Screen name="teach/index" />
      <Stack.Screen name="teach/[id]" />
      <Stack.Screen name="admin/users" />
      <Stack.Screen name="admin/invites" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <I18nProvider>
          <QueryClientProvider client={queryClient}>
            <ToastProvider>
              <RootInner />
            </ToastProvider>
          </QueryClientProvider>
        </I18nProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
