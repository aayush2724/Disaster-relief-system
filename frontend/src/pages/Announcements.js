// src/pages/Announcements.js
// Global announcements feed across all disasters.

import React, { useEffect, useState } from 'react';
import { getAllAnnouncements } from '../api';

const SEV_COLOR = { critical: 'var(--red)', warning: 'var(--amber)', info: 'var(--blue)' };

export default function Announcements() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllAnnouncements().then(r => setItems(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Announcements</h1>
        <p>All field updates across active disasters</p>
      </div>

      {loading ? <div className="loading">Loading...</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.map(a => (
            <div key={a.id} className="card" style={{ borderLeft: `3px solid ${SEV_COLOR[a.severity] || 'var(--blue)'}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize:'0.75rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{a.disaster_title}</span>
                  <h3 style={{ fontSize:'1rem', marginTop:2 }}>{a.title}</h3>
                </div>
                <span className={`badge badge-${a.severity === 'critical' ? 'critical' : a.severity === 'warning' ? 'high' : 'medium'}`}>{a.severity}</span>
              </div>
              <p style={{ color:'var(--text-secondary)', fontSize:'0.875rem', lineHeight:1.6 }}>{a.message}</p>
              <p style={{ color:'var(--text-muted)', fontSize:'0.75rem', marginTop:10 }}>
                Posted by <strong style={{ color:'var(--text-secondary)' }}>{a.posted_by_name}</strong> · {new Date(a.created_at).toLocaleString()}
              </p>
            </div>
          ))}
          {!items.length && <div className="empty">No announcements found</div>}
        </div>
      )}
    </div>
  );
}
