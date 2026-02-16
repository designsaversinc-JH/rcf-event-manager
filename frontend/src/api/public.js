import apiClient from './client';

const CACHE_PREFIX = 'public-api-cache:v1';
const CACHE_VERSION_KEY = `${CACHE_PREFIX}:version`;
const LANDING_TTL_MS = 5 * 60 * 1000;
const BLOG_TTL_MS = 5 * 60 * 1000;

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

const makeCacheKey = (key) => `${CACHE_PREFIX}:${key}`;
const blogCacheKeyPrefix = makeCacheKey('blog:');

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

const clearCacheByPrefix = (prefix) => {
  if (!canUseStorage()) return;

  const keysToDelete = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach((key) => window.localStorage.removeItem(key));
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

const getCacheVersion = () => {
  if (!canUseStorage()) return '1';
  const stored = window.localStorage.getItem(CACHE_VERSION_KEY);
  return stored || '1';
};

const bumpCacheVersion = () => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(CACHE_VERSION_KEY, String(Date.now()));
};

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

export const fetchLanding = () => {
  const version = getCacheVersion();
  return fetchWithCache(
    `landing:${version}`,
    () => apiClient.get('/public/landing', { params: { v: version } }),
    LANDING_TTL_MS
  );
};

export const fetchPublicBlog = (identifier) =>
  {
    const version = getCacheVersion();
    return fetchWithCache(
      `blog:${version}:${String(identifier || '').trim().toLowerCase()}`,
      () => apiClient.get(`/public/blogs/${identifier}`, { params: { v: version } }),
      BLOG_TTL_MS
    );
  };

export const invalidatePublicContentCache = () => {
  clearCacheByPrefix(makeCacheKey('landing:'));
  clearCacheByPrefix(blogCacheKeyPrefix);
  bumpCacheVersion();
};
