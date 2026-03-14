// src/pages/Login.js
// Login + Register on a single page with tab switching.
// On success, stores JWT via AuthContext.loginUser() and redirects to dashboard.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [tab, setTab]     = useState('login');
  const [form, setForm]   = useState({ name:'', email:'', password:'', role:'volunteer' });
  const [error, setError] = useState('');
  const [busy, setBusy]   = useState(false);
  const { loginUser }     = useAuth();
  const navigate          = useNavigate();

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const fn  = tab === 'login' ? login : register;
      const res = await fn(form);
      loginUser(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally { setBusy(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)',
      backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(230,57,70,0.07) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.05) 0%, transparent 50%)'
    }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '0 1rem' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: 8 }}>🚨</div>
          <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2rem', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--red)' }}>RELIEF OPS</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Disaster Coordination Platform</p>
        </div>

        <div className="card">
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, marginBottom: '1.5rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: 4 }}>
            {['login','register'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: '0.5rem', border: 'none',
                background: tab === t ? 'var(--bg-card)' : 'transparent',
                color: tab === t ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 500,
                textTransform: 'capitalize', cursor: 'pointer',
                boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.3)' : 'none'
              }}>{t}</button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {tab === 'register' && (
              <div className="form-group">
                <label>Full Name</label>
                <input placeholder="Your name" value={form.name} onChange={set('name')} required />
              </div>
            )}
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required />
            </div>
            {tab === 'register' && (
              <div className="form-group">
                <label>Role</label>
                <select value={form.role} onChange={set('role')}>
                  <option value="volunteer">Volunteer</option>
                  <option value="ngo">NGO Coordinator</option>
                  <option value="agency">Agency</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}
            {error && <p className="error-msg">{error}</p>}
            <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', padding: '0.75rem', fontSize: '0.9rem', marginTop: 4 }} disabled={busy}>
              {busy ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {tab === 'login' && (
            <p style={{ marginTop: '1.5rem', fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.7 }}>
              Demo credentials — Email: <strong style={{color:'var(--text-secondary)'}}>admin@relief.org</strong><br/>Password: <strong style={{color:'var(--text-secondary)'}}>password123</strong>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
