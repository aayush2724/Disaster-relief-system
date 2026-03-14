// src/pages/AuditLog.js
// Immutable log of all critical actions on the platform.
// Shows what happened, who did it, and when — great for accountability.

import React, { useEffect, useState } from 'react';
import api from '../api';

const ACTION_COLOR = {
  DISASTER_CREATED: 'var(--red)',
  DISASTER_STATUS_UPDATE: 'var(--amber)',
  VOLUNTEER_DISPATCHED: 'var(--amber)',
  SUPPLY_TRANSFER: 'var(--green)',
  STOCK_ADDED: 'var(--blue)',
  USER_REGISTER: 'var(--blue)',
  USER_LOGIN: 'var(--text-muted)',
};

export default function AuditLog() {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(r => {
        // Reuse the recent activity from dashboard stats
        setLogs(r.data.recentActivity || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Audit Log</h1>
        <p>Immutable record of all critical platform actions</p>
      </div>

      <div className="card">
        {loading ? <div className="loading">Loading...</div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Action</th><th>Entity</th><th>Details</th><th>User</th><th>Timestamp</th></tr></thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td>
                      <span style={{
                        color: ACTION_COLOR[log.action] || 'var(--text-secondary)',
                        fontFamily: 'monospace', fontSize:'0.8rem', fontWeight: 600
                      }}>{log.action}</span>
                    </td>
                    <td style={{ color:'var(--text-secondary)', fontSize:'0.82rem', textTransform:'capitalize' }}>
                      {log.entity || '—'} {log.entity_id ? `#${log.entity_id}` : ''}
                    </td>
                    <td style={{ color:'var(--text-muted)', fontSize:'0.82rem' }}>{log.details || '—'}</td>
                    <td style={{ fontSize:'0.82rem' }}>{log.user_name || 'System'}</td>
                    <td style={{ color:'var(--text-muted)', fontSize:'0.8rem', whiteSpace:'nowrap' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {!logs.length && <tr><td colSpan={5} className="empty">No audit logs found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
