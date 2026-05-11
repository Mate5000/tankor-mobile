import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

type Props = {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  style?: ViewStyle;
  tight?: boolean;
};

export function Section({ title, subtitle, action, children, style, tight }: Props) {
  const theme = useTheme();
  return (
    <View style={[{ marginBottom: tight ? theme.spacing.lg : theme.spacing['2xl'] }, style]}>
      {(title || action) && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: theme.spacing.sm,
            paddingHorizontal: 2,
          }}
        >
          <View style={{ flex: 1 }}>
            {title ? <Text variant="title">{title}</Text> : null}
            {subtitle ? (
              <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          {action ? <View>{action}</View> : null}
        </View>
      )}
      {children}
    </View>
  );
}
