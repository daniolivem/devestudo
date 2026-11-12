import { useCallback, useEffect, useState } from 'react';
import * as mentorshipService from '../services/mentorshipService';

export function useMentors({ technology = '' } = {}) {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      setMentors(await mentorshipService.listMentors(technology));
    } catch (err) {
      setError(mentorshipService.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [technology]);

  useEffect(() => {
    const request = window.setTimeout(() => {
      refresh();
    }, 0);

    return () => window.clearTimeout(request);
  }, [refresh]);

  return { mentors, loading, error, refresh };
}
