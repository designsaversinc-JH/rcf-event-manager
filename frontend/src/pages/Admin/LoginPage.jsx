import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import PublicBlogHeader from '../../components/public/PublicBlogHeader';
import PublicBlogFooter from '../../components/public/PublicBlogFooter';
import { fetchLanding } from '../../api/public';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  const [navigation, setNavigation] = useState([]);
  const { login } = useAuth();
  const navigate = useNavigate();

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
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="public-page compact-public">
      <PublicBlogHeader settings={settings} />
      <div className="login-shell">
        <form className="login-card" onSubmit={onSubmit}>
          <p className="brand-kicker">Client Admin</p>
          <h1>Dashboard Login</h1>
          <p className="login-subtext">Sign in with your approved admin account.</p>

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

          {error ? <p className="form-error" role="alert">{error}</p> : null}

          <button type="submit" disabled={loading || !email || !password}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
      <PublicBlogFooter settings={settings} navigation={navigation} />
    </div>
  );
};

export default LoginPage;
