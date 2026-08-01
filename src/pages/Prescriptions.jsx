import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import api from '../api';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const data = await api.get('/doctor/prescriptions');
        setPrescriptions(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  return (
    <MainLayout title="Retseptlar">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Barcha Retseptlar</h3>
        </div>
        <div className="card-body">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Sana</th>
                  <th>Bemor</th>
                  <th>Dorilar</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((rx) => (
                  <tr key={rx.id}>
                    <td>{new Date(rx.createdAt).toLocaleDateString()}</td>
                    <td className="table-patient-name">{rx.Patient?.ism || 'Noma\'lum'}</td>
                    <td>
                      {Array.isArray(rx.medications) ? rx.medications.map((med, i) => (
                        <div key={i} style={{ fontSize: '13px' }}>
                          {med.name} {med.dose} ({med.frequency})
                        </div>
                      )) : typeof rx.medications === 'string' ? rx.medications : 'Ma\'lumot yo\'q'}
                    </td>
                    <td>
                      <span className={`badge ${rx.status === 'active' ? 'badge-in-progress' : 'badge-discharged'}`}>
                        {rx.status === 'active' ? 'Faol' : 'Tugallangan'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-outline btn-sm">Ko'rish</button>
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

export default Prescriptions;
