import React from 'react';
import { View, Pressable } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
};

export function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: theme.colors.surfaceMuted,
        borderRadius: theme.radius.md,
        padding: 4,
        gap: 4,
      }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={{
              flex: 1,
              backgroundColor: active ? theme.colors.surface : 'transparent',
              borderRadius: theme.radius.sm,
              paddingVertical: 8,
              alignItems: 'center',
              ...(active ? theme.shadows.sm : {}),
            }}
          >
            <Text
              style={{
                color: active ? theme.colors.text : theme.colors.textMuted,
                fontWeight: '600',
                fontSize: theme.fontSize.sm,
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
