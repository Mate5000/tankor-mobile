import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
type Size = 'sm' | 'md';

type Props = {
  label: string;
  tone?: Tone;
  size?: Size;
  style?: ViewStyle;
};

export function Badge({ label, tone = 'neutral', size = 'sm', style }: Props) {
  const theme = useTheme();
  const palette = (() => {
    switch (tone) {
      case 'primary':
        return { bg: theme.colors.primarySoft, fg: theme.colors.primary };
      case 'success':
        return { bg: theme.colors.successSoft, fg: theme.colors.success };
      case 'warning':
        return { bg: theme.colors.warningSoft, fg: theme.colors.warning };
      case 'danger':
        return { bg: theme.colors.dangerSoft, fg: theme.colors.danger };
      case 'info':
        return { bg: theme.colors.infoSoft, fg: theme.colors.info };
      default:
        return { bg: theme.colors.surfaceMuted, fg: theme.colors.textMuted };
    }
  })();

  const padV = size === 'md' ? 6 : 3;
  const padH = size === 'md' ? 10 : 8;

  return (
    <View
      style={[
        {
          backgroundColor: palette.bg,
          paddingVertical: padV,
          paddingHorizontal: padH,
          borderRadius: theme.radius.full,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Text style={{ fontSize: size === 'md' ? 12 : 11, fontWeight: '600', color: palette.fg, letterSpacing: 0.3 }}>
        {label}
      </Text>
    </View>
  );
}
