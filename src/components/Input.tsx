import React, { useState } from 'react';
import { TextInput, TextInputProps, View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

type Props = TextInputProps & {
  label?: string;
  hint?: string;
  error?: string;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightPress?: () => void;
};

export function Input({ label, hint, error, containerStyle, leftIcon, rightIcon, onRightPress, style, onFocus, onBlur, ...rest }: Props) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = error ? theme.colors.danger : focused ? theme.colors.primary : theme.colors.border;

  return (
    <View style={[{ width: '100%' }, containerStyle]}>
      {label ? (
        <Text variant="label" tone="muted" style={{ marginBottom: 6 }}>
          {label}
        </Text>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.md,
          paddingHorizontal: 12,
          minHeight: 48,
        }}
      >
        {leftIcon ? <View style={{ marginRight: 8 }}>{leftIcon}</View> : null}
        <TextInput
          {...rest}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          placeholderTextColor={theme.colors.textDim}
          style={[
            {
              flex: 1,
              color: theme.colors.text,
              fontSize: theme.fontSize.base,
              paddingVertical: 12,
            },
            style,
          ]}
        />
        {rightIcon ? (
          <Pressable onPress={onRightPress} hitSlop={8} style={{ marginLeft: 8 }}>
            {rightIcon}
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text variant="caption" tone="danger" style={{ marginTop: 6 }}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" tone="dim" style={{ marginTop: 6 }}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
