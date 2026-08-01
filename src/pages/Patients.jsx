import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import api from '../api';

const Patients = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchPatients();
  }, []);

  const filteredPatients = filter === 'all'
    ? patients
    : patients.filter(p => (p.holat || 'waiting').toLowerCase().replace(' ', '-') === filter);

  const getStatusBadge = (status) => {
    const statusMap = {
      'waiting': 'badge-waiting',
      'in-progress': 'badge-in-progress',
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
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient, index) => (
                  <tr key={patient.id}>
                    <td>{patient.Branch?.name || '-'}</td>
                    <td style={{ fontWeight: 'bold', color: '#4f46e5' }}>#{index + 1}</td>
                    <td className="table-patient-name">{patient.ism}</td>
                    <td>{patient.jinsi === 'male' ? 'Erkak' : 'Ayol'}</td>
                    <td>{patient.telefon}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(patient.holat || 'waiting')}`}>
                        {patient.holat || 'Kutilmoqda'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={async () => {
                          try {
                            await api.put(`/patient/${patient.id}`, { holat: 'Ko\'rilmoqda' });
                            setPatients(prev => prev.map(p => p.id === patient.id ? {...p, holat: 'Ko\'rilmoqda'} : p));
                          } catch(e) {}
                          navigate(`/patient/${patient.id}`);
                        }}
                      >
                        Ochish
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Patients;
