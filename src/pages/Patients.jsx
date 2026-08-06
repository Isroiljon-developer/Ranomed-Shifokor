import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import api from '../api';

const Patients = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calledPatientId, setCalledPatientId] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const data = await api.get('/reception/patients');
      setPatients(data || []);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleCallPatient = async (patient) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await api.post('/reception/call-patient', {
        patientId: patient.id,
        patientName: patient.ism,
        doctorName: user.name || 'Shifokor',
        room: user.room || '1-xona',
        filialId: user.filialId || patient.filialId || 1
      });
      setCalledPatientId(patient.id);
      setPatients(prev => prev.map(p => p.id === patient.id ? { ...p, holat: 'Chaqirildi' } : p));
    } catch (e) {
      alert('Chaqirishda xatolik yuz berdi');
    }
  };

  const filteredPatients = filter === 'all'
    ? patients
    : patients.filter(p => (p.holat || 'waiting').toLowerCase().replace(' ', '-') === filter);

  const getStatusBadge = (status) => {
    const statusMap = {
      'waiting': 'badge-waiting',
      'kutilmoqda': 'badge-waiting',
      'chaqirildi': 'badge-warning',
      'in-progress': 'badge-in-progress',
      'ko\'rilmoqda': 'badge-in-progress',
      'admitted': 'badge-admitted',
      'discharged': 'badge-discharged',
    };
    return statusMap[status?.toLowerCase()] || 'badge-waiting';
  };

  return (
    <MainLayout title="Bemorlar">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Barcha Bemorlar ({filteredPatients.length} ta)</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'waiting', 'in-progress', 'admitted', 'discharged'].map((f) => (
              <button
                key={f}
                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'Barchasi' :
                  f === 'waiting' ? 'Kutayotgan' :
                    f === 'in-progress' ? 'Ko\'rilayotgan' :
                      f === 'admitted' ? 'Yotqizilgan' : 'Chiqarilgan'}
              </button>
            ))}
          </div>
        </div>
        <div className="card-body">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Filial</th>
                  <th>Navbat</th>
                  <th>Bemor</th>
                  <th>Jins</th>
                  <th>Telefon</th>
                  <th>Status</th>
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient, index) => {
                  const isCalled = calledPatientId === patient.id || patient.holat === 'Chaqirildi';
                  return (
                    <tr 
                      key={patient.id}
                      style={isCalled ? {
                        background: '#fffbeb',
                        borderLeft: '4px solid #f59e0b',
                        boxShadow: 'inset 0 0 0 1px #fcd34d'
                      } : {}}
                    >
                      <td>{patient.Branch?.name || '-'}</td>
                      <td style={{ fontWeight: 'bold', color: isCalled ? '#d97706' : '#4f46e5', fontSize: isCalled ? 16 : 14 }}>
                        #{index + 1}
                      </td>
                      <td className="table-patient-name">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: isCalled ? 800 : 600 }}>{patient.ism}</span>
                          {isCalled && (
                            <span style={{ 
                              background: '#f59e0b', 
                              color: 'white', 
                              fontSize: '11px', 
                              fontWeight: 800, 
                              padding: '2px 8px', 
                              borderRadius: '12px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              animation: 'pulse 1.5s infinite'
                            }}>
                              ⚡ HOZIR NAVBATI KELGAN
                            </span>
                          )}
                        </div>
                      </td>
                      <td>{patient.jinsi === 'male' ? 'Erkak' : 'Ayol'}</td>
                      <td>{patient.telefon}</td>
                      <td>
                        <span className={`badge ${getStatusBadge(patient.holat || 'waiting')}`}>
                          {patient.holat || 'Kutilmoqda'}
                        </span>
                      </td>
                      <td style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-warning btn-sm"
                          style={{
                            background: isCalled ? '#d97706' : '#f59e0b',
                            color: 'white',
                            border: 'none',
                            fontWeight: 700,
                            boxShadow: isCalled ? '0 0 10px rgba(245,158,11,0.5)' : 'none'
                          }}
                          onClick={() => handleCallPatient(patient)}
                        >
                          {isCalled ? '🔄 Qayta chaqirish' : '📢 Chaqirish'}
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={async () => {
                            try {
                              await api.put(`/patient/${patient.id}`, { holat: 'Ko\'rilmoqda' });
                              setPatients(prev => prev.map(p => p.id === patient.id ? { ...p, holat: 'Ko\'rilmoqda' } : p));
                            } catch (e) {}
                            navigate(`/patient/${patient.id}`);
                          }}
                        >
                          Ochish →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.75; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}} />
    </MainLayout>
  );
};

export default Patients;

