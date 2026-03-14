// src/components/Layout.js
// Persistent sidebar + top bar that wraps all authenticated pages.
// Active route is highlighted via NavLink's isActive prop.
// Sidebar shows the user's role as a badge.

import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/',             label: 'Dashboard',      icon: '⬛' },
  { to: '/disasters',    label: 'Disasters',       icon: '🔴' },
  { to: '/volunteers',   label: 'Volunteers',      icon: '🟡' },
  { to: '/supply',       label: 'Supply Chain',    icon: '🟢' },
  { to: '/announcements',label: 'Announcements',   icon: '📢' },
  { to: '/audit',        label: 'Audit Log',       icon: '📋' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: 220, background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100
      }}>
        {/* Logo */}
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1.4rem' }}>🚨</span>
            <div>
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.08em', color: 'var(--red)' }}>RELIEF OPS</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Coordination System</div>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {NAV.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} end={to === '/'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '0.65rem 1.25rem',
                fontSize: '0.875rem', fontWeight: 500,
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive ? 'var(--bg-elevated)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--red)' : '3px solid transparent',
                transition: 'all 0.15s',
              })}>
              <span style={{ fontSize: '0.8rem' }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User Block */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 2 }}>{user?.name}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{user?.role}</div>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={{ marginLeft: 220, flex: 1, padding: '2rem', minHeight: '100vh' }}>
        <Outlet />
      </main>
    </div>
  );
}
