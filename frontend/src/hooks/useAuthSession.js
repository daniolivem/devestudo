import { useEffect, useState } from 'react';
import api from '../services/api';

export function useAuthSession() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const request = window.setTimeout(async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        if (active) setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        if (active) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(request);
    };
  }, []);

  return { user, loading };
}
