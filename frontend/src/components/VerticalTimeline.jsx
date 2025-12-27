import React, { useState, useRef } from 'react';
import './VerticalTimeline.css';

const VerticalTimeline = ({ events, onEventClick }) => {
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = normal, higher = zoomed in
  const timelineRef = useRef(null);
  const containerRef = useRef(null);

  // Sort events by time, most recent first
  const sortedEvents = [...events].sort((a, b) => {
    return new Date(b.event_time) - new Date(a.event_time);
  });

  // Calculate date range
  const dateRange = sortedEvents.length > 0 ? {
    min: new Date(sortedEvents[sortedEvents.length - 1].event_time),
    max: new Date(sortedEvents[0].event_time),
  } : null;

  const totalDays = dateRange ? Math.ceil((dateRange.max - dateRange.min) / (1000 * 60 * 60 * 24)) : 0;

  // Calculate relative position for an event (0 to 1)
  const getRelativePosition = (eventTime) => {
    if (!dateRange || totalDays === 0) return 0.5;
    const eventDate = new Date(eventTime);
    const daysFromMin = (eventDate - dateRange.min) / (1000 * 60 * 60 * 24);
    return 1 - (daysFromMin / totalDays); // Reverse because most recent is at top
  };

  // Handle zoom
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 5)); // Max 5x zoom
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.25)); // Min 0.25x zoom
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  };

  // Get event icon
  const getEventIcon = (eventType) => {
    const icons = {
      call: '📞',
      installation: '🔧',
      visit: '👷',
      website: '🌐',
      digital: '💬',
    };
    return icons[eventType] || '●';
  };

  // Get event color
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

  // Get event shape
  const getEventShape = (eventType) => {
    const shapes = {
      call: 'circle',
      installation: 'square',
      visit: 'triangle',
      website: 'diamond',
      digital: 'star',
    };
    return shapes[eventType] || 'circle';
  };

  // Format date time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('he-IL'),
      time: date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
      full: date.toLocaleString('he-IL'),
    };
  };

  // Calculate spacing between events based on actual time differences
  const getEventSpacing = (index) => {
    if (sortedEvents.length <= 1) return 0;
    if (index === 0) return 0;
    
    const currentEvent = new Date(sortedEvents[index].event_time);
    const previousEvent = new Date(sortedEvents[index - 1].event_time);
    const daysDiff = (previousEvent - currentEvent) / (1000 * 60 * 60 * 24);
    
    // Base spacing for events on the same day
    const baseSpacing = 2.5;
    
    // For events spaced over time, use logarithmic scaling to compress large gaps
    // This ensures events close together stay visible while long gaps don't take up too much space
    let spacingFactor = 1;
    if (daysDiff > 0) {
      // Logarithmic scale: 1 day = 1.2x, 7 days = 1.5x, 30 days = 2x, 365 days = 3x
      spacingFactor = 1 + Math.log10(daysDiff + 1) * 0.5;
      spacingFactor = Math.min(spacingFactor, 4); // Cap at 4x for very long periods
    }
    
    // Apply zoom level to spacing
    return baseSpacing * spacingFactor * zoomLevel;
  };

  // Format date range for display
  const formatDateRange = () => {
    if (!dateRange) return '';
    return `${dateRange.min.toLocaleDateString('he-IL')} - ${dateRange.max.toLocaleDateString('he-IL')}`;
  };

  return (
    <div className="timeline-wrapper">
      {/* Timeline Controls */}
      <div className="timeline-controls">
        <div className="timeline-control-group">
          <button 
            className="timeline-control-btn" 
            onClick={handleZoomOut}
            title="הקטן"
            disabled={zoomLevel <= 0.25}
          >
            −
          </button>
          <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
          <button 
            className="timeline-control-btn" 
            onClick={handleZoomIn}
            title="הגדל"
            disabled={zoomLevel >= 5}
          >
            +
          </button>
          <button 
            className="timeline-control-btn" 
            onClick={handleResetZoom}
            title="אפס"
          >
            ↺
          </button>
        </div>
        {dateRange && (
          <div className="timeline-date-range">
            <span>{formatDateRange()}</span>
            <span className="timeline-event-count">{sortedEvents.length} אירועים</span>
          </div>
        )}
      </div>

      {/* Scrollable Timeline Container */}
      <div 
        ref={containerRef}
        className="timeline-scroll-container"
        style={{ '--zoom-level': zoomLevel }}
      >
        <div className="vertical-timeline" ref={timelineRef}>
          {sortedEvents.map((event, index) => {
            const shape = getEventShape(event.event_type);
            const color = getEventColor(event);
            const icon = getEventIcon(event.event_type);
            const dateInfo = formatDateTime(event.event_time);
            const relativePos = getRelativePosition(event.event_time);
            const spacing = index > 0 ? getEventSpacing(index) : 0;

            return (
              <div
                key={index}
                className={`timeline-item timeline-${shape}`}
                onClick={() => onEventClick && onEventClick(event)}
                style={{ 
                  '--event-color': color,
                  marginTop: index > 0 ? `${spacing}rem` : '0',
                }}
                data-position={relativePos}
              >
                <div className="timeline-marker">
                  <div 
                    className={`marker-shape marker-${shape}`} 
                    style={shape === 'triangle' ? { borderBottomColor: color } : { backgroundColor: color }}
                  >
                    <span className="marker-icon">{icon}</span>
                  </div>
                </div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <h4 className="timeline-title">{event.event_title}</h4>
                    <div className="timeline-date-group">
                      <span className="timeline-date">{dateInfo.date}</span>
                      <span className="timeline-time">{dateInfo.time}</span>
                    </div>
                  </div>
                  {event.description && (
                    <p className="timeline-description">{event.description}</p>
                  )}
                  <div className="timeline-meta">
                    {event.status && (
                      <span className="timeline-status">סטטוס: {event.status}</span>
                    )}
                    {event.call_duration && (
                      <span className="timeline-duration">משך: {event.call_duration}ש</span>
                    )}
                    {event.channel && (
                      <span className="timeline-channel">ערוץ: {event.channel}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VerticalTimeline;
