import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns';
import { hu, enUS } from 'date-fns/locale';
import type { LocaleCode } from '@/i18n/messages';

function loc(code: LocaleCode) {
  return code === 'HU' ? hu : enUS;
}

export function formatDate(iso: string | Date, code: LocaleCode = 'HU') {
  const d = typeof iso === 'string' ? parseISO(iso) : iso;
  return format(d, code === 'HU' ? 'yyyy. MMM d.' : 'MMM d, yyyy', { locale: loc(code) });
}

export function formatTime(iso: string | Date, code: LocaleCode = 'HU') {
  const d = typeof iso === 'string' ? parseISO(iso) : iso;
  return format(d, 'HH:mm', { locale: loc(code) });
}

export function formatDateTime(iso: string | Date, code: LocaleCode = 'HU') {
  const d = typeof iso === 'string' ? parseISO(iso) : iso;
  return format(d, code === 'HU' ? 'yyyy. MMM d. HH:mm' : 'MMM d, yyyy HH:mm', { locale: loc(code) });
}

export function formatRelativeDay(iso: string | Date, code: LocaleCode = 'HU') {
  const d = typeof iso === 'string' ? parseISO(iso) : iso;
  if (isToday(d)) return code === 'HU' ? 'Ma' : 'Today';
  if (isTomorrow(d)) return code === 'HU' ? 'Holnap' : 'Tomorrow';
  if (isYesterday(d)) return code === 'HU' ? 'Tegnap' : 'Yesterday';
  return format(d, code === 'HU' ? 'EEE, MMM d' : 'EEE, MMM d', { locale: loc(code) });
}

export function formatTimeRange(startIso: string, endIso: string, code: LocaleCode = 'HU') {
  return `${formatTime(startIso, code)} – ${formatTime(endIso, code)}`;
}

export function timeAgo(iso: string | Date, code: LocaleCode = 'HU') {
  const d = typeof iso === 'string' ? parseISO(iso) : iso;
  return formatDistanceToNow(d, { addSuffix: true, locale: loc(code) });
}

export function pluralizeCount(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
