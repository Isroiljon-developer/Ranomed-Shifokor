import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import api from '../api';

const History = () => {
  const [history, setHistory] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api.get('/doctor/appointments?history=true');
        setHistory(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getStatusType = (status) => {
    switch (status) {
      case 'COMPLETED': return 'visit';
      case 'waiting': return 'visit';
      case 'admitted': return 'admission';
      default: return 'visit';
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      visit: '🩺',
      lab: '🧪',
      admission: '🛏️',
      discharge: '🚪',
    };
    return icons[type] || '📋';
  };

  const getTypeBadge = (type) => {
    const badges = {
      visit: 'badge-in-progress',
      lab: 'badge-ready',
      admission: 'badge-admitted',
      discharge: 'badge-discharged',
    };
    return badges[type] || 'badge-pending';
  };

  const getTypeLabel = (type) => {
    const labels = {
      visit: 'Qabul',
      lab: 'Lab',
      admission: 'Yotqizish',
      discharge: 'Chiqarish',
    };
    return labels[type] || type;
  };

  return (
    <MainLayout title="Tarix">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Faoliyat Tarixi</h3>
        </div>
        <div className="card-body">
          <div className="timeline">
            {history.map((item) => {
              const type = getStatusType(item.status);
              return (
                <div key={item.id} className="timeline-item">
                  <div className={`timeline-dot ${item.status === 'COMPLETED' ? 'ready' : 'pending'}`}></div>
                  <div className="timeline-content">
                    <div className="timeline-time">{item.sana} {item.vaqt}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '20px' }}>{getTypeIcon(type)}</span>
                      <span className="table-patient-name">{item.Patient?.ism || 'Noma\'lum'}</span>
                      <span className={`badge ${getTypeBadge(type)}`}>
                        {getTypeLabel(type)}
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      Status: {item.status} {item.Patient?.telefon ? `| Tel: ${item.Patient.telefon}` : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default History;
