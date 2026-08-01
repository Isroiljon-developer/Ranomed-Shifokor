import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userStr = params.get('user');

    if (token && userStr) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', userStr);
      navigate('/dashboard');
    } else {
      window.location.href = 'http://localhost:5173/login';
    }
  }, [navigate, location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md text-center">
        <h2 className="text-xl font-bold mb-4">Tizimga yo'naltirilmoqda...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
}

export default Login;
