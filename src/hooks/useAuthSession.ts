import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type AuthSessionState =
  | { status: 'loading'; session: null }
  | { status: 'signed-out'; session: null }
  | { status: 'signed-in'; session: Session };

export function useAuthSession(): AuthSessionState {
  const [state, setState] = useState<AuthSessionState>({ status: 'loading', session: null });

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setState(data.session ? { status: 'signed-in', session: data.session } : { status: 'signed-out', session: null });
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setState(session ? { status: 'signed-in', session } : { status: 'signed-out', session: null });
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return state;
}
