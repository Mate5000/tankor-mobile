import React from 'react';
import { ActivityIndicator, View, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

type Props = {
  label?: string;
  size?: 'small' | 'large';
  style?: ViewStyle;
  inline?: boolean;
};

export function Loading({ label, size = 'small', style, inline }: Props) {
  const theme = useTheme();
  if (inline) {
    return (
      <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 8 }, style]}>
        <ActivityIndicator size={size} color={theme.colors.primary} />
        {label ? <Text variant="caption" tone="muted">{label}</Text> : null}
      </View>
    );
  }
  return (
    <View
      style={[
        { padding: theme.spacing['3xl'], alignItems: 'center', justifyContent: 'center', gap: 12 },
        style,
      ]}
    >
      <ActivityIndicator size={size} color={theme.colors.primary} />
      {label ? <Text variant="caption" tone="muted">{label}</Text> : null}
    </View>
  );
}
