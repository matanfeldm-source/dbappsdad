import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import StatusIcon from '../components/StatusIcon';
import NextBestAction from '../components/NextBestAction';
import DateTimeline from '../components/DateTimeline';
import EventCalendar from '../components/EventCalendar';
import EventDetailModal from '../components/EventDetailModal';
import './CustomerJourney.css';

const CustomerJourney = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [journey, setJourney] = useState([]);
  const [summary, setSummary] = useState(null);
  const [nextAction, setNextAction] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'calendar'

  useEffect(() => {
    fetchCustomerData();
  }, [id]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const [customerRes, journeyRes, summaryRes, actionRes] = await Promise.all([
        axios.get(`/api/customers/${id}`),
        axios.get(`/api/journey/${id}`),
        axios.get(`/api/customers/${id}/summary`),
        axios.get(`/api/customers/${id}/next-action`),
      ]);

      setCustomer(customerRes.data);
      setJourney(journeyRes.data);
      setSummary(summaryRes.data);
      setNextAction(actionRes.data);
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  if (loading) {
    return <div className="loading">טוען מסע לקוח...</div>;
  }

  if (!customer) {
    return <div className="error">לקוח לא נמצא</div>;
  }

  return (
    <div className="customer-journey-page">
      <div className="journey-header">
        <button onClick={() => navigate('/')} className="back-button">← חזרה לסקירה</button>
        <h1>מסע של {customer.name}</h1>
        <StatusIcon status={customer.status} size="large" />
      </div>

      <div className="journey-layout">
        {/* Top Section - Summary and Actions */}
        <div className="journey-sidebar">
          <div className="summary-section">
            <h2>סיכום AI</h2>
            <div className="summary-text">
              {summary?.summary_text || 'אין סיכום זמין'}
            </div>
            {summary?.generated_at && (
              <div className="summary-meta">
                נוצר: {new Date(summary.generated_at).toLocaleString('he-IL')}
              </div>
            )}
          </div>

          <div className="status-section">
            <h3>סטטוס לקוח</h3>
            <StatusIcon status={customer.status} size="large" />
          </div>

          <NextBestAction action={nextAction} />
        </div>

        {/* Bottom Section - Full Width Timeline/Calendar */}
        <div className="timeline-container">
          <div className="timeline-header">
            <h2>ציר זמן מסע הלקוח</h2>
            <div className="view-toggle">
              <button
                className={`toggle-btn ${viewMode === 'timeline' ? 'active' : ''}`}
                onClick={() => setViewMode('timeline')}
                title="ציר זמן"
              >
                <span>📅</span>
                ציר זמן
              </button>
              <button
                className={`toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                onClick={() => setViewMode('calendar')}
                title="לוח שנה"
              >
                <span>📆</span>
                לוח שנה
              </button>
            </div>
          </div>
          
          {viewMode === 'timeline' ? (
            <>
              <p className="timeline-subtitle">לחץ על כל אירוע לפרטים. ניתן להזיז ולזום באמצעות העכבר.</p>
              {journey.length > 0 ? (
                <DateTimeline events={journey} onEventClick={handleEventClick} />
              ) : (
                <div className="no-events">לא נמצאו אירועים ללקוח זה.</div>
              )}
            </>
          ) : (
            <>
              <p className="timeline-subtitle">לחץ על כל אירוע בלוח השנה לפרטים.</p>
              {journey.length > 0 ? (
                <EventCalendar events={journey} onEventClick={handleEventClick} />
              ) : (
                <div className="no-events">לא נמצאו אירועים ללקוח זה.</div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal event={selectedEvent} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default CustomerJourney;

