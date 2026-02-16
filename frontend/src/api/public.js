import apiClient from './client';

const CACHE_PREFIX = 'public-api-cache:v1';
const LANDING_TTL_MS = 5 * 60 * 1000;
const BLOG_TTL_MS = 5 * 60 * 1000;

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

const makeCacheKey = (key) => `${CACHE_PREFIX}:${key}`;

const readCache = (key) => {
  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(makeCacheKey(key));
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed?.expiresAt || !('data' in parsed)) return null;
    return parsed;
  } catch (_error) {
    return null;
  }
};

const writeCache = (key, data, ttlMs) => {
  if (!canUseStorage()) return;

  try {
    const payload = {
      data,
      expiresAt: Date.now() + ttlMs,
    };
    window.localStorage.setItem(makeCacheKey(key), JSON.stringify(payload));
  } catch (_error) {
    // Ignore storage quota and serialization failures.
  }
};

const toCachedResponse = (data) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {},
  request: null,
});

const fetchWithCache = async (key, request, ttlMs) => {
  const cached = readCache(key);
  if (cached && cached.expiresAt > Date.now()) {
    return toCachedResponse(cached.data);
  }

  try {
    const response = await request();
    writeCache(key, response.data, ttlMs);
    return response;
  } catch (error) {
    if (cached?.data) {
      return toCachedResponse(cached.data);
    }
    throw error;
  }
};

export const fetchLanding = () =>
  fetchWithCache('landing', () => apiClient.get('/public/landing'), LANDING_TTL_MS);

export const fetchPublicBlog = (identifier) =>
  fetchWithCache(
    `blog:${String(identifier || '').trim().toLowerCase()}`,
    () => apiClient.get(`/public/blogs/${identifier}`),
    BLOG_TTL_MS
  );
