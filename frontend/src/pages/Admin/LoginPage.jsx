import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const LoginPage = () => {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        await signup({ name, email, password });
      } else {
        await login({ email, password });
      }

      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || `${mode === 'signup' ? 'Signup' : 'Login'} failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <form className="login-card" onSubmit={onSubmit}>
        <p className="brand-kicker">Client Admin</p>
        <h1>{mode === 'signup' ? 'Create Admin User' : 'Dashboard Login'}</h1>

        {mode === 'signup' ? (
          <>
            <label htmlFor="name">Name</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </>
        ) : null}

        <label htmlFor="email">Email</label>
        <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        {error ? <p className="form-error">{error}</p> : null}

        <button type="submit" disabled={loading}>
          {loading ? (mode === 'signup' ? 'Creating account...' : 'Logging in...') : mode === 'signup' ? 'Sign up' : 'Login'}
        </button>

        <button
          type="button"
          className="mode-switch"
          onClick={() => {
            setError('');
            setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
          }}
        >
          {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Login'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
