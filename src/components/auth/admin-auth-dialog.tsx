'use client';

import { useState, useEffect } from 'react';
import type { IronSession } from 'iron-session';
import { SessionPayload } from '@/types';
import { getSessionData } from '@/lib/auth';


export function useSession() {
  const [session, setSession] = useState<IronSession<SessionPayload> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
        try {
            const sessionData = await getSessionData();
            setSession(sessionData);
        } catch (e) {
            console.error(e);
            setSession(null);
        } finally {
            setIsLoading(false);
        }
    }
    loadSession();
  }, []);

  return { session, isLoading };
}