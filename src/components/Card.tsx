import React from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  padded?: boolean;
  elevated?: boolean;
  bordered?: boolean;
};

export function Card({ children, onPress, style, padded = true, elevated = false, bordered = true }: Props) {
  const theme = useTheme();
  const cardStyle: ViewStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: bordered ? 1 : 0,
    borderColor: theme.colors.border,
    padding: padded ? theme.spacing.lg : 0,
    ...(elevated ? theme.shadows.sm : {}),
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          cardStyle,
          { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.997 : 1 }] },
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[cardStyle, style]}>{children}</View>;
}
