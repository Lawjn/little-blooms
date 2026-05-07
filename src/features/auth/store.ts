import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  isInitializing: boolean;
  setSession: (session: Session | null) => void;
  setInitializing: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isInitializing: true,
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setInitializing: (isInitializing) => set({ isInitializing }),
}));

export const useUser = () => useAuthStore((state) => state.user);
export const useSession = () => useAuthStore((state) => state.session);
export const useIsAuthenticated = () => useAuthStore((state) => state.session !== null);
export const useIsInitializing = () => useAuthStore((state) => state.isInitializing);
