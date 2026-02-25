import axios from 'axios';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const DEFAULT_API_TIMEOUT_MS = 15000;
const parsedTimeout = Number(process.env.REACT_APP_API_TIMEOUT_MS);
const API_TIMEOUT_MS =
  Number.isFinite(parsedTimeout) && parsedTimeout > 0 ? parsedTimeout : DEFAULT_API_TIMEOUT_MS;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
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
