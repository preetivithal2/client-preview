// hooks/useAuth.ts
// React hook for Firebase Authentication state

'use client';

import { useState, useEffect } from 'react';
import { onAuthChange, User } from '../auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { user, loading };
}
