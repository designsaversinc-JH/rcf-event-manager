import apiClient from './client';

export const getUsers = () =>
  apiClient.get('/users').then((response) => response.data);

export const createUser = (payload) =>
  apiClient.post('/users', payload).then((response) => response.data);

export const updateUserRole = (id, role) =>
  apiClient
    .patch(`/users/${id}/role`, { role })
    .then((response) => response.data);

export const updateUserStatus = (id, isActive) =>
  apiClient
    .patch(`/users/${id}/status`, { isActive })
    .then((response) => response.data);

export const deleteUser = (id) =>
  apiClient.delete(`/users/${id}`).then((response) => response.data);
