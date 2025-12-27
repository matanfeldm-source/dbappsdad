import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import './TechnicianMap.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const TechnicianMap = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all', 'underway', 'planned'

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      const response = await axios.get('/api/technicians/visits');
      setVisits(response.data);
    } catch (error) {
      console.error('Error fetching visits:', error);
      // Set default coordinates for demo if API fails
      setVisits([
        {
          visit_id: 'VISIT002',
          customer_id: 'CUST002',
          customer_name: 'Sarah Johnson',
          address: '456 Oak Ave, Los Angeles',
          technician_id: 'TECH002',
          technician_name: 'Lisa Martinez',
          visit_status: 'underway',
          visit_purpose: 'repair',
          latitude: 34.0522,
          longitude: -118.2437,
        },
        {
          visit_id: 'VISIT003',
          customer_id: 'CUST004',
          customer_name: 'Emily Davis',
          address: '321 Elm St, Houston',
          technician_id: 'TECH003',
          technician_name: 'James Taylor',
          visit_status: 'planned',
          visit_purpose: 'inspection',
          latitude: 29.7604,
          longitude: -95.3698,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Create custom icons for different technicians and statuses
  const createTechnicianIcon = (technicianId, status) => {
    const colors = {
      underway: '#e74c3c', // Red
      planned: '#3498db', // Blue
    };

    const techColors = {
      TECH001: '#e74c3c',
      TECH002: '#f39c12',
      TECH003: '#27ae60',
    };

    const color = status === 'underway' ? colors.underway : colors.planned;
    const techColor = techColors[technicianId] || '#95a5a6';

    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid ${techColor};
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">${technicianId.slice(-1)}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  const filteredVisits = selectedStatus === 'all' 
    ? visits 
    : visits.filter(v => v.visit_status === selectedStatus);

  // Group visits by technician
  const visitsByTechnician = filteredVisits.reduce((acc, visit) => {
    if (!acc[visit.technician_id]) {
      acc[visit.technician_id] = [];
    }
    acc[visit.technician_id].push(visit);
    return acc;
  }, {});

  // Calculate center of map (average of all coordinates)
  const center = visits.length > 0
    ? [
        visits.reduce((sum, v) => sum + (v.latitude || 0), 0) / visits.filter(v => v.latitude).length,
        visits.reduce((sum, v) => sum + (v.longitude || 0), 0) / visits.filter(v => v.longitude).length,
      ]
    : [39.8283, -98.5795]; // Center of USA

  if (loading) {
    return <div className="loading">טוען ביקורי טכנאים...</div>;
  }

  return (
    <div className="technician-map-page">
      <h1>מפת ביקורי טכנאים</h1>

      <div className="map-controls">
        <div className="filter-buttons">
          <button
            className={selectedStatus === 'all' ? 'active' : ''}
            onClick={() => setSelectedStatus('all')}
          >
            כל הביקורים
          </button>
          <button
            className={selectedStatus === 'underway' ? 'active' : ''}
            onClick={() => setSelectedStatus('underway')}
          >
            בתהליך (אדום)
          </button>
          <button
            className={selectedStatus === 'planned' ? 'active' : ''}
            onClick={() => setSelectedStatus('planned')}
          >
            מתוכנן (כחול)
          </button>
        </div>

        <div className="legend">
          <div className="legend-item">
            <span className="legend-icon" style={{ backgroundColor: '#e74c3c' }}></span>
            <span>ביקורים בתהליך</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon" style={{ backgroundColor: '#3498db' }}></span>
            <span>ביקורים מתוכננים</span>
          </div>
          <div className="legend-note">
            צבע הגבול מציין טכנאים שונים
          </div>
        </div>
      </div>

      <div className="map-container">
        {visits.length > 0 ? (
          <MapContainer
            center={center}
            zoom={4}
            style={{ height: '600px', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredVisits.map((visit) => {
              if (!visit.latitude || !visit.longitude) return null;
              return (
                <Marker
                  key={visit.visit_id}
                  position={[visit.latitude, visit.longitude]}
                  icon={createTechnicianIcon(visit.technician_id, visit.visit_status)}
                >
                  <Popup>
                    <div className="popup-content">
                      <h3>{visit.customer_name}</h3>
                      <p><strong>כתובת:</strong> {visit.address}</p>
                      <p><strong>טכנאי:</strong> {visit.technician_name} ({visit.technician_id})</p>
                      <p><strong>סטטוס:</strong> {visit.visit_status}</p>
                      <p><strong>מטרה:</strong> {visit.visit_purpose}</p>
                      {visit.estimated_duration && (
                        <p><strong>משך זמן משוער:</strong> {visit.estimated_duration} דקות</p>
                      )}
                      {visit.notes && (
                        <p><strong>הערות:</strong> {visit.notes}</p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        ) : (
          <div className="no-visits">
            לא נמצאו ביקורי טכנאים. אנא ודא שקואורדינטות זמינות במסד הנתונים.
          </div>
        )}
      </div>

      <div className="technician-summary">
        <h2>ביקורים לפי טכנאי</h2>
        <div className="technician-list">
          {Object.entries(visitsByTechnician).map(([techId, techVisits]) => (
            <div key={techId} className="technician-card">
              <h3>{techVisits[0].technician_name} ({techId})</h3>
              <p>{techVisits.length} {techVisits.length === 1 ? 'ביקור' : 'ביקורים'}</p>
              <ul>
                {techVisits.map((visit) => (
                  <li key={visit.visit_id}>
                    {visit.customer_name} - {visit.visit_purpose} ({visit.visit_status})
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TechnicianMap;

