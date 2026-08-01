import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import api from '../api';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState({
    name: '',
    specialization: '',
    phone: '',
    photo: '',
    Branch: { name: '' }
  });

  const [editData, setEditData] = useState({
    name: '',
    phone: '',
    password: ''
  });

  const [profileStats, setProfileStats] = useState({
    todayTotal: 0,
    todayCompleted: 0,
    admittedPatients: 0,
    pendingLabs: 0
  });

  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchProfile();
    fetchProfileStats();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await api.get('/auth/me');
      setUser(data);
      setEditData({
        name: data.name,
        phone: data.phone || '',
        password: ''
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileStats = async () => {
    try {
      const statsRes = await api.get('/doctor/stats');
      setProfileStats(statsRes);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put('/auth/profile', editData);
      showToast('Profil muvaffaqiyatli yangilandi');
      fetchProfile();
    } catch (error) {
      showToast('Yangilashda xatolik yuz berdi', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) return <MainLayout title="Profil"><div>Yuklanmoqda...</div></MainLayout>;

  const stats = [
    { label: 'Bugun ko\'rildi', value: profileStats.todayCompleted || 0 },
    { label: 'Palatada', value: profileStats.admittedPatients || 0 },
    { label: 'Kutayotganlar', value: profileStats.todayWaiting || 0 },
    { label: 'Analizlar', value: profileStats.pendingLabs || 0 },
  ];

  return (
    <MainLayout title="Profil">
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}> {toast.type === 'success' ? '✓' : '✗'} {toast.message}</div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '24px' }}>
        {/* Profile Card */}
        <div className="card shadow-sm border-0 rounded-lg overflow-hidden">
          <div className="card-body p-6 text-center">
            <div
              className="patient-avatar shadow-lg border-4 border-primary-light"
              style={{
                width: '120px',
                height: '120px',
                fontSize: '48px',
                margin: '0 auto 24px',
                background: 'linear-gradient(135deg, #1e88e5, #1565c0)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%'
              }}
            >
              {user.photo ? (
                <img src={`http://localhost:9000/uploads/${user.photo}`} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectCover: 'cover' }} />
              ) : (
                user.name ? user.name[0].toUpperCase() : 'D'
              )}
            </div>
            <h2 className="text-xl font-bold mb-1">{user.name}</h2>
            <p className="text-muted mb-4">{user.specialization || 'Shifokor'}</p>
            <div className="badge badge-primary mb-6">{user.role?.toUpperCase()}</div>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {stats.map((stat, index) => (
                <div key={index} style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #edf2f7' }}>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#2d3748' }}>{stat.value}</div>
                  <div style={{ fontSize: '11px', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Details Form */}
        <div className="card shadow-sm border-0 rounded-lg">
          <div className="card-header bg-white border-bottom p-4">
            <h3 className="card-title m-0">Profilni tahrirlash</h3>
          </div>
          <div className="card-body p-6">
            <form onSubmit={handleUpdate}>
              <div className="form-row">
                <div className="form-group mb-4">
                  <label className="form-label">To'liq ism</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={editData.name} 
                    onChange={e => setEditData({...editData, name: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group mb-4">
                  <label className="form-label">Mutaxassislik (Faqat Admin o'zgartira oladi)</label>
                  <input type="text" className="form-input bg-light" value={user.specialization || ''} readOnly />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group mb-4">
                  <label className="form-label">Telefon</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={editData.phone} 
                    onChange={e => setEditData({...editData, phone: e.target.value})}
                  />
                </div>
                <div className="form-group mb-4">
                  <label className="form-label">Login</label>
                  <input type="text" className="form-input bg-light" value={user.username || ''} readOnly />
                </div>
              </div>
              <div className="form-group mb-6">
                <label className="form-label">Yangi parol (ixtiyoriy)</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="O'zgartirmaslik uchun bo'sh qoldiring"
                  value={editData.password} 
                  onChange={e => setEditData({...editData, password: e.target.value})}
                />
              </div>
              <div className="flex items-center gap-4">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saqlanmoqda...' : 'O\'zgarishlarni saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;

