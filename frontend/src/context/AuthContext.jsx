import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import * as authApi from '../api/auth';
import { setAuthToken } from '../api/client';
import { firebaseAuth } from '../firebase';

const AUTH_STORAGE_KEY = 'client-blog-admin-auth';

export const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const applyAuth = useCallback((nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    setAuthToken(nextToken);

    if (nextToken) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: nextToken }));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);

        if (!stored) {
          setLoading(false);
          return;
        }

        const parsed = JSON.parse(stored);
        if (!parsed?.token) {
          setLoading(false);
          return;
        }

        setAuthToken(parsed.token);
        setToken(parsed.token);

        const response = await authApi.fetchCurrentUser();
        setUser(response.data?.user || null);
      } catch (_error) {
        applyAuth(null, null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [applyAuth]);

  const login = useCallback(
    async ({ email, password }) => {
      if (!firebaseAuth) {
        throw new Error('Firebase Auth is not configured in this environment.');
      }

      const authResult = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const idToken = await authResult.user.getIdToken();
      const response = await authApi.firebaseLogin(idToken);
      const nextToken = response.data?.token;
      const nextUser = response.data?.user;

      applyAuth(nextToken, nextUser);
      return nextUser;
    },
    [applyAuth]
  );

  const signup = useCallback(
    async ({ name, email, password }) => {
      if (!firebaseAuth) {
        throw new Error('Firebase Auth is not configured in this environment.');
      }

      const authResult = await createUserWithEmailAndPassword(firebaseAuth, email, password);

      if (name?.trim()) {
        await updateProfile(authResult.user, { displayName: name.trim() });
      }

      const idToken = await authResult.user.getIdToken(true);
      const response = await authApi.firebaseSignup({
        idToken,
        name: name?.trim() || authResult.user.displayName || email,
      });

      const nextToken = response.data?.token;
      const nextUser = response.data?.user;
      applyAuth(nextToken, nextUser);
      return nextUser;
    },
    [applyAuth]
  );

  const logout = useCallback(async () => {
    if (firebaseAuth?.currentUser) {
      await signOut(firebaseAuth);
    }

    applyAuth(null, null);
  }, [applyAuth]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      signup,
      logout,
    }),
    [user, token, loading, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
