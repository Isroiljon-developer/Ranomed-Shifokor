import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { path: '/patients', icon: '👥', label: 'Bemorlar' },
    { path: '/wards', icon: '🛏️', label: 'Palatalar' },
    { path: '/history', icon: '📜', label: 'Tarix' },
    { path: '/profile', icon: '👤', label: 'Profil' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('doctorLoggedIn');
    window.location.href = '/login';
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🏥</div>
          <span className="sidebar-logo-text">Ranomed -2 </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div
            key={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-item-icon">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="nav-item" onClick={handleLogout}>
          <span className="nav-item-icon">🚪</span>
          <span>Chiqish</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

