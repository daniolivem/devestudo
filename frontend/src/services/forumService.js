import api from './api';

export const forumTags = [
  'Python', 'React', 'Java', 'JavaScript', 'Node.js', 'TypeScript', 'Angular', 'Vue',
  'PHP', 'Ruby', 'Go', 'Rust', 'PostgreSQL', 'Django',
];

const dataOf = (response) => response.data;
export const listForumTags = async () => (await api.get('/categories')).data.map((tag) => tag.name);
export const listTopics = async (params = {}) => dataOf(await api.get('/threads', { params }));
export const getTopicDetails = async (id) => dataOf(await api.get(`/threads/${id}`));
export const createTopic = async (payload) => dataOf(await api.post('/threads', payload));
export const updateTopic = async (id, payload) => dataOf(await api.patch(`/threads/${id}`, payload));
export const deleteTopic = async (id) => dataOf(await api.delete(`/threads/${id}`));
export const createReply = async (threadId, content) => dataOf(await api.post(`/threads/${threadId}/replies`, { content }));
export const deleteReply = async (id) => dataOf(await api.delete(`/replies/${id}`));
export const voteOnThread = async (id) => dataOf(await api.put(`/threads/${id}/vote`));
export const removeThreadVote = async (id) => dataOf(await api.delete(`/threads/${id}/vote`));
export const voteOnReply = async (id) => dataOf(await api.put(`/replies/${id}/vote`));
export const removeReplyVote = async (id) => dataOf(await api.delete(`/replies/${id}/vote`));

export function getErrorMessage(error) {
  return error.response?.data?.message || error.message || 'Não foi possível concluir a operação.';
}
