import apiClient from './client';

export const fetchLanding = () => apiClient.get('/public/landing');
export const fetchPublicBlog = (identifier) => apiClient.get(`/public/blogs/${identifier}`);
