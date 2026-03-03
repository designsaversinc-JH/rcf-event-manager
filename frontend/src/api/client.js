import axios from 'axios';

const isRunningOnLocalHost = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';
};

const resolveDefaultApiBaseUrl = () => {
  if (isRunningOnLocalHost()) {
    return 'http://localhost:5000/api';
  }

  return '/api';
};

const configuredApiBaseUrl = String(process.env.REACT_APP_API_URL || '').trim();
const pointsToLocalApi = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?(\/|$)/i.test(
  configuredApiBaseUrl
);

const shouldUseConfiguredApiBaseUrl =
  Boolean(configuredApiBaseUrl) && (!pointsToLocalApi || isRunningOnLocalHost());

export const API_BASE_URL = shouldUseConfiguredApiBaseUrl
  ? configuredApiBaseUrl
  : resolveDefaultApiBaseUrl();
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
