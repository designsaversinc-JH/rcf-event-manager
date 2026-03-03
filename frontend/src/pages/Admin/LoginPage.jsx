import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import PublicBlogHeader from '../../components/public/PublicBlogHeader';
import PublicBlogFooter from '../../components/public/PublicBlogFooter';
import { fetchLanding } from '../../api/public';
import usePageMeta from '../../hooks/usePageMeta';
import { BRAND_SHORT_NAME } from '../../config/branding';

const LoginPage = () => {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  const [navigation, setNavigation] = useState([]);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  usePageMeta({
    title: 'Admin Access | Roseland Ceasefire',
    description: 'Secure login and test signup for the Roseland Ceasefire admin dashboard.',
    canonicalUrl: '/admin/login',
    noIndex: true,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchLanding();
        setSettings(response.data?.settings || null);
        setNavigation(response.data?.navigation || []);
      } catch (_error) {
        setSettings(null);
        setNavigation([]);
      }
    };
    load();
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Full name is required.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        await signup({ name, email, password });
      } else {
        await login({ email, password });
      }
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="public-page compact-public">
      <PublicBlogHeader settings={settings} navigation={navigation} />
      <div className="login-shell">
        <form className="login-card" onSubmit={onSubmit}>
          <p className="brand-kicker">{BRAND_SHORT_NAME} Admin</p>
          <h1>{mode === 'signup' ? 'Create Test Account' : 'Dashboard Login'}</h1>
          <p className="login-subtext">
            {mode === 'signup'
              ? 'Create a test admin account for this environment.'
              : 'Sign in with your approved admin account.'}
          </p>

          <div className="list-tabs" style={{ marginBottom: '0.5rem' }}>
            <button
              type="button"
              className={mode === 'login' ? 'active' : ''}
              onClick={() => {
                setMode('login');
                setError('');
              }}
            >
              Login
            </button>
            <button
              type="button"
              className={mode === 'signup' ? 'active' : ''}
              onClick={() => {
                setMode('signup');
                setError('');
              }}
            >
              Create Account
            </button>
          </div>

          {mode === 'signup' ? (
            <>
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                required={mode === 'signup'}
              />
            </>
          ) : null}

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />

          {mode === 'signup' ? (
            <>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required={mode === 'signup'}
                minLength={8}
              />
            </>
          ) : null}

          {error ? <p className="form-error" role="alert">{error}</p> : null}

          <button
            type="submit"
            disabled={loading || !email || !password || (mode === 'signup' && !name.trim())}
          >
            {loading
              ? mode === 'signup'
                ? 'Creating account...'
                : 'Logging in...'
              : mode === 'signup'
                ? 'Create Account'
                : 'Login'}
          </button>
        </form>
      </div>
      <PublicBlogFooter settings={settings} navigation={navigation} />
    </div>
  );
};

export default LoginPage;
