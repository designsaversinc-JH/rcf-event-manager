import apiClient from './client';

export const getCategories = () =>
  apiClient.get('/categories').then((response) => response.data);

export const createCategory = (payload) =>
  apiClient.post('/categories', payload).then((response) => response.data);

export const updateCategory = (id, payload) =>
  apiClient.put(`/categories/${id}`, payload).then((response) => response.data);

export const deleteCategory = (id) =>
  apiClient.delete(`/categories/${id}`).then((response) => response.data);
