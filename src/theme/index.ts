// Design tokens — keep all visual constants here so screens stay declarative.
// Colors loosely match the web app's palette (blue primary, dark slate surfaces)
// but tuned for mobile: deeper surfaces, more contrast, softer accents.

export type ThemeMode = 'light' | 'dark';

const lightColors = {
  // Surfaces
  bg: '#F6F7FB',
  bgElevated: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceMuted: '#F2F4F8',
  surfaceHover: '#EAEDF2',

  // Text
  text: '#0B1220',
  textMuted: '#5B6478',
  textDim: '#8B93A7',
  textInverse: '#FFFFFF',

  // Border
  border: '#E3E6EE',
  borderStrong: '#CCD2DE',

  // Brand
  primary: '#3B82F6',
  primaryHover: '#2563EB',
  primarySoft: '#DBEAFE',
  primaryText: '#1E3A8A',

  // Semantic
  success: '#16A34A',
  successSoft: '#DCFCE7',
  warning: '#D97706',
  warningSoft: '#FEF3C7',
  danger: '#DC2626',
  dangerSoft: '#FEE2E2',
  info: '#0891B2',
  infoSoft: '#CFFAFE',

  // Misc
  overlay: 'rgba(11, 18, 32, 0.45)',
  shadow: '#0B1220',
};

const darkColors = {
  bg: '#0A0F1C',
  bgElevated: '#0F172A',
  surface: '#111827',
  surfaceMuted: '#0F172A',
  surfaceHover: '#1F2A3E',

  text: '#F1F5F9',
  textMuted: '#94A3B8',
  textDim: '#64748B',
  textInverse: '#0B1220',

  border: '#1F2A3E',
  borderStrong: '#2D3A52',

  primary: '#60A5FA',
  primaryHover: '#3B82F6',
  primarySoft: 'rgba(96, 165, 250, 0.15)',
  primaryText: '#BFDBFE',

  success: '#4ADE80',
  successSoft: 'rgba(74, 222, 128, 0.15)',
  warning: '#FBBF24',
  warningSoft: 'rgba(251, 191, 36, 0.15)',
  danger: '#F87171',
  dangerSoft: 'rgba(248, 113, 113, 0.15)',
  info: '#22D3EE',
  infoSoft: 'rgba(34, 211, 238, 0.15)',

  overlay: 'rgba(0, 0, 0, 0.6)',
  shadow: '#000000',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 56,
};

export const radius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 22,
  '2xl': 28,
  '3xl': 34,
  '4xl': 42,
};

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const shadows = {
  sm: {
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 8,
  },
};

export type Theme = {
  mode: ThemeMode;
  colors: typeof lightColors;
  spacing: typeof spacing;
  radius: typeof radius;
  fontSize: typeof fontSize;
  fontWeight: typeof fontWeight;
  shadows: typeof shadows;
};

export function makeTheme(mode: ThemeMode): Theme {
  return {
    mode,
    colors: mode === 'dark' ? darkColors : lightColors,
    spacing,
    radius,
    fontSize,
    fontWeight,
    shadows,
  };
}

export const lightTheme = makeTheme('light');
export const darkTheme = makeTheme('dark');
