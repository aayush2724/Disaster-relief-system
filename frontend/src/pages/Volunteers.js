// src/pages/Volunteers.js
// Shows all volunteers with their current status.
// Admin/NGO/agency can dispatch idle volunteers to a zone or mark them as returned.

import React, { useEffect, useState } from 'react';
import { getAllVolunteers, getDisasters, getDisasterZones, dispatchVolunteer, returnVolunteer } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Volunteers() {
  const { user } = useAuth();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState(false);
  const [disasters, setDisasters]   = useState([]);
  const [zones, setZones]           = useState([]);
  const [selVol, setSelVol]         = useState(null);
  const [form, setForm]             = useState({ disaster_id:'', zone_id:'', notes:'' });
  const [busy, setBusy]             = useState(false);
  const [msg, setMsg]               = useState('');

  const load = () => getAllVolunteers().then(r => setVolunteers(r.data)).finally(() => setLoading(false));

  useEffect(() => {
    load();
    getDisasters({ status:'active' }).then(r => setDisasters(r.data));
  }, []);

  const canManage = ['admin','agency','ngo'].includes(user?.role);

  const onDisasterChange = async e => {
    setForm(f => ({ ...f, disaster_id: e.target.value, zone_id:'' }));
    if (e.target.value) {
      const r = await getDisasterZones(e.target.value);
      setZones(r.data);
    } else setZones([]);
  };

  const openDispatch = vol => { setSelVol(vol); setModal(true); setMsg(''); };

  const handleDispatch = async e => {
    e.preventDefault(); setBusy(true); setMsg('');
    try {
      await dispatchVolunteer({ volunteer_id: selVol.id, zone_id: Number(form.zone_id), notes: form.notes });
      setMsg('Dispatched!'); load(); setTimeout(() => setModal(false), 800);
    } catch (err) { setMsg(err.response?.data?.message || 'Error'); }
    finally { setBusy(false); }
  };

  const handleReturn = async vol => {
    if (!window.confirm(`Mark ${vol.name} as returned?`)) return;
    await returnVolunteer(vol.id);
    load();
  };

  return (
    <div>
      <div className="page-header">
        <h1>Volunteers</h1>
        <p>Volunteer roster and deployment management</p>
      </div>

      <div className="card">
        {loading ? <div className="loading">Loading...</div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Skills</th><th>Status</th><th>Zone</th>{canManage && <th>Actions</th>}</tr></thead>
              <tbody>
                {volunteers.map(v => (
                  <tr key={v.id}>
                    <td style={{ fontWeight:600 }}>{v.name}</td>
                    <td style={{ color:'var(--text-secondary)', fontSize:'0.82rem' }}>{v.email}</td>
                    <td style={{ color:'var(--text-secondary)', fontSize:'0.82rem' }}>{v.phone || '—'}</td>
                    <td style={{ fontSize:'0.8rem' }}>
                      {v.skills ? JSON.parse(v.skills).slice(0,3).map(s => (
                        <span key={s} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:4, padding:'1px 6px', marginRight:4, fontSize:'0.73rem' }}>{s}</span>
                      )) : '—'}
                    </td>
                    <td><span className={`badge badge-${v.status}`}>{v.status}</span></td>
                    <td style={{ color:'var(--text-muted)', fontSize:'0.82rem' }}>{v.assigned_zone || '—'}</td>
                    {canManage && (
                      <td>
                        {v.status === 'idle' && (
                          <button className="btn btn-warning btn-sm" onClick={() => openDispatch(v)}>Dispatch</button>
                        )}
                        {['dispatched','on-site'].includes(v.status) && (
                          <button className="btn btn-success btn-sm" onClick={() => handleReturn(v)}>Return</button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
                {!volunteers.length && <tr><td colSpan={7} className="empty">No volunteers registered</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dispatch Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Dispatch {selVol?.name}</h2>
            <form onSubmit={handleDispatch} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div className="form-group">
                <label>Select Disaster</label>
                <select required value={form.disaster_id} onChange={onDisasterChange}>
                  <option value="">— choose disaster —</option>
                  {disasters.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Select Zone</label>
                <select required value={form.zone_id} onChange={e => setForm(f=>({...f, zone_id:e.target.value}))}>
                  <option value="">— choose zone —</option>
                  {zones.map(z => <option key={z.id} value={z.id}>{z.zone_name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Notes (optional)</label><textarea rows={2} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} /></div>
              {msg && <p className={msg.includes('!') ? 'success-msg' : 'error-msg'}>{msg}</p>}
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={busy}>{busy?'Dispatching...':'Dispatch'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
