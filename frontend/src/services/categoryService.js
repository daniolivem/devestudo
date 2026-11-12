import api from './api';

export const listCategories = async () => {
  const { data } = await api.get('/categories');
  return Array.isArray(data) ? data : [];
};

export const createCategory = async (name) => (await api.post('/categories', { name })).data;
export const updateCategory = async (id, name) => (await api.put(`/categories/${id}`, { name })).data;
export const deleteCategory = async (id) => (await api.delete(`/categories/${id}`)).data;

export function getErrorMessage(error) {
  return error.response?.data?.message || error.message || 'Não foi possível concluir a operação.';
}
