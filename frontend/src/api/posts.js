import apiClient from './client';

const buildPostFormData = (payload) => {
  const formData = new FormData();

  const fields = [
    'title',
    'excerpt',
    'content',
    'status',
    'publishedAt',
    'coverImageUrl',
  ];

  fields.forEach((field) => {
    if (payload[field] !== undefined && payload[field] !== null) {
      formData.append(field, payload[field]);
    }
  });

  if (typeof payload.isFeatured === 'boolean') {
    formData.append('isFeatured', payload.isFeatured);
  }

  if (Array.isArray(payload.categories)) {
    formData.append('categories', JSON.stringify(payload.categories));
  }

  if (payload.coverImageFile) {
    formData.append('coverImage', payload.coverImageFile);
  }

  return formData;
};

export const getPosts = (params = {}) =>
  apiClient.get('/posts', { params }).then((response) => response.data);

export const getPost = (identifier) =>
  apiClient.get(`/posts/${identifier}`).then((response) => response.data);

export const createPost = (payload) =>
  apiClient
    .post('/posts', buildPostFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((response) => response.data);

export const updatePost = (identifier, payload) =>
  apiClient
    .put(`/posts/${identifier}`, buildPostFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((response) => response.data);

export const deletePost = (identifier) =>
  apiClient.delete(`/posts/${identifier}`).then((response) => response.data);
