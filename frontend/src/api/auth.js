import apiClient from './client';

export const login = (payload) => apiClient.post('/auth/login', payload);
export const firebaseLogin = (idToken) => apiClient.post('/auth/firebase-login', { idToken });
export const fetchCurrentUser = () => apiClient.get('/auth/me');
