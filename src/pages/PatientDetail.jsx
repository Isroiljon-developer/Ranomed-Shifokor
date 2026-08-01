import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import api from '../api';

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [showWardModal, setShowWardModal] = useState(false);
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [labResults, setLabResults] = useState([]);
  const [sendingToReception, setSendingToReception] = useState(false);
  const [sentToReception, setSentToReception] = useState(false);

  const [complaint, setComplaint] = useState('');
  const [anamnesis, setAnamnesis] = useState('');
  const [allergy, setAllergy] = useState('');
  const [mainDiagnosis, setMainDiagnosis] = useState('');
  const [additionalDiagnosis, setAdditionalDiagnosis] = useState('');

  const [prescriptions, setPrescriptions] = useState([
    { id: Date.now(), medicine: '', dose: '', frequency: '', days: '' }
  ]);

  // Ward modal state
  const [wardNote, setWardNote] = useState('');
  const [wardDays, setWardDays] = useState(5);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pData, rxData, labs] = await Promise.all([
          api.get(`/patient/${id}`).catch(err => { console.error('Patient get err:', err); return null; }),
          api.get(`/medical/prescription/patient/${id}`).catch(err => { console.error('Prescription get err:', err); return []; }),
          api.get(`/lab/orders?patientId=${id}`).catch(err => { console.error('Lab get err:', err); return []; })
        ]);

        if (pData) setPatient(pData);
        setLabResults(Array.isArray(labs) ? labs : []);

        if (Array.isArray(rxData) && rxData.length > 0) {
          setPrescriptions(rxData.map(r => ({
            id: r.id,
            medicine: r.doriNomi,
            dose: r.dozasi,
            frequency: (r.kunlikSoni || '').toString(),
            days: r.davomiyligi || ''
          })));
        }

        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const addPrescriptionRow = () => {
    setPrescriptions([...prescriptions, {
      id: Date.now(),
      medicine: '',
      dose: '',
      frequency: '',
      days: ''
    }]);
  };

  const removePrescriptionRow = (rowId) => {
    if (prescriptions.length > 1) {
      setPrescriptions(prescriptions.filter(p => p.id !== rowId));
    }
  };

  const updatePrescription = (rowId, field, value) => {
    setPrescriptions(prescriptions.map(p =>
      p.id === rowId ? { ...p, [field]: value } : p
    ));
  };

  const savePrescription = async () => {
    try {
      for (const rx of prescriptions) {
        if (rx.medicine) {
          await api.post('/medical/prescription', {
            patientId: id,
            shifokorId: JSON.parse(localStorage.getItem('user') || '{}').id || 1,
            doriNomi: rx.medicine,
            dozasi: rx.dose,
            kunlikSoni: parseInt(rx.frequency) || 1,
            davomiyligi: rx.days
          });
        }
      }
      showToast('Retsept saqlandi va hamshiraga yuborildi');
    } catch (error) {
      showToast('Xatolik yuz berdi', 'error');
    }
  };

  // "Palataga yotqizish" - endi qabulxonaga xabar yuboradi
  const sendToReceptionForWard = async () => {
    setSendingToReception(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await api.post('/reception/ward-request', {
        patientId: id,
        doctorId: user.id || 1,
        doctorName: user.name || 'Shifokor',
        note: wardNote,
        recommendedDays: wardDays,
        diagnosis: mainDiagnosis || 'Tashxis qo\'yilmagan'
      });
      setSentToReception(true);
      showToast('✅ Qabulxonaga yuborildi! Palata biriktirishadi.');
      setShowWardModal(false);
    } catch (error) {
      showToast('Xatolik: ' + error.message, 'error');
    } finally {
      setSendingToReception(false);
    }
  };

  const confirmDischarge = async () => {
    try {
      await api.put(`/patient/${id}`, { holat: 'Chiqarilgan' });
      showToast('Bemor chiqarildi');
      setShowDischargeModal(false);
      navigate('/patients');
    } catch (error) {
      showToast('Xatolik yuz berdi', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'Waiting': 'badge-waiting',
      'In Progress': 'badge-in-progress',
      'Admitted': 'badge-admitted',
      'Discharged': 'badge-discharged',
    };
    return statusMap[status] || 'badge-waiting';
  };

  if (loading) {
    return (
      <MainLayout title="Bemor Ma'lumotlari">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', fontSize: '18px', color: '#888' }}>
          ⏳ Yuklanmoqda...
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Bemor Ma'lumotlari">
      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            {toast.type === 'success' ? '✓' : '✕'} {toast.message}
          </div>
        </div>
      )}

      {/* Patient Header */}
      <div className="patient-header">
        <div className="patient-avatar">
          {patient?.ism?.split(' ').map(n => n[0]).join('') || '?'}
        </div>
        <div className="patient-info">
          <h2>
            {patient?.ism}
            <span className={`badge ${getStatusBadge(patient?.holat || 'Waiting')}`} style={{ marginLeft: '12px' }}>
              {patient?.holat || 'Kutilmoqda'}
            </span>
            {sentToReception && (
              <span style={{ marginLeft: '12px', background: '#d1fae5', color: '#065f46', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
                🏥 Qabulxonaga yuborildi
              </span>
            )}
          </h2>
          <div className="patient-meta">
            <span>🎂 {patient?.yosh} yosh</span>
            <span>👤 {patient?.jinsi}</span>
            <span>📞 {patient?.tel}</span>
            <span>🏥 {patient?.Branch?.nomi || 'Filial'}</span>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
          <button
            className="btn btn-success"
            onClick={() => setShowWardModal(true)}
            disabled={sentToReception}
          >
            🛏️ {sentToReception ? 'Yuborildi' : 'Palataga yotqizish'}
          </button>
          <button className="btn btn-danger" onClick={() => setShowDischargeModal(true)}>
            🚪 Chiqarish
          </button>
        </div>
      </div>

      <div className="patient-grid">
        {/* Left Column */}
        <div>
          {/* Complaint & Anamnesis */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Shikoyat va Anamnez</h3>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Shikoyat</label>
                <textarea
                  className="form-textarea"
                  placeholder="Bemor nimadan shikoyat qilyapti..."
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Anamnez (oldingi kasalliklar)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Oldingi kasalliklar tarixi..."
                  value={anamnesis}
                  onChange={(e) => setAnamnesis(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Allergiya</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Allergiyalar..."
                  value={allergy}
                  onChange={(e) => setAllergy(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Diagnosis */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Tashxis</h3>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Asosiy tashxis</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Asosiy tashxis..."
                  value={mainDiagnosis}
                  onChange={(e) => setMainDiagnosis(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Qo'shimcha tashxis</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Qo'shimcha tashxis..."
                  value={additionalDiagnosis}
                  onChange={(e) => setAdditionalDiagnosis(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Prescription */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Retsept</h3>
              <button className="btn btn-secondary btn-sm" onClick={addPrescriptionRow}>
                + Qo'shish
              </button>
            </div>
            <div className="card-body">
              {prescriptions.map((rx) => (
                <div key={rx.id} className="prescription-row">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Dori nomi"
                    value={rx.medicine}
                    onChange={(e) => updatePrescription(rx.id, 'medicine', e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Doza"
                    value={rx.dose}
                    onChange={(e) => updatePrescription(rx.id, 'dose', e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Necha mahal"
                    value={rx.frequency}
                    onChange={(e) => updatePrescription(rx.id, 'frequency', e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Kun"
                    value={rx.days}
                    onChange={(e) => updatePrescription(rx.id, 'days', e.target.value)}
                  />
                  <button
                    className="remove-btn"
                    onClick={() => removePrescriptionRow(rx.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <div className="form-actions">
                <button className="btn btn-success" onClick={savePrescription}>
                  💾 Saqlash va Hamshiraga yuborish
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* Ward Request Info */}
          {sentToReception && (
            <div className="card" style={{ marginTop: '24px', border: '2px solid #10b981' }}>
              <div className="card-body" style={{ textAlign: 'center', padding: '30px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏥</div>
                <h3 style={{ color: '#065f46', fontWeight: '700', marginBottom: '8px' }}>
                  Qabulxonaga yuborildi
                </h3>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  Qabulxona bo'sh palatani biriktirib, pasport ma'lumotlarini kiritadi.
                  Keyin kassirga 5 kunlik to'lov uchun yuboriladi.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ward Request Modal - endi qabulxonaga yuborish uchun */}
      {showWardModal && (
        <div className="modal-overlay" onClick={() => setShowWardModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">🛏️ Palataga Yotqizish Talabi</h3>
              <button className="modal-close" onClick={() => setShowWardModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}>
                <span style={{ fontSize: '24px' }}>ℹ️</span>
                <div>
                  <p style={{ fontWeight: '600', color: '#1e40af', margin: '0 0 4px' }}>
                    Palata tanlash qabulxona vazifasi
                  </p>
                  <p style={{ color: '#3b82f6', fontSize: '13px', margin: 0 }}>
                    Siz "Tasdiqlash" bosganda, qabulxonaga xabar ketadi. 
                    Ular bo'sh palatani tanlab, pasport ma'lumotlarini kiritadi.
                    Keyin kassirga to'lov uchun yuboriladi.
                  </p>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Asosiy tashxis *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Tashxis yozing..."
                  value={mainDiagnosis}
                  onChange={(e) => setMainDiagnosis(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tavsiya etiladigan kun soni</label>
                <input
                  type="number"
                  className="form-input"
                  value={wardDays}
                  onChange={(e) => setWardDays(parseInt(e.target.value) || 1)}
                  min="1"
                  max="60"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Qo'shimcha izoh (ixtiyoriy)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Qabulxonaga izoh yozing..."
                  value={wardNote}
                  onChange={(e) => setWardNote(e.target.value)}
                  rows={3}
                />
              </div>

              <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '14px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b', fontSize: '14px' }}>Bemor:</span>
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>{patient?.ism}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontSize: '14px' }}>Tavsiya (kun):</span>
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>{wardDays} kun</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowWardModal(false)}>
                Bekor qilish
              </button>
              <button
                className="btn btn-success"
                onClick={sendToReceptionForWard}
                disabled={sendingToReception || !mainDiagnosis}
              >
                {sendingToReception ? '⏳ Yuborilmoqda...' : '✅ Qabulxonaga yuborish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discharge Modal */}
      {showDischargeModal && (
        <div className="modal-overlay" onClick={() => setShowDischargeModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Bemorni Chiqarish</h3>
              <button className="modal-close" onClick={() => setShowDischargeModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Yakuniy tashxis</label>
                <textarea className="form-textarea" placeholder="Yakuniy tashxis..." />
              </div>
              <div className="form-group">
                <label className="form-label">Tavsiyalar</label>
                <textarea className="form-textarea" placeholder="Uyda parvarish uchun tavsiyalar..." />
              </div>
              <div className="form-group">
                <label className="form-label">Davom ettirish kerak bo'lgan dorilar</label>
                <textarea className="form-textarea" placeholder="Dorilar ro'yxati..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDischargeModal(false)}>
                Bekor qilish
              </button>
              <button className="btn btn-danger" onClick={confirmDischarge}>
                🚪 Chiqarish
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default PatientDetail;
