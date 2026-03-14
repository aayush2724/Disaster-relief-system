// src/pages/SupplyChain.js
// Three-tab page: Inventory (per warehouse), Supply Requests, Transfer History.
// Admin/agency can execute transfers (which call the transfer_supplies stored procedure).

import React, { useEffect, useState } from 'react';
import {
  getWarehouses, getInventory, getSupplyRequests,
  createSupplyRequest, transferSupplies, getTransferHistory,
  getResources, getDisasters, getDisasterZones
} from '../api';
import { useAuth } from '../context/AuthContext';

const TABS = ['Inventory', 'Supply Requests', 'Transfer History'];

export default function SupplyChain() {
  const { user } = useAuth();
  const [tab, setTab]               = useState('Inventory');
  const [warehouses, setWarehouses] = useState([]);
  const [selWH, setSelWH]           = useState('');
  const [inventory, setInventory]   = useState([]);
  const [requests, setRequests]     = useState([]);
  const [transfers, setTransfers]   = useState([]);
  const [resources, setResources]   = useState([]);
  const [disasters, setDisasters]   = useState([]);
  const [zones, setZones]           = useState([]);
  const [modal, setModal]           = useState(null); // 'request' | 'transfer'
  const [form, setForm]             = useState({});
  const [busy, setBusy]             = useState(false);
  const [msg, setMsg]               = useState('');

  const canManage = ['admin','agency'].includes(user?.role);

  useEffect(() => {
    getWarehouses().then(r => { setWarehouses(r.data); if (r.data.length) setSelWH(String(r.data[0].id)); });
    getResources().then(r => setResources(r.data));
    getDisasters({ status:'active' }).then(r => setDisasters(r.data));
    getSupplyRequests().then(r => setRequests(r.data));
    getTransferHistory().then(r => setTransfers(r.data));
  }, []);

  useEffect(() => { if (selWH) getInventory(selWH).then(r => setInventory(r.data)); }, [selWH]);

  const onDisasterChange = async id => {
    setForm(f => ({ ...f, disaster_id:id, zone_id:'' }));
    if (id) { const r = await getDisasterZones(id); setZones(r.data); }
  };

  const handleRequest = async e => {
    e.preventDefault(); setBusy(true); setMsg('');
    try {
      await createSupplyRequest({ zone_id:Number(form.zone_id), resource_id:Number(form.resource_id), quantity_requested:Number(form.qty) });
      setMsg('Request submitted!'); getSupplyRequests().then(r => setRequests(r.data));
      setTimeout(() => setModal(null), 1000);
    } catch (err) { setMsg(err.response?.data?.message || 'Error'); }
    finally { setBusy(false); }
  };

  const handleTransfer = async (req) => {
    if (!window.confirm(`Transfer ${req.quantity_requested - req.quantity_fulfilled} ${req.resource_name} units to ${req.zone_name}?`)) return;
    try {
      const whId = warehouses[0]?.id;
      await transferSupplies({ warehouse_id: whId, zone_id: req.zone_id, resource_id: req.resource_id, quantity: req.quantity_requested - req.quantity_fulfilled, request_id: req.id });
      getSupplyRequests().then(r => setRequests(r.data));
      getTransferHistory().then(r => setTransfers(r.data));
      if (selWH) getInventory(selWH).then(r => setInventory(r.data));
    } catch (err) { alert(err.response?.data?.message || 'Transfer failed'); }
  };

  const sf = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div><h1>Supply Chain</h1><p>Inventory, requests and transfers</p></div>
        <button className="btn btn-primary" onClick={() => { setModal('request'); setMsg(''); setForm({}); }}>+ New Request</button>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:0, marginBottom:'1.5rem', borderBottom:'1px solid var(--border)' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:'0.6rem 1.2rem', border:'none', background:'transparent', cursor:'pointer',
            color: tab===t ? 'var(--text-primary)' : 'var(--text-secondary)',
            borderBottom: tab===t ? '2px solid var(--red)' : '2px solid transparent',
            fontSize:'0.875rem', fontWeight: tab===t ? 600 : 400
          }}>{t}</button>
        ))}
      </div>

      {/* Inventory Tab */}
      {tab === 'Inventory' && (
        <div>
          <div style={{ marginBottom:'1rem' }}>
            <select value={selWH} onChange={e => setSelWH(e.target.value)} style={{ maxWidth:300 }}>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead><tr><th>Resource</th><th>Category</th><th>Quantity</th><th>Unit</th><th>Last Updated</th></tr></thead>
                <tbody>
                  {inventory.map(i => (
                    <tr key={i.id}>
                      <td style={{ fontWeight:600 }}>{i.resource_name}</td>
                      <td style={{ textTransform:'capitalize', color:'var(--text-secondary)' }}>{i.category}</td>
                      <td>
                        <span style={{ color: i.quantity < 20 ? 'var(--red)' : i.quantity < 100 ? 'var(--amber)' : 'var(--green)', fontWeight:600 }}>
                          {i.quantity}
                        </span>
                      </td>
                      <td style={{ color:'var(--text-muted)' }}>{i.unit}</td>
                      <td style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>{new Date(i.last_updated).toLocaleString()}</td>
                    </tr>
                  ))}
                  {!inventory.length && <tr><td colSpan={5} className="empty">No inventory data</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Requests Tab */}
      {tab === 'Supply Requests' && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Disaster</th><th>Zone</th><th>Resource</th><th>Requested</th><th>Fulfilled</th><th>Status</th>{canManage && <th>Action</th>}</tr></thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontSize:'0.82rem', color:'var(--text-secondary)' }}>{r.disaster_title}</td>
                    <td style={{ fontWeight:600 }}>{r.zone_name}</td>
                    <td>{r.resource_name} <span style={{ color:'var(--text-muted)', fontSize:'0.75rem' }}>({r.unit})</span></td>
                    <td>{r.quantity_requested}</td>
                    <td>{r.quantity_fulfilled}</td>
                    <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                    {canManage && (
                      <td>
                        {['pending','partial'].includes(r.status) && (
                          <button className="btn btn-success btn-sm" onClick={() => handleTransfer(r)}>Fulfil</button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
                {!requests.length && <tr><td colSpan={7} className="empty">No supply requests</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transfer History Tab */}
      {tab === 'Transfer History' && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Resource</th><th>Qty</th><th>From Warehouse</th><th>To Zone</th><th>Authorized By</th><th>Date</th></tr></thead>
              <tbody>
                {transfers.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight:600 }}>{t.resource_name}</td>
                    <td>{t.quantity} <span style={{ color:'var(--text-muted)', fontSize:'0.75rem' }}>{t.unit}</span></td>
                    <td style={{ color:'var(--text-secondary)' }}>{t.warehouse_name}</td>
                    <td style={{ color:'var(--text-secondary)' }}>{t.zone_name}</td>
                    <td style={{ color:'var(--text-muted)', fontSize:'0.82rem' }}>{t.authorized_by_name || '—'}</td>
                    <td style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>{new Date(t.transferred_at).toLocaleString()}</td>
                  </tr>
                ))}
                {!transfers.length && <tr><td colSpan={6} className="empty">No transfers yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Request Modal */}
      {modal === 'request' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>New Supply Request</h2>
            <form onSubmit={handleRequest} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div className="form-group">
                <label>Disaster</label>
                <select required value={form.disaster_id||''} onChange={e => onDisasterChange(e.target.value)}>
                  <option value="">— select disaster —</option>
                  {disasters.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Zone</label>
                <select required value={form.zone_id||''} onChange={sf('zone_id')}>
                  <option value="">— select zone —</option>
                  {zones.map(z => <option key={z.id} value={z.id}>{z.zone_name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Resource</label>
                <select required value={form.resource_id||''} onChange={sf('resource_id')}>
                  <option value="">— select resource —</option>
                  {resources.map(r => <option key={r.id} value={r.id}>{r.name} ({r.unit})</option>)}
                </select>
              </div>
              <div className="form-group"><label>Quantity</label><input required type="number" min="1" value={form.qty||''} onChange={sf('qty')} /></div>
              {msg && <p className={msg.includes('!') ? 'success-msg' : 'error-msg'}>{msg}</p>}
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={busy}>{busy?'Submitting...':'Submit Request'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
