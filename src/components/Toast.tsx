import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

type ToastTone = 'success' | 'danger' | 'info';

type ToastItem = {
  id: number;
  message: string;
  tone: ToastTone;
};

type Ctx = {
  show: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<Ctx | undefined>(undefined);

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const show = useCallback((message: string, tone: ToastTone = 'info') => {
    const id = nextId++;
    setToasts((cur) => [...cur, { id, message, tone }]);
    setTimeout(() => {
      setToasts((cur) => cur.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <ToastHost toasts={toasts} onDismiss={(id) => setToasts((c) => c.filter((t) => t.id !== id))} />
    </ToastContext.Provider>
  );
}

function ToastHost({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: number) => void }) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  if (toasts.length === 0) return null;
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 16,
        right: 16,
        top: insets.top + 8,
        gap: 8,
      }}
    >
      {toasts.map((t) => (
        <ToastView key={t.id} item={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </View>
  );
}

function ToastView({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(-12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(translate, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [opacity, translate]);

  const palette = (() => {
    switch (item.tone) {
      case 'success':
        return { bg: theme.colors.success, fg: '#fff', icon: 'checkmark-circle' as const };
      case 'danger':
        return { bg: theme.colors.danger, fg: '#fff', icon: 'close-circle' as const };
      default:
        return { bg: theme.colors.bgElevated, fg: theme.colors.text, icon: 'information-circle' as const };
    }
  })();

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY: translate }],
        backgroundColor: palette.bg,
        borderRadius: theme.radius.md,
        paddingVertical: 12,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        ...theme.shadows.md,
        borderWidth: item.tone === 'info' ? 1 : 0,
        borderColor: theme.colors.border,
      }}
    >
      <Ionicons name={palette.icon} size={20} color={palette.fg} />
      <Pressable style={{ flex: 1 }} onPress={onDismiss} hitSlop={8}>
        <Text style={{ color: palette.fg, fontSize: theme.fontSize.sm, fontWeight: '500' }}>{item.message}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
