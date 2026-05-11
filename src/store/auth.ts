import { create } from 'zustand';
import type { AuthSession, User } from '@/types/api';
import {
  loginRequest,
  logoutRequest,
  acceptInviteRequest,
  restoreSession,
  setAccessToken,
  registerUnauthorizedHandler,
  registerTokenChangeHandler,
  api,
} from '@/api/client';

type Status = 'unknown' | 'loading' | 'unauthenticated' | 'authenticated';

type AuthState = {
  status: Status;
  user: User | null;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  acceptInvite: (token: string, name: string, password: string, locale: 'HU' | 'EN') => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  setUser: (u: User) => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'unknown',
  user: null,

  bootstrap: async () => {
    set({ status: 'loading' });
    try {
      const session = await restoreSession();
      if (session) {
        set({ status: 'authenticated', user: session.user });
      } else {
        set({ status: 'unauthenticated', user: null });
      }
    } catch {
      set({ status: 'unauthenticated', user: null });
    }
  },

  login: async (email, password) => {
    const session = await loginRequest(email, password);
    set({ status: 'authenticated', user: session.user });
  },

  acceptInvite: async (token, name, password, locale) => {
    const session = await acceptInviteRequest({ token, name, password, locale });
    set({ status: 'authenticated', user: session.user });
  },

  logout: async () => {
    await logoutRequest();
    set({ status: 'unauthenticated', user: null });
  },

  refreshMe: async () => {
    try {
      const me = await api<User>('/me');
      set({ user: me });
    } catch {
      /* swallow */
    }
  },

  setUser: (u) => set({ user: u }),
}));

// Wire api-client → store
registerUnauthorizedHandler(() => {
  setAccessToken(null);
  useAuthStore.setState({ status: 'unauthenticated', user: null });
});

registerTokenChangeHandler((session: AuthSession | null) => {
  if (session) useAuthStore.setState({ user: session.user, status: 'authenticated' });
});
