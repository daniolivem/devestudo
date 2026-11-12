import { useCallback, useEffect, useState } from 'react';
import * as groupService from '../services/groupService';

export function useGroups({ technology = '', level = '', availability = '' } = {}) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await groupService.listGroups({ technology, level, availability });
      setGroups((Array.isArray(data) ? data : []).map(groupService.normalizeGroup));
    } catch (err) {
      setError(groupService.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [technology, level, availability]);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!active) return;
      await refresh();
    }

    load();

    return () => {
      active = false;
    };
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
      setActionError(groupService.getErrorMessage(err));
      throw err;
    } finally {
      setActionLoading(false);
    }
  }

  function createGroup(payload) {
    return runAction(() => groupService.createGroup(payload), 'Grupo criado com sucesso.');
  }

  function updateGroup(id, payload) {
    return runAction(() => groupService.updateGroup(id, payload), 'Grupo atualizado com sucesso.');
  }

  function deleteGroup(id) {
    return runAction(() => groupService.deleteGroup(id), 'Grupo removido com sucesso.');
  }

  function joinGroup(groupId) {
    return runAction(() => groupService.joinGroup(groupId), 'Solicitação de entrada enviada com sucesso.');
  }

  function leaveGroup(groupId) {
    return runAction(() => groupService.leaveGroup(groupId), 'Você saiu do grupo.');
  }

  return {
    groups,
    loading,
    error,
    actionLoading,
    actionError,
    successMessage,
    refresh,
    createGroup,
    updateGroup,
    deleteGroup,
    joinGroup,
    leaveGroup,
  };
}
