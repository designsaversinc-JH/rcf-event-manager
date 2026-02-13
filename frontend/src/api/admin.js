import apiClient from './client';

export const fetchDashboard = () => apiClient.get('/admin/dashboard');

export const fetchAdminBlogs = () => apiClient.get('/admin/blogs');
export const fetchAdminBlog = (id) => apiClient.get(`/admin/blogs/${id}`);
export const createBlog = (payload) => apiClient.post('/admin/blogs', payload);
export const updateBlog = (id, payload) => apiClient.put(`/admin/blogs/${id}`, payload);
export const deleteBlog = (id) => apiClient.delete(`/admin/blogs/${id}`);

export const fetchJobs = () => apiClient.get('/admin/jobs');
export const createJob = (payload) => apiClient.post('/admin/jobs', payload);
export const updateJob = (id, payload) => apiClient.put(`/admin/jobs/${id}`, payload);
export const deleteJob = (id) => apiClient.delete(`/admin/jobs/${id}`);

export const fetchCategories = () => apiClient.get('/admin/categories');
export const createCategory = (payload) => apiClient.post('/admin/categories', payload);
export const updateCategory = (id, payload) => apiClient.put(`/admin/categories/${id}`, payload);
export const deleteCategory = (id) => apiClient.delete(`/admin/categories/${id}`);

export const fetchTags = () => apiClient.get('/admin/tags');
export const createTag = (payload) => apiClient.post('/admin/tags', payload);
export const deleteTag = (id) => apiClient.delete(`/admin/tags/${id}`);

export const fetchNavigation = () => apiClient.get('/admin/navigation');
export const saveNavigation = (items) => apiClient.put('/admin/navigation', { items });

export const fetchSettings = () => apiClient.get('/admin/settings');
export const saveSettings = (payload) => apiClient.put('/admin/settings', payload);
