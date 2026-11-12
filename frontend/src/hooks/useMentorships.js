import { useCallback, useEffect, useState } from 'react';
import * as mentorshipService from '../services/mentorshipService';

export function useMentorships() {
  const [mentorships, setMentorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      setMentorships(await mentorshipService.listMentorships());
    } catch (err) {
      setError(mentorshipService.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const request = window.setTimeout(() => {
      refresh();
    }, 0);

    return () => window.clearTimeout(request);
  }, [refresh]);

  async function runAction(action, successText) {
    setActionLoading(true);
    setActionError('');
    setSuccessMessage('');

    try {
      const result = await action();
      await refresh();
      if (successText) setSuccessMessage(successText);
      return result;
    } catch (err) {
      setActionError(mentorshipService.getErrorMessage(err));
      throw err;
    } finally {
      setActionLoading(false);
    }
  }

  function requestMentorship(mentorId, message) {
    return runAction(
      () => mentorshipService.createMentorship({ mentorId, message }),
      'Solicitação de mentoria enviada com sucesso.',
    );
  }

  function evaluateMentorship(mentorshipId, payload) {
    return runAction(
      () => mentorshipService.evaluateMentorship(mentorshipId, payload),
      'Mentoria avaliada com sucesso.',
    );
  }

  function updateMentorshipStatus(mentorshipId, status) {
    const label = status === 'APPROVED' ? 'aprovada' : 'cancelada';
    return runAction(
      () => mentorshipService.updateMentorshipStatus(mentorshipId, status),
      `Mentoria ${label} com sucesso.`,
    );
  }

  function clearMessages() {
    setActionError('');
    setSuccessMessage('');
  }

  return {
    mentorships,
    loading,
    error,
    actionLoading,
    actionError,
    successMessage,
    refresh,
    requestMentorship,
    evaluateMentorship,
    updateMentorshipStatus,
    clearMessages,
  };
}
