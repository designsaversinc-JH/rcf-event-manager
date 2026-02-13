import axios from 'axios';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

apiClient.interceptors.request.use((config) => {
  const next = { ...config };

  if (authToken) {
    next.headers = next.headers || {};
    next.headers.Authorization = `Bearer ${authToken}`;
  }

  return next;
});

export default apiClient;
