import api from './api';

export const userRoles = [
  { value: "STUDENT", label: "Aluno" },
  { value: "MENTOR", label: "Mentor" },
  { value: "ADMIN", label: "Admin" },
];

export function normalizeUser(user = {}) {
  return {
    id: user.id,
    name: user.name || "Usuário",
    email: user.email || "",
    role: user.role || "STUDENT",
    isBlocked: Boolean(user.isBlocked),
    status: user.isBlocked ? "Bloqueado" : "Ativo",
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export const listUsers = async () => {
  const { data } = await api.get('/users');
  return (Array.isArray(data) ? data : []).map(normalizeUser);
};

export const createUser = async (payload) => (await api.post('/users', payload)).data;
export const updateUser = async (id, payload) => (await api.put(`/users/${id}`, payload)).data;
export const deleteUser = async (id) => (await api.delete(`/users/${id}`)).data;

export function getRoleLabel(role) {
  return userRoles.find((item) => item.value === role)?.label || role;
}

export function getErrorMessage(error) {
  return error.response?.data?.message || error.message || 'Não foi possível concluir a operação.';
}
