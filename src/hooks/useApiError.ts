import { ApiClientError } from '@/api/client';
import { useT } from '@/i18n';

export function useApiErrorMessage() {
  const t = useT();
  return (err: unknown): string => {
    if (err instanceof ApiClientError) {
      const key = `error.${err.code}`;
      const translated = t(key);
      if (translated !== key) return translated;
      return err.message;
    }
    if (err instanceof Error && err.message === 'API_URL_NOT_CONFIGURED') {
      return t('error.API_URL_NOT_CONFIGURED');
    }
    if (err instanceof Error) {
      if (err.message.toLowerCase().includes('network') || err.message.includes('Failed to fetch')) {
        return t('error.NETWORK');
      }
      return err.message;
    }
    return t('error.INTERNAL');
  };
}
