// src/components/LoginForm.js
import React, { useState } from 'react';
import { login } from '../api/auth';

export default function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate that both fields are filled
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await login(username, password);
      console.log('[squid-ui] login ok:', res);
      if (res === 'ok' && onLogin) {
        const isAdmin = username === 'admintest'; // keep your admin flag logic
        onLogin({ username, isAdmin });
      }
    } catch (err) {
      console.error('[squid-ui] login request error:', err);
      setError(err?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="login-card" role="form" aria-label="Sign in">
      <h2 className="login-title">Sign in</h2>
      <p className="login-subtitle">Access Squid Stack</p>

      <form onSubmit={onSubmit} noValidate>
        <div className="form-row">
          <label htmlFor="username" className="form-label">Username</label>
          <input
            id="username"
            name="username"
            className="input"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. admintest"
            required
          />
        </div>

        <div className="form-row">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            id="password"
            name="password"
            className="input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <button type="submit" className="btn primary fullwidth" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>

        {error ? <div className="form-error">{error}</div> : null}
      </form>
    </section>
  );
}