import React from 'react';
import './EventDetailModal.css';

const EventDetailModal = ({ event, onClose }) => {
  if (!event) return null;

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('he-IL');
  };

  const getEventColor = (event) => {
    const colors = {
      call: '#3498db',
      installation: '#27ae60',
      visit: '#f39c12',
      website: '#9b59b6',
      digital: event.channel === 'WhatsApp' ? '#e91e63' : event.channel === 'Facebook' ? '#3b5998' : '#673ab7',
    };
    return colors[event.event_type] || '#95a5a6';
  };

  const eventColor = getEventColor(event);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ borderTopColor: eventColor }}>
        <div className="modal-header" style={{ borderBottomColor: eventColor }}>
          <h2>{event.event_title}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="event-detail-section">
            <h3>פרטי האירוע</h3>
            <div className="detail-row">
              <span className="detail-label">סוג אירוע:</span>
              <span className="detail-value" style={{ color: eventColor, fontWeight: '600' }}>
                {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">תאריך ושעה:</span>
              <span className="detail-value">{formatDateTime(event.event_time)}</span>
            </div>
            {event.description && (
              <div className="detail-row">
                <span className="detail-label">תיאור:</span>
                <span className="detail-value">{event.description}</span>
              </div>
            )}
          </div>

          {event.status && (
            <div className="event-detail-section">
              <h3>סטטוס</h3>
              <div className="detail-row">
                <span className="detail-label">סטטוס נוכחי:</span>
                <span className="detail-value status-badge" style={{ backgroundColor: eventColor, color: 'white' }}>
                  {event.status}
                </span>
              </div>
            </div>
          )}

          {(event.call_duration || event.call_type || event.channel) && (
            <div className="event-detail-section">
              <h3>פרטים נוספים</h3>
              {event.call_duration && (
                <div className="detail-row">
                  <span className="detail-label">משך זמן:</span>
                  <span className="detail-value">{event.call_duration} שניות</span>
                </div>
              )}
              {event.call_type && (
                <div className="detail-row">
                  <span className="detail-label">סוג שיחה:</span>
                  <span className="detail-value">{event.call_type}</span>
                </div>
              )}
              {event.channel && (
                <div className="detail-row">
                  <span className="detail-label">ערוץ:</span>
                  <span className="detail-value">{event.channel}</span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="modal-button" onClick={onClose}>סגור</button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;

