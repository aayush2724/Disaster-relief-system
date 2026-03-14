// src/pages/DisasterDetail.js
// Shows a single disaster with tabbed sections: Zones, Announcements, Add Zone.
// Admin/agency can change disaster status and post announcements.

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getDisasterById, getDisasterZones, getDisasterAnnouncements,
  updateDisasterStatus, createZone, createAnnouncement
} from '../api';
import { useAuth } from '../context/AuthContext';

const TABS = ['Zones', 'Announcements', 'Add Zone', 'Post Announcement'];

export default function DisasterDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [disaster, setDisaster]           = useState(null);
  const [zones, setZones]                 = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [tab, setTab]                     = useState('Zones');
  const [loading, setLoading]             = useState(true);

  // Add Zone form
  const [zForm, setZForm] = useState({ zone_name:'', population_affected:'', severity:'medium', lat:'', lng:'', notes:'' });
  // Add Announcement form
  const [aForm, setAForm] = useState({ title:'', message:'', severity:'info' });

  const [busy, setBusy]   = useState(false);
  const [msg, setMsg]     = useState('');

  const load = async () => {
    const [d, z, a] = await Promise.all([
      getDisasterById(id), getDisasterZones(id), getDisasterAnnouncements(id)
    ]);
    setDisaster(d.data); setZones(z.data); setAnnouncements(a.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const canManage = ['admin','agency'].includes(user?.role);

  const handleStatusChange = async status => {
    await updateDisasterStatus(id, status);
    setDisaster(d => ({ ...d, status }));
  };

  const handleAddZone = async e => {
    e.preventDefault(); setBusy(true); setMsg('');
    try {
      await createZone({ ...zForm, disaster_id: Number(id) });
      setMsg('Zone added!'); setZForm({ zone_name:'', population_affected:'', severity:'medium', lat:'', lng:'', notes:'' });
      load();
    } catch (err) { setMsg(err.response?.data?.message || 'Error'); }
    finally { setBusy(false); }
  };

  const handleAddAnnouncement = async e => {
    e.preventDefault(); setBusy(true); setMsg('');
    try {
      await createAnnouncement({ ...aForm, disaster_id: Number(id) });
      setMsg('Announcement posted!'); setAForm({ title:'', message:'', severity:'info' });
      load();
    } catch (err) { setMsg(err.response?.data?.message || 'Error'); }
    finally { setBusy(false); }
  };

  const sz = k => e => setZForm(f => ({ ...f, [k]: e.target.value }));
  const sa = k => e => setAForm(f => ({ ...f, [k]: e.target.value }));

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
            <h1 style={{ fontSize:'1.8rem' }}>{disaster.title}</h1>
            <span className={`badge badge-${disaster.status}`}>{disaster.status}</span>
            <span className={`badge badge-${disaster.severity}`}>{disaster.severity}</span>
          </div>
          <p style={{ color:'var(--text-secondary)' }}>📍 {disaster.location} &nbsp;·&nbsp; {disaster.type}</p>
          {disaster.description && <p style={{ color:'var(--text-muted)', marginTop:6, fontSize:'0.875rem' }}>{disaster.description}</p>}
        </div>
        {canManage && (
          <div style={{ display:'flex', gap:8 }}>
            {disaster.status !== 'contained' && <button className="btn btn-warning btn-sm" onClick={() => handleStatusChange('contained')}>Mark Contained</button>}
            {disaster.status !== 'closed'    && <button className="btn btn-secondary btn-sm" onClick={() => handleStatusChange('closed')}>Close</button>}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:0, marginBottom:'1.5rem', borderBottom:'1px solid var(--border)' }}>
        {(canManage ? TABS : TABS.slice(0,2)).map(t => (
          <button key={t} onClick={() => { setTab(t); setMsg(''); }} style={{
            padding:'0.6rem 1.2rem', border:'none', background:'transparent', cursor:'pointer',
            color: tab===t ? 'var(--text-primary)' : 'var(--text-secondary)',
            borderBottom: tab===t ? '2px solid var(--red)' : '2px solid transparent',
            fontSize:'0.875rem', fontWeight: tab===t ? 600 : 400
          }}>{t}</button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'Zones' && (
        <div className="card">
          <h3 style={{ marginBottom:'1rem' }}>Affected Zones ({zones.length})</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Zone</th><th>Population</th><th>Severity</th><th>Notes</th></tr></thead>
              <tbody>
                {zones.map(z => (
                  <tr key={z.id}>
                    <td style={{ fontWeight:600 }}>{z.zone_name}</td>
                    <td>{z.population_affected?.toLocaleString()}</td>
                    <td><span className={`badge badge-${z.severity}`}>{z.severity}</span></td>
                    <td style={{ color:'var(--text-muted)', fontSize:'0.82rem' }}>{z.notes || '—'}</td>
                  </tr>
                ))}
                {!zones.length && <tr><td colSpan={4} className="empty">No zones added yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'Announcements' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {announcements.map(a => (
            <div key={a.id} className="card" style={{ borderLeft:`3px solid ${a.severity==='critical'?'var(--red)':a.severity==='warning'?'var(--amber)':'var(--blue)'}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                <h4 style={{ fontSize:'1rem' }}>{a.title}</h4>
                <span className={`badge badge-${a.severity==='critical'?'critical':a.severity==='warning'?'high':'medium'}`}>{a.severity}</span>
              </div>
              <p style={{ color:'var(--text-secondary)', fontSize:'0.875rem' }}>{a.message}</p>
              <p style={{ color:'var(--text-muted)', fontSize:'0.75rem', marginTop:8 }}>Posted by {a.posted_by_name} · {new Date(a.created_at).toLocaleString()}</p>
            </div>
          ))}
          {!announcements.length && <div className="empty">No announcements yet</div>}
        </div>
      )}

      {tab === 'Add Zone' && canManage && (
        <div className="card" style={{ maxWidth:600 }}>
          <h3 style={{ marginBottom:'1.25rem' }}>Add Affected Zone</h3>
          <form onSubmit={handleAddZone} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div className="form-group"><label>Zone Name</label><input required value={zForm.zone_name} onChange={sz('zone_name')} placeholder="e.g. Wayanad District" /></div>
            <div className="grid-2">
              <div className="form-group"><label>Population Affected</label><input type="number" value={zForm.population_affected} onChange={sz('population_affected')} /></div>
              <div className="form-group"><label>Severity</label>
                <select value={zForm.severity} onChange={sz('severity')}>{['low','medium','high','critical'].map(s=><option key={s}>{s}</option>)}</select>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group"><label>Latitude</label><input type="number" step="any" value={zForm.lat} onChange={sz('lat')} /></div>
              <div className="form-group"><label>Longitude</label><input type="number" step="any" value={zForm.lng} onChange={sz('lng')} /></div>
            </div>
            <div className="form-group"><label>Notes</label><textarea rows={2} value={zForm.notes} onChange={sz('notes')} /></div>
            {msg && <p className={msg.includes('!') ? 'success-msg' : 'error-msg'}>{msg}</p>}
            <button type="submit" className="btn btn-primary" disabled={busy}>{busy?'Adding...':'Add Zone'}</button>
          </form>
        </div>
      )}

      {tab === 'Post Announcement' && canManage && (
        <div className="card" style={{ maxWidth:600 }}>
          <h3 style={{ marginBottom:'1.25rem' }}>Post Announcement</h3>
          <form onSubmit={handleAddAnnouncement} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div className="form-group"><label>Title</label><input required value={aForm.title} onChange={sa('title')} /></div>
            <div className="form-group"><label>Severity</label>
              <select value={aForm.severity} onChange={sa('severity')}>{['info','warning','critical'].map(s=><option key={s}>{s}</option>)}</select>
            </div>
            <div className="form-group"><label>Message</label><textarea required rows={4} value={aForm.message} onChange={sa('message')} /></div>
            {msg && <p className={msg.includes('!') ? 'success-msg' : 'error-msg'}>{msg}</p>}
            <button type="submit" className="btn btn-primary" disabled={busy}>{busy?'Posting...':'Post'}</button>
          </form>
        </div>
      )}
    </div>
  );
}
