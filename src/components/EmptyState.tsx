import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

type Props = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function EmptyState({ icon = 'sparkles-outline', title, description, action }: Props) {
  const theme = useTheme();
  return (
    <View
      style={{
        paddingVertical: theme.spacing['3xl'],
        paddingHorizontal: theme.spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: theme.colors.surfaceMuted,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: theme.spacing.md,
        }}
      >
        <Ionicons name={icon} size={28} color={theme.colors.textMuted} />
      </View>
      <Text variant="title" align="center" style={{ marginBottom: 4 }}>{title}</Text>
      {description ? (
        <Text variant="body" tone="muted" align="center">
          {description}
        </Text>
      ) : null}
      {action ? <View style={{ marginTop: theme.spacing.lg }}>{action}</View> : null}
    </View>
  );
}
