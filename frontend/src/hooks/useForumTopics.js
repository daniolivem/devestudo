import { useCallback, useEffect, useState } from 'react';
import * as forum from '../services/forumService';

export function useForumTopics({ search = '', tag = '', page = 1, limit = 10 } = {}) {
  const [topics, setTopics] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await forum.listTopics({ search: search || undefined, tag: tag || undefined, page, limit });
      setTopics(result.items || result.threads || result.data || []);
      setTotal(result.total ?? result.pagination?.total ?? (result.items || result.threads || result.data || []).length);
    } catch (err) {
      setError(forum.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, tag, page, limit]);

  useEffect(() => {
    const request = window.setTimeout(() => { refresh(); }, 0);
    return () => window.clearTimeout(request);
  }, [refresh]);

  async function createTopic(payload) { const created = await forum.createTopic(payload); await refresh(); return created; }
  async function updateTopic(id, payload) { const updated = await forum.updateTopic(id, payload); await refresh(); return updated; }
  async function deleteTopic(id) { const result = await forum.deleteTopic(id); await refresh(); return result; }
  async function upvoteTopic(id) { const result = await forum.voteOnThread(id); await refresh(); return result; }

  return { topics, total, loading, error, refresh, createTopic, updateTopic, deleteTopic, upvoteTopic };
}
