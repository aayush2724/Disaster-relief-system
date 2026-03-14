// src/pages/Dashboard.js
// Main overview page. Shows 5 KPI stat cards and a live activity feed.
// All data comes from GET /api/dashboard/stats which runs multiple aggregated queries.

import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '../api';
import { useAuth } from '../context/AuthContext';

const ACTION_LABELS = {
  USER_REGISTER:        'New user registered',
  USER_LOGIN:           'User signed in',
  DISASTER_CREATED:     'Disaster declared',
  DISASTER_STATUS_UPDATE: 'Disaster status changed',
  VOLUNTEER_DISPATCHED: 'Volunteer dispatched',
  SUPPLY_TRANSFER:      'Supply transfer executed',
  STOCK_ADDED:          'Inventory updated',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(r => setStats(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  const cards = [
    { label: 'Active Disasters',     value: stats.activeDisasters,    color: 'var(--red)',   icon: '🔴' },
    { label: 'People Affected',      value: stats.totalAffected?.toLocaleString(), color: 'var(--amber)', icon: '👥' },
    { label: 'Volunteers Deployed',  value: stats.volunteersDeployed, color: 'var(--blue)',  icon: '🟡' },
    { label: 'Critical Zones',       value: stats.criticalZones,      color: 'var(--red)',   icon: '⚠️' },
    { label: 'Pending Supply Req.', value: stats.pendingRequests,    color: 'var(--amber)', icon: '📦' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Operations Dashboard</h1>
        <p>Welcome back, {user?.name} — <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.06em' }}>{user?.role}</span></p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {cards.map(({ label, value, color, icon }) => (
          <div key={label} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
              <span>{icon}</span>
            </div>
            <div style={{ fontSize: '2.2rem', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, color }}>{value ?? 0}</div>
          </div>
        ))}
      </div>

      {/* Recent Activity Feed */}
      <div className="card">
        <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>Recent Activity</h3>
        {stats.recentActivity.length === 0 ? (
          <p className="empty">No activity yet</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {stats.recentActivity.map(log => (
              <div key={log.id} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '0.75rem 0', borderBottom: '1px solid var(--border)',
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: log.action.includes('DISASTER') ? 'var(--red)' : log.action.includes('VOLUNTEER') ? 'var(--amber)' : 'var(--blue)'
                }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.875rem' }}>{ACTION_LABELS[log.action] || log.action}</span>
                  {log.details && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}> — {log.details}</span>}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {new Date(log.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
