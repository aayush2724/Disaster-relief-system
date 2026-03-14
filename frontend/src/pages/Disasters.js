// src/pages/Disasters.js
// Lists all disasters in a table with status badges.
// Admin/agency see a "Declare Disaster" button that opens a modal form.
// Clicking a row navigates to DisasterDetail.

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDisasters, createDisaster } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Disasters() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(false);
  const [form, setForm]           = useState({ title:'', type:'flood', severity:'medium', description:'', location:'', lat:'', lng:'' });
  const [busy, setBusy]           = useState(false);
  const [error, setError]         = useState('');

  const load = () => getDisasters().then(r => setDisasters(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleCreate = async e => {
    e.preventDefault(); setBusy(true); setError('');
    try {
      await createDisaster(form);
      setModal(false);
      setForm({ title:'', type:'flood', severity:'medium', description:'', location:'', lat:'', lng:'' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating disaster');
    } finally { setBusy(false); }
  };

  const canCreate = ['admin','agency'].includes(user?.role);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Disasters</h1>
          <p>All declared disaster events</p>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={() => setModal(true)}>+ Declare Disaster</button>
        )}
      </div>

      <div className="card">
        {loading ? <div className="loading">Loading...</div> : (
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>Title</th><th>Type</th><th>Severity</th><th>Location</th><th>Status</th><th>Declared</th>
              </tr></thead>
              <tbody>
                {disasters.map(d => (
                  <tr key={d.id} onClick={() => navigate(`/disasters/${d.id}`)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 600 }}>{d.title}</td>
                    <td style={{ textTransform: 'capitalize' }}>{d.type}</td>
                    <td><span className={`badge badge-${d.severity}`}>{d.severity}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{d.location}</td>
                    <td><span className={`badge badge-${d.status}`}>{d.status}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{new Date(d.started_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {!disasters.length && <tr><td colSpan={6} style={{ textAlign:'center', color:'var(--text-muted)', padding:'2rem' }}>No disasters found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>🚨 Declare Disaster</h2>
            <form onSubmit={handleCreate} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div className="form-group"><label>Title</label><input required placeholder="e.g. Kerala Floods 2024" value={form.title} onChange={set('title')} /></div>
              <div className="grid-2">
                <div className="form-group"><label>Type</label>
                  <select value={form.type} onChange={set('type')}>
                    {['flood','earthquake','fire','cyclone','tsunami','landslide','other'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Severity</label>
                  <select value={form.severity} onChange={set('severity')}>
                    {['low','medium','high','critical'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group"><label>Location</label><input required placeholder="State, Country" value={form.location} onChange={set('location')} /></div>
              <div className="grid-2">
                <div className="form-group"><label>Latitude</label><input type="number" step="any" placeholder="e.g. 10.8505" value={form.lat} onChange={set('lat')} /></div>
                <div className="form-group"><label>Longitude</label><input type="number" step="any" placeholder="e.g. 76.2711" value={form.lng} onChange={set('lng')} /></div>
              </div>
              <div className="form-group"><label>Description</label><textarea rows={3} value={form.description} onChange={set('description')} placeholder="Situation summary..." /></div>
              {error && <p className="error-msg">{error}</p>}
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Creating...' : 'Declare'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
