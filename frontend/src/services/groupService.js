import api from './api';

export const GROUP_LEVELS = ['Iniciante', 'Intermediário', 'Avançado'];
export const GROUP_AVAILABILITIES = [
  'Seg-Sex manhã',
  'Seg-Sex tarde',
  'Seg-Sex noite',
  'Fim de semana',
  'Flexível',
];

export function normalizeGroup(group = {}) {
  const approvedMembers = Array.isArray(group.members)
    ? group.members.filter((member) => member.status === 'APPROVED')
    : [];

  return {
    id: group.id,
    title: group.name || '',
    description: group.description || '',
    technology: group.technology || '',
    level: group.level || '',
    availability: group.availability || '',
    materialsUrl: group.materialsUrl || '',
    status: group.status || 'ACTIVE',
    creatorId: group.creatorId || group.creator?.id || '',
    creator: group.creator || null,
    members: approvedMembers,
    membersCount: approvedMembers.length,
    tags: [group.technology, group.level].filter(Boolean),
    time: group.availability || 'A definir',
    createdByCurrentMentor: false,
  };
}

export const listGroups = async (params = {}) => {
  const { data } = await api.get('/groups', {
    params: Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
    ),
  });
  return data;
};

export const createGroup = async (payload) => (await api.post('/groups', payload)).data;
export const updateGroup = async (id, payload) => (await api.put(`/groups/${id}`, payload)).data;
export const deleteGroup = async (id) => (await api.delete(`/groups/${id}`)).data;

export const joinGroup = async (groupId) => (await api.post('/groups/participar', { groupId })).data;
export const leaveGroup = async (groupId) => (await api.post('/groups/leave', { groupId })).data;

export const approveGroupMember = async ({ groupId, memberId, status }) =>
  (await api.patch('/groups/aprovar', { groupId, memberId, status })).data;

export const removeGroupMember = async ({ groupId, memberId }) =>
  (await api.post('/groups/remove', { groupId, memberId })).data;

export function getErrorMessage(error) {
  return error.response?.data?.message || error.message || 'Não foi possível concluir a operação.';
}
