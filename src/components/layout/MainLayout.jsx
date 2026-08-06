import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const MainLayout = ({ children, title }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title={title} />
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
