import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import type { Theme } from '@/theme';

type Variant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'bodyMedium'
  | 'caption'
  | 'label'
  | 'mono';

type Tone = 'default' | 'muted' | 'dim' | 'primary' | 'inverse' | 'danger' | 'success' | 'warning';

type Props = TextProps & {
  variant?: Variant;
  tone?: Tone;
  weight?: '400' | '500' | '600' | '700' | '800';
  align?: 'left' | 'center' | 'right';
};

export function Text({ variant = 'body', tone = 'default', weight, align, style, ...rest }: Props) {
  const theme = useTheme();
  const base = stylesFor(theme, variant);
  const color = toneColor(theme, tone);
  return (
    <RNText
      {...rest}
      style={[
        base,
        { color },
        weight ? { fontWeight: weight } : null,
        align ? { textAlign: align } : null,
        style,
      ]}
    />
  );
}

function toneColor(theme: Theme, tone: Tone) {
  switch (tone) {
    case 'muted':
      return theme.colors.textMuted;
    case 'dim':
      return theme.colors.textDim;
    case 'primary':
      return theme.colors.primary;
    case 'inverse':
      return theme.colors.textInverse;
    case 'danger':
      return theme.colors.danger;
    case 'success':
      return theme.colors.success;
    case 'warning':
      return theme.colors.warning;
    default:
      return theme.colors.text;
  }
}

function stylesFor(theme: Theme, v: Variant) {
  const f = theme.fontSize;
  switch (v) {
    case 'display':
      return { fontSize: f['4xl'], fontWeight: '800' as const, letterSpacing: -1 };
    case 'h1':
      return { fontSize: f['3xl'], fontWeight: '800' as const, letterSpacing: -0.5 };
    case 'h2':
      return { fontSize: f['2xl'], fontWeight: '700' as const, letterSpacing: -0.3 };
    case 'h3':
      return { fontSize: f.xl, fontWeight: '700' as const };
    case 'title':
      return { fontSize: f.lg, fontWeight: '600' as const };
    case 'subtitle':
      return { fontSize: f.md, fontWeight: '500' as const };
    case 'body':
      return { fontSize: f.base, fontWeight: '400' as const, lineHeight: 22 };
    case 'bodyMedium':
      return { fontSize: f.base, fontWeight: '500' as const, lineHeight: 22 };
    case 'caption':
      return { fontSize: f.sm, fontWeight: '400' as const };
    case 'label':
      return { fontSize: f.sm, fontWeight: '600' as const, letterSpacing: 0.2 };
    case 'mono':
      return { fontSize: f.sm, fontWeight: '500' as const, fontFamily: 'Courier' };
    default:
      return {};
  }
}
