import React from 'react';
import { Pressable, ActivityIndicator, View, StyleSheet, PressableProps, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type Props = Omit<PressableProps, 'children' | 'style'> & {
  title: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  haptic?: boolean;
};

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  fullWidth,
  leftIcon,
  rightIcon,
  style,
  onPress,
  haptic = true,
  ...rest
}: Props) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const sizing = {
    sm: { paddingV: 9, paddingH: 14, fontSize: theme.fontSize.sm, iconGap: 6 },
    md: { paddingV: 13, paddingH: 18, fontSize: theme.fontSize.base, iconGap: 8 },
    lg: { paddingV: 16, paddingH: 22, fontSize: theme.fontSize.md, iconGap: 10 },
  }[size];

  const palette = (() => {
    switch (variant) {
      case 'primary':
        return { bg: theme.colors.primary, bgPressed: theme.colors.primaryHover, text: '#fff', border: 'transparent' };
      case 'secondary':
        return {
          bg: theme.colors.surfaceMuted,
          bgPressed: theme.colors.surfaceHover,
          text: theme.colors.text,
          border: 'transparent',
        };
      case 'ghost':
        return { bg: 'transparent', bgPressed: theme.colors.surfaceMuted, text: theme.colors.primary, border: 'transparent' };
      case 'outline':
        return { bg: 'transparent', bgPressed: theme.colors.surfaceMuted, text: theme.colors.text, border: theme.colors.border };
      case 'danger':
        return { bg: theme.colors.danger, bgPressed: theme.colors.danger, text: '#fff', border: 'transparent' };
    }
  })();

  return (
    <Pressable
      {...rest}
      disabled={isDisabled}
      onPress={(e) => {
        if (haptic) Haptics.selectionAsync().catch(() => {});
        onPress?.(e);
      }}
      style={({ pressed }) => [
        {
          backgroundColor: pressed ? palette.bgPressed : palette.bg,
          borderColor: palette.border,
          borderWidth: variant === 'outline' ? StyleSheet.hairlineWidth * 2 : 0,
          borderRadius: theme.radius.md,
          paddingVertical: sizing.paddingV,
          paddingHorizontal: sizing.paddingH,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          opacity: isDisabled ? 0.55 : 1,
          alignSelf: fullWidth ? 'stretch' : 'auto',
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.text} size="small" />
      ) : (
        <>
          {leftIcon ? <View style={{ marginRight: sizing.iconGap }}>{leftIcon}</View> : null}
          <Text style={{ color: palette.text, fontSize: sizing.fontSize, fontWeight: '600' }}>{title}</Text>
          {rightIcon ? <View style={{ marginLeft: sizing.iconGap }}>{rightIcon}</View> : null}
        </>
      )}
    </Pressable>
  );
}
