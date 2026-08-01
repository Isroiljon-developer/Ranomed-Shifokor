import React, { useState } from 'react';

const Topbar = ({ title }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const doctorName = localStorage.getItem('doctorName') || 'Doctor';

  const notifications = [
    { id: 1, text: 'Aliyev uchun yangi lab natijasi tayyor', time: '5 daqiqa oldin' },
    { id: 2, text: 'Hamshira dori statusini yangiladi', time: '15 daqiqa oldin' },
    { id: 3, text: 'Karimov to\'lovi kutilmoqda', time: '30 daqiqa oldin' },
    { id: 4, text: 'Bugun 2 ta bemor discharge', time: '1 soat oldin' },
  ];

  return (
    <div className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{title}</h1>
      </div>

      <div className="topbar-right">
        <div style={{ position: 'relative' }}>
          <button 
            className="notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            🔔
            <span className="notification-badge">{notifications.length}</span>
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notifications-header">Bildirishnomalar</div>
              {notifications.map((notif) => (
                <div key={notif.id} className="notification-item">
                  <div className="notification-text">{notif.text}</div>
                  <div className="notification-time">{notif.time}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="user-menu">
          <div className="user-avatar">
            {doctorName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="user-info">
            <div className="user-name">{doctorName}</div>
            <div className="user-role">Shifokor</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
