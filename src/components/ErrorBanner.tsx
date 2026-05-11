import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

type Props = {
  message: string;
  tone?: 'danger' | 'warning' | 'info';
  style?: ViewStyle;
};

export function ErrorBanner({ message, tone = 'danger', style }: Props) {
  const theme = useTheme();
  const palette = (() => {
    switch (tone) {
      case 'warning':
        return { bg: theme.colors.warningSoft, fg: theme.colors.warning, icon: 'alert-circle-outline' as const };
      case 'info':
        return { bg: theme.colors.infoSoft, fg: theme.colors.info, icon: 'information-circle-outline' as const };
      default:
        return { bg: theme.colors.dangerSoft, fg: theme.colors.danger, icon: 'close-circle-outline' as const };
    }
  })();

  return (
    <View
      style={[
        {
          backgroundColor: palette.bg,
          borderRadius: theme.radius.md,
          padding: 12,
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 10,
        },
        style,
      ]}
    >
      <Ionicons name={palette.icon} size={18} color={palette.fg} style={{ marginTop: 1 }} />
      <Text style={{ flex: 1, color: palette.fg, fontSize: theme.fontSize.sm, fontWeight: '500' }}>{message}</Text>
    </View>
  );
}
