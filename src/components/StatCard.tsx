import React from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

type Props = {
  label: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  tone?: 'primary' | 'success' | 'warning' | 'info' | 'neutral';
  onPress?: () => void;
};

export function StatCard({ label, value, icon = 'analytics-outline', tone = 'primary', onPress }: Props) {
  const theme = useTheme();
  const palette = (() => {
    switch (tone) {
      case 'success':
        return { bg: theme.colors.successSoft, fg: theme.colors.success };
      case 'warning':
        return { bg: theme.colors.warningSoft, fg: theme.colors.warning };
      case 'info':
        return { bg: theme.colors.infoSoft, fg: theme.colors.info };
      case 'neutral':
        return { bg: theme.colors.surfaceMuted, fg: theme.colors.textMuted };
      default:
        return { bg: theme.colors.primarySoft, fg: theme.colors.primary };
    }
  })();

  const inner = (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        flex: 1,
        minHeight: 96,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: palette.bg,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        }}
      >
        <Ionicons name={icon} size={20} color={palette.fg} />
      </View>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
      <Text variant="h2" style={{ marginTop: 2 }}>
        {value}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.85 : 1 })}>
        {inner}
      </Pressable>
    );
  }
  return inner;
}
