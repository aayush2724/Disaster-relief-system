// src/api/index.js
// Central Axios instance + all API call functions.
// Token is injected automatically from localStorage via the request interceptor.
// Any 401 response logs the user out automatically via the response interceptor.

import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Attach JWT to every outgoing request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Auto-logout on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────
export const login    = d => api.post('/auth/login', d);
export const register = d => api.post('/auth/register', d);
export const getMe    = () => api.get('/auth/me');

// ── Dashboard ─────────────────────────────────────────────
export const getDashboardStats = () => api.get('/dashboard/stats');

// ── Disasters ─────────────────────────────────────────────
export const getDisasters       = (params) => api.get('/disasters', { params });
export const getDisasterSummary = ()        => api.get('/disasters/summary');
export const getDisasterById    = id        => api.get(`/disasters/${id}`);
export const createDisaster     = d         => api.post('/disasters', d);
export const updateDisasterStatus = (id, status) => api.patch(`/disasters/${id}/status`, { status });
export const getDisasterZones   = id        => api.get(`/disasters/${id}/zones`);
export const getDisasterAnnouncements = id  => api.get(`/disasters/${id}/announcements`);

// ── Zones ─────────────────────────────────────────────────
export const createZone       = d  => api.post('/zones', d);
export const getZoneById      = id => api.get(`/zones/${id}`);
export const getZoneReports   = id => api.get(`/zones/${id}/reports`);
export const submitZoneReport = d  => api.post('/zones/reports', d);

// ── Volunteers ────────────────────────────────────────────
export const getAllVolunteers       = ()  => api.get('/volunteers');
export const getAvailableVolunteers = ()  => api.get('/volunteers/available');
export const dispatchVolunteer      = d   => api.post('/volunteers/dispatch', d);
export const returnVolunteer        = id  => api.post(`/volunteers/return/${id}`);
export const getDispatchLogs        = id  => api.get(`/volunteers/${id}/logs`);

// ── Supply Chain ──────────────────────────────────────────
export const getWarehouses      = ()  => api.get('/supply/warehouses');
export const getInventory       = id  => api.get(`/supply/inventory/${id}`);
export const getResources       = ()  => api.get('/supply/resources');
export const addStock           = d   => api.post('/supply/inventory/add', d);
export const getSupplyRequests  = (p) => api.get('/supply/requests', { params: p });
export const createSupplyRequest= d   => api.post('/supply/requests', d);
export const transferSupplies   = d   => api.post('/supply/transfers', d);
export const getTransferHistory = ()  => api.get('/supply/transfers');

// ── Announcements ─────────────────────────────────────────
export const getAllAnnouncements  = () => api.get('/announcements');
export const createAnnouncement   = d  => api.post('/announcements', d);

export default api;
