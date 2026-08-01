import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientDetail from './pages/PatientDetail';
import Prescriptions from './pages/Prescriptions';
import Lab from './pages/Lab';
import Wards from './pages/Wards';
import History from './pages/History';
import Profile from './pages/Profile';

// Boshqa paneldan redirect bo'lib kelsa URL'dagi tokenni o'qib saqlash
(function readTokenFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('_token');
  const user = params.get('_user');
  if (token) {
    localStorage.setItem('token', token);
    localStorage.setItem('doctorLoggedIn', 'true');
    if (user) localStorage.setItem('user', user);
    window.history.replaceState({}, '', window.location.pathname);
  }
})();

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login';
    return null;
  }
  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
        <Route path="/patient/:id" element={<ProtectedRoute><PatientDetail /></ProtectedRoute>} />
        <Route path="/prescriptions" element={<ProtectedRoute><Prescriptions /></ProtectedRoute>} />
        <Route path="/lab" element={<ProtectedRoute><Lab /></ProtectedRoute>} />
        <Route path="/wards" element={<ProtectedRoute><Wards /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
