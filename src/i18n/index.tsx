import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { messages, LocaleCode } from './messages';

const LOCALE_KEY = 'verseny.locale';

type I18nContextValue = {
  locale: LocaleCode;
  setLocale: (l: LocaleCode) => Promise<void>;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function detectInitialLocale(): LocaleCode {
  try {
    const code = Localization.getLocales()[0]?.languageCode || 'hu';
    if (code.toLowerCase().startsWith('hu')) return 'HU';
  } catch {
    /* ignore */
  }
  return 'EN';
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(detectInitialLocale());

  useEffect(() => {
    AsyncStorage.getItem(LOCALE_KEY).then((v) => {
      if (v === 'HU' || v === 'EN') setLocaleState(v);
    });
  }, []);

  const setLocale = useCallback(async (l: LocaleCode) => {
    setLocaleState(l);
    await AsyncStorage.setItem(LOCALE_KEY, l);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const dict = messages[locale];
      const raw = dict[key];
      if (!raw) return key;
      return interpolate(raw, vars);
    },
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export function useT() {
  return useI18n().t;
}
