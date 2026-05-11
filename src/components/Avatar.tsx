import React from 'react';
import { View, Image, ImageStyle, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

type Props = {
  name?: string | null;
  url?: string | null;
  size?: number;
  style?: ViewStyle;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || '').join('');
}

function colorForName(name: string, palette: string[]): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

export function Avatar({ name, url, size = 40, style }: Props) {
  const theme = useTheme();
  const palette = [
    '#3B82F6',
    '#8B5CF6',
    '#EC4899',
    '#F59E0B',
    '#10B981',
    '#06B6D4',
    '#EF4444',
    '#F97316',
  ];
  const safeName = name || '?';
  const bg = colorForName(safeName, palette);

  if (url) {
    const imageStyle: ImageStyle = {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: theme.colors.surfaceMuted,
    };
    return <Image source={{ uri: url }} style={[imageStyle, style as ImageStyle]} />;
  }

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Text style={{ color: '#fff', fontSize: size * 0.4, fontWeight: '700' }}>{initials(safeName)}</Text>
    </View>
  );
}
