import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './store';

/**
 * Hook gọi 1 lần ở root layout: load session ban đầu từ AsyncStorage
 * và lắng nghe auth state changes (signin/signout/refresh).
 */
export function useAuthBootstrap() {
  const setSession = useAuthStore((state) => state.setSession);
  const setInitializing = useAuthStore((state) => state.setInitializing);

  useEffect(() => {
    let isMounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!isMounted) return;
        setSession(data.session);
      })
      .finally(() => {
        if (!isMounted) return;
        setInitializing(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setSession(session);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [setSession, setInitializing]);
}
