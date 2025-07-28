
'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';

export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('user-session');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to parse user session from storage", e);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
    
    const handleStorageChange = () => {
        try {
            const storedUser = sessionStorage.getItem('user-session');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            } else {
                setUser(null);
            }
        } catch (e) {
            console.error("Failed to parse user session from storage on update", e);
            setUser(null);
        }
    };

    window.addEventListener('storage', handleStorageChange);
    // Custom event to handle changes in the same tab
    window.addEventListener('session-changed', handleStorageChange);
    
    return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('session-changed', handleStorageChange);
    };

  }, []);

  return { user, isLoading };
}
