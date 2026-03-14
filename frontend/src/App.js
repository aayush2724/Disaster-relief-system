// src/App.js
// Root component. Defines all routes and wraps everything in AuthProvider.
// PrivateRoute redirects to /login if not authenticated.

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Layout         from './components/Layout';
import Login          from './pages/Login';
import Dashboard      from './pages/Dashboard';
import Disasters      from './pages/Disasters';
import DisasterDetail from './pages/DisasterDetail';
import Volunteers     from './pages/Volunteers';
import SupplyChain    from './pages/SupplyChain';
import Announcements  from './pages/Announcements';
import AuditLog       from './pages/AuditLog';

import './index.css';

// Wraps protected pages — redirects to /login if no user
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index                  element={<Dashboard />} />
        <Route path="disasters"       element={<Disasters />} />
        <Route path="disasters/:id"   element={<DisasterDetail />} />
        <Route path="volunteers"      element={<Volunteers />} />
        <Route path="supply"          element={<SupplyChain />} />
        <Route path="announcements"   element={<Announcements />} />
        <Route path="audit"           element={<AuditLog />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
