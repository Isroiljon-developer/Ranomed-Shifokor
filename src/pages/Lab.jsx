import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import api from '../api';

const Lab = () => {
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);

  const [labOrders, setLabOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLabTests = async () => {
      try {
        const data = await api.get('/doctor/lab-tests');
        setLabOrders(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchLabTests();
  }, []);

  const filteredOrders = filter === 'all'
    ? labOrders
    : labOrders.filter(o => {
      const s = o.status?.toLowerCase();
      if (filter === 'pending') return s === 'ordered';
      return s === filter;
    });

  const readyCount = labOrders.filter(o => o.status?.toLowerCase() === 'ready').length;
  const pendingCount = labOrders.filter(o => o.status?.toLowerCase() === 'ordered').length;

  const handleViewResult = (order) => {
    setSelectedOrder(order);
    setShowResultModal(true);
  };

  return (
    <MainLayout title="Laboratoriya">
      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeft: '4px solid #2563eb' }}>
          <div className="stat-icon blue">🧪</div>
          <div className="stat-content">
            <div className="stat-value">{labOrders.length}</div>
            <div className="stat-label">Jami buyurtmalar</div>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #16a34a' }}>
          <div className="stat-icon green">✅</div>
          <div className="stat-content">
            <div className="stat-value">{readyCount}</div>
            <div className="stat-label">Tayyor natijalar</div>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="stat-icon yellow">⏳</div>
          <div className="stat-content">
            <div className="stat-value">{pendingCount}</div>
            <div className="stat-label">Kutilmoqda</div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🧪 Lab Buyurtmalarim</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'pending', 'ready'].map((f) => (
              <button
                key={f}
                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'Barchasi' : f === 'pending' ? 'Kutilmoqda' : 'Tayyor'}
              </button>
            ))}
          </div>
        </div>
        <div className="card-body">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Vaqt</th>
                  <th>Bemor</th>
                  <th>Tahlil</th>
                  <th>Status</th>
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🕐 {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="patient-avatar-small">👤</div>
                        <span className="table-patient-name">{order.Patient?.ism || 'Noma\'lum'}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🧪 {order.testType}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${order.status?.toLowerCase() === 'ready' ? 'badge-ready' : 'badge-pending'}`}>
                        {order.status?.toLowerCase() === 'ready' ? '✓ Tayyor' : '⏳ Kutilmoqda'}
                      </span>
                    </td>
                    <td>
                      {order.status?.toLowerCase() === 'ready' && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleViewResult(order)}
                        >
                          👁️ Natijani ko'rish
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Results Modal */}
      {showResultModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowResultModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">🧪 {selectedOrder.test} - Natijalar</h3>
              <button className="modal-close" onClick={() => setShowResultModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {/* Patient Info */}
              <div className="patient-info-box blue">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="patient-avatar-medium">👤</div>
                  <div>
                    <strong>{selectedOrder.Patient?.ism || 'Noma\'lum'}</strong>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                      Buyurtma vaqti: {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Results */}
              {selectedOrder.results && (
                <div className="results-box">
                  <h4>📋 Tahlil natijalari:</h4>
                  <div className="results-list">
                    {Object.entries(selectedOrder.results).map(([key, value]) => {
                      if (key === 'doctor' || key === 'date') return null;
                      return (
                        <div key={key} className="result-row">
                          <span>{key.replace(/_/g, ' ')}:</span>
                          <strong>{value}</strong>
                        </div>
                      );
                    })}
                  </div>
                  <div className="result-footer">
                    <span>Shifokor: {selectedOrder.results.doctor}</span>
                    <span>Sana: {selectedOrder.results.date}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowResultModal(false)}>Yopish</button>
              <button className="btn btn-primary">📄 PDF yuklash</button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Lab;
