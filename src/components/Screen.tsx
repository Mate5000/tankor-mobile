import React from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, ViewStyle, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  padded?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  contentStyle?: ViewStyle;
  keyboardAvoiding?: boolean;
  background?: 'default' | 'elevated';
};

export function Screen({
  children,
  scroll = true,
  refreshing,
  onRefresh,
  padded = true,
  edges = ['top'],
  contentStyle,
  keyboardAvoiding = false,
  background = 'default',
}: Props) {
  const theme = useTheme();
  const bg = background === 'elevated' ? theme.colors.bgElevated : theme.colors.bg;
  const containerStyle = { flex: 1, backgroundColor: bg };
  const innerStyle: ViewStyle = {
    flex: 1,
    paddingHorizontal: padded ? theme.spacing.xl : 0,
  };

  const content = scroll ? (
    <ScrollView
      style={innerStyle}
      contentContainerStyle={[{ paddingBottom: theme.spacing['4xl'], paddingTop: theme.spacing.sm }, contentStyle]}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[innerStyle, contentStyle]}>{children}</View>
  );

  const body = keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
    >
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  );

  return (
    <SafeAreaView edges={edges} style={containerStyle}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={bg} />
      {body}
    </SafeAreaView>
  );
}
