import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import api from '../api';

const Wards = () => {
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchWards = async () => {
      try {
        const data = await api.get('/doctor/wards');
        setWards(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchWards();
  }, []);

  const [selectedWard, setSelectedWard] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editForm, setEditForm] = useState({});

  const formatPrice = (price) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + " so'm/kun";
  };

  const handleCardClick = (ward) => {
    setSelectedWard(ward);
    setShowDetailModal(true);
  };

  const handleEdit = (e, ward) => {
    e.stopPropagation();
    setSelectedWard(ward);
    setEditForm({
      room: ward.room,
      type: ward.type,
      branch: ward.branch,
      beds: ward.beds,
      price: ward.price
    });
    setShowEditModal(true);
  };

  const handleDelete = (e, ward) => {
    e.stopPropagation();
    setSelectedWard(ward);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setWards(wards.filter(w => w.id !== selectedWard.id));
    setShowDeleteModal(false);
    setSelectedWard(null);
  };

  const saveEdit = () => {
    setWards(wards.map(w =>
      w.id === selectedWard.id
        ? { ...w, ...editForm }
        : w
    ));
    setShowEditModal(false);
    setSelectedWard(null);
  };

  const dischargePatient = () => {
    setWards(wards.map(w =>
      w.id === selectedWard.id
        ? { ...w, patient: null, occupied: false }
        : w
    ));
    setShowDetailModal(false);
    setSelectedWard(null);
  };

  const occupiedCount = wards.filter(w => w.Occupants?.length > 0).length;
  const emptyCount = wards.filter(w => !w.Occupants?.length).length;

  return (
    <MainLayout title="Palatalar">
      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeft: '4px solid #dc2626' }}>
          <div className="stat-icon red">🛏️</div>
          <div className="stat-content">
            <div className="stat-value">{occupiedCount}</div>
            <div className="stat-label">Band palatalar</div>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #16a34a' }}>
          <div className="stat-icon green">🏠</div>
          <div className="stat-content">
            <div className="stat-value">{emptyCount}</div>
            <div className="stat-label">Bo'sh palatalar</div>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #2563eb' }}>
          <div className="stat-icon blue">📋</div>
          <div className="stat-content">
            <div className="stat-value">{wards.length}</div>
            <div className="stat-label">Jami palatalar</div>
          </div>
        </div>
      </div>

      {/* Ward Cards Grid */}
      <div className="ward-grid">
        {wards.map((ward) => {
          const occupied = ward.Occupants?.length > 0;
          return (
            <div
              key={ward.id}
              className={`ward-card-new ${occupied ? 'occupied' : 'empty'}`}
              onClick={() => handleCardClick(ward)}
            >
              {/* Header */}
              <div className="ward-card-top">
                <div className={`ward-icon ${occupied ? 'red' : 'green'}`}>🛏️</div>
                <div className="ward-title">
                  <h3>Palata #{ward.name || ward.room}</h3>
                  <span className="ward-type-label">{ward.type}</span>
                </div>
              </div>

              {/* Info */}
              <div className="ward-info">
                <div className="ward-info-row">
                  <span>🏢 {ward.Branch?.name || ward.branch}</span>
                </div>
                <div className="ward-info-row between">
                  <span>O'rinlar:</span>
                  <strong>{ward.capacity}</strong>
                </div>
                <div className="ward-info-row between">
                  <span>Narxi:</span>
                  <strong className="price">{formatPrice(ward.price_per_day)}</strong>
                </div>
              </div>

              {/* Footer */}
              <div className="ward-card-footer">
                <span className={`ward-status ${occupied ? 'band' : 'bosh'}`}>
                  {occupied ? 'Band' : "Bo'sh"}
                </span>
                <div className="ward-actions">
                  <button className="action-btn edit" onClick={(e) => handleEdit(e, ward)}>✏️</button>
                  <button className="action-btn delete" onClick={(e) => handleDelete(e, ward)}>🗑️</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedWard && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">🛏️ Palata #{selectedWard.room} - {selectedWard.type}</h3>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="info-grid">
                <div className="info-item">
                  <label>Filial</label>
                  <span>{selectedWard.Branch?.name || selectedWard.branch}</span>
                </div>
                <div className="info-item">
                  <label>O'rinlar soni</label>
                  <span>{selectedWard.capacity}</span>
                </div>
                <div className="info-item">
                  <label>Kunlik narx</label>
                  <span className="price">{formatPrice(selectedWard.price_per_day)}</span>
                </div>
                <div className="info-item">
                  <label>Holati</label>
                  <span className={`ward-status ${selectedWard.Occupants?.length > 0 ? 'band' : 'bosh'}`}>
                    {selectedWard.Occupants?.length > 0 ? 'Band' : "Bo'sh"}
                  </span>
                </div>
              </div>

              {selectedWard.Occupants?.map((occ, idx) => (
                <div key={occ.id} className="patient-info-box" style={{ marginTop: '16px' }}>
                  <h4>👤 Bemor ma'lumotlari {selectedWard.Occupants.length > 1 ? `#${idx + 1}` : ''}</h4>
                  <div className="patient-details">
                    <div className="detail-row">
                      <span>Ism:</span>
                      <strong>{occ.Patient?.ism}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Telefon:</span>
                      <strong>{occ.Patient?.telefon}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Qabul sanasi:</span>
                      <strong>{new Date(occ.admissionDate).toLocaleDateString()}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Kutilayotgan kunlar:</span>
                      <strong>{occ.expectedDays} kun</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              {selectedWard.occupied && (
                <button className="btn btn-danger" onClick={dischargePatient}>Bemorni chiqarish</button>
              )}
              <button className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>Yopish</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedWard && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Palatani tahrirlash</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Xona raqami</label>
                  <input
                    className="form-input"
                    value={editForm.room || ''}
                    onChange={(e) => setEditForm({ ...editForm, room: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Turi</label>
                  <select
                    className="form-select"
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                  >
                    <option value="Ekonom">Ekonom</option>
                    <option value="Standart">Standart</option>
                    <option value="Lyuks">Lyuks</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Filial</label>
                <select
                  className="form-select"
                  value={editForm.branch}
                  onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                >
                  <option value="Chilonzor filiali">Chilonzor filiali</option>
                  <option value="Yunusobod filiali">Yunusobod filiali</option>
                  <option value="Sergeli filiali">Sergeli filiali</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">O'rinlar soni</label>
                  <input
                    className="form-input"
                    type="number"
                    value={editForm.capacity || ''}
                    onChange={(e) => setEditForm({ ...editForm, capacity: parseInt(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Kunlik narx (so'm)</label>
                  <input
                    className="form-input"
                    type="number"
                    value={editForm.price_per_day || ''}
                    onChange={(e) => setEditForm({ ...editForm, price_per_day: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Bekor qilish</button>
              <button className="btn btn-primary" onClick={saveEdit}>Saqlash</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedWard && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Palatani o'chirish</h3>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ color: '#6b7280' }}>
                Palata #{selectedWard.room}ni o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Bekor qilish</button>
              <button className="btn btn-danger" onClick={confirmDelete}>O'chirish</button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Wards;
