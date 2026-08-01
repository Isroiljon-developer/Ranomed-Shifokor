import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState([
    { label: "Bugun ko'rildi", value: 0, icon: '✅', color: 'green' },
    { label: 'Palatada yotgan', value: 0, icon: '🛏️', color: 'blue' },
    { label: 'Navbatda kutayotgan', value: 0, icon: '⏳', color: 'yellow' },
    { label: 'Kutilayotgan natija', value: 0, icon: '🧪', color: 'red' },
  ]);

  const [todayPatients, setTodayPatients] = useState([]);
  const [waitingCount, setWaitingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // Har 30 sekundda yangilanadi
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [appointments, statsRes] = await Promise.all([
        api.get('/doctor/appointments'),
        api.get('/doctor/stats')
      ]);

      const apptList = appointments || [];
      setTodayPatients(apptList);

      const waiting = apptList.filter(a => a.status === 'waiting' || a.status === 'WAITING').length;
      setWaitingCount(waiting);

      setStats([
        { label: "Bugun ko'rildi", value: statsRes.todayCompleted || 0, icon: '✅', color: 'green' },
        { label: 'Palatada yotgan', value: statsRes.admittedPatients || 0, icon: '🛏️', color: 'blue' },
        { label: 'Navbatda kutayotgan', value: waiting, icon: '⏳', color: 'yellow', highlight: waiting > 0 },
        { label: 'Kutilayotgan natija', value: statsRes.pendingLabs || 0, icon: '🧪', color: 'red' },
      ]);

      setLoading(false);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      'waiting': { bg: '#fef3c7', color: '#92400e', label: 'Kutmoqda' },
      'WAITING': { bg: '#fef3c7', color: '#92400e', label: 'Kutmoqda' },
      'COMPLETED': { bg: '#d1fae5', color: '#065f46', label: 'Ko\'rildi' },
      'completed': { bg: '#d1fae5', color: '#065f46', label: 'Ko\'rildi' },
      'IN_PROGRESS': { bg: '#dbeafe', color: '#1e40af', label: 'Ko\'rilmoqda' },
      'in-progress': { bg: '#dbeafe', color: '#1e40af', label: 'Ko\'rilmoqda' },
    };
    return map[status] || { bg: '#f1f5f9', color: '#475569', label: status || 'Noma\'lum' };
  };

  return (
    <MainLayout title="Dashboard">
      {/* Stats */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="stat-card"
            style={stat.highlight ? {
              borderColor: '#f59e0b',
              boxShadow: '0 0 0 2px rgba(245,158,11,0.2)',
              animation: 'pulse-border 2s infinite'
            } : {}}
          >
            <div className={`stat-icon ${stat.color}`} style={{ fontSize: 24 }}>{stat.icon}</div>
            <div style={{ flex: 1 }}>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value" style={stat.highlight ? { color: '#d97706' } : {}}>{stat.value}</div>
              {stat.highlight && (
                <div style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', marginTop: 4 }}>
                  ⚡ Hozir navbatda
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Queue overview banner */}
      {waitingCount > 0 && (
        <div style={{
          marginBottom: 24,
          padding: '16px 22px',
          background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
          border: '1.5px solid #fcd34d',
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: '#f59e0b', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, flexShrink: 0,
              boxShadow: '0 4px 12px rgba(245,158,11,0.35)'
            }}>⏳</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#92400e' }}>
                Navbatda {waitingCount} ta bemor kutmoqda!
              </div>
              <div style={{ fontSize: 12, color: '#b45309', marginTop: 2 }}>
                Birinchi bemorni qabul qiling
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/patients')}
            style={{
              padding: '10px 20px',
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 13,
              boxShadow: '0 4px 12px rgba(245,158,11,0.3)'
            }}
          >
            Ko'rish →
          </button>
        </div>
      )}

      {/* Today Patients Table */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h3 className="card-title">Bugungi Bemorlar</h3>
            {todayPatients.length > 0 && (
              <span style={{
                background: '#6366f1', color: 'white',
                fontSize: 11, fontWeight: 700,
                padding: '3px 10px', borderRadius: 20
              }}>
                {todayPatients.length} ta
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, color: '#10b981',
              background: '#d1fae5', padding: '4px 10px', borderRadius: 20,
              display: 'flex', alignItems: 'center', gap: 4
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#10b981', display: 'inline-block',
                animation: 'pulse 2s infinite'
              }}></span>
              Jonli
            </span>
            <button
              onClick={fetchData}
              style={{
                padding: '6px 12px', borderRadius: 8, border: '1px solid #e2e8f0',
                background: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                fontFamily: 'inherit', color: '#64748b'
              }}
            >
              🔄 Yangilash
            </button>
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              Yuklanmoqda...
            </div>
          ) : todayPatients.length === 0 ? (
            <div style={{ padding: '60px 40px', textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>👋</div>
              <p style={{ fontSize: 15, fontWeight: 600 }}>Bugun hali bemorlar yo'q</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>Qabulxonadan bemor qo'shilishi kutilmoqda</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.7, borderBottom: '1px solid #e2e8f0' }}>Navbat</th>
                  <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.7, borderBottom: '1px solid #e2e8f0' }}>Bemor</th>
                  <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.7, borderBottom: '1px solid #e2e8f0' }}>Vaqt</th>
                  <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.7, borderBottom: '1px solid #e2e8f0' }}>Status</th>
                  <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.7, borderBottom: '1px solid #e2e8f0' }}></th>
                </tr>
              </thead>
              <tbody>
                {todayPatients.map((app, idx) => {
                  const statusInfo = getStatusBadge(app.status);
                  const isWaiting = app.status === 'waiting' || app.status === 'WAITING';
                  return (
                    <tr
                      key={app.id}
                      style={{
                        background: isWaiting ? '#fffbeb' : 'white',
                        borderBottom: '1px solid #f8fafc'
                      }}
                    >
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: isWaiting ? '#f59e0b' : '#e2e8f0',
                          color: isWaiting ? 'white' : '#64748b',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, fontSize: 13
                        }}>
                          {app.navbat || idx + 1}
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 800, fontSize: 14, flexShrink: 0
                          }}>
                            {(app.Patient?.ism || 'B').charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{app.Patient?.ism || 'Noma\'lum'}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>{app.Patient?.telefon || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: '#475569', fontWeight: 500 }}>
                        {app.vaqt || '-'}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          padding: '5px 12px', borderRadius: 20,
                          fontSize: 11, fontWeight: 700,
                          background: statusInfo.bg, color: statusInfo.color
                        }}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <button
                          onClick={() => navigate(`/patient/${app.patientId}`)}
                          style={{
                            padding: '8px 16px',
                            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 10,
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: 12,
                            fontFamily: 'inherit',
                            boxShadow: '0 3px 10px rgba(99,102,241,0.25)'
                          }}
                        >
                          Ko'rish →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
