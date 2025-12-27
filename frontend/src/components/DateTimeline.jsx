import React, { useEffect, useRef } from 'react';
import { Timeline } from 'vis-timeline/standalone';
import './DateTimeline.css';

const DateTimeline = ({ events, onEventClick }) => {
  const timelineContainerRef = useRef(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    if (!timelineContainerRef.current || events.length === 0) return;

    // Sort events by time
    const sortedEvents = [...events].sort((a, b) => {
      return new Date(a.event_time) - new Date(b.event_time);
    });

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

    // Transform events to vis-timeline format
    const items = sortedEvents.map((event, index) => {
      const color = getEventColor(event);
      const icon = getEventIcon(event.event_type);
      
      // Create HTML content with icon - for point items, just show the icon
      const content = `<span style="font-size: 1.5em; display: block; text-align: center; line-height: 1;">${icon}</span>`;
      
      // Create tooltip with full details
      const tooltip = `${event.event_title || event.event_type}\n${event.description || ''}\n${new Date(event.event_time).toLocaleString('he-IL')}`;
      
      return {
        id: String(index),
        content: content,
        start: new Date(event.event_time),
        type: 'point',
        className: `event-${event.event_type}`,
        style: `background-color: ${color}; border-color: ${color}; border-width: 3px;`,
        title: tooltip,
      };
    });

    // Calculate date range with padding
    const minDate = sortedEvents[0] ? new Date(sortedEvents[0].event_time) : new Date();
    const maxDate = sortedEvents[sortedEvents.length - 1] 
      ? new Date(sortedEvents[sortedEvents.length - 1].event_time)
      : new Date();
    
    // Add padding to date range
    const dateRange = maxDate - minDate;
    const padding = dateRange * 0.1; // 10% padding on each side
    
    // Create timeline options
    const options = {
      start: new Date(minDate.getTime() - padding),
      end: new Date(maxDate.getTime() + padding),
      zoomMin: 1000 * 60 * 60, // 1 hour
      zoomMax: 1000 * 60 * 60 * 24 * 365 * 2, // 2 years
      stack: false,
      showCurrentTime: false,
      orientation: 'top',
      editable: false,
      selectable: true,
      multiselect: false,
      moveable: true, // Enable panning by dragging
      zoomable: true, // Enable zoom with mouse wheel
      format: {
        minorLabels: {
          minute: 'HH:mm',
          hour: 'HH:mm',
          weekday: 'ddd D',
          day: 'D',
          week: 'w',
          month: 'MMM',
        },
        majorLabels: {
          minute: 'ddd D MMMM',
          hour: 'ddd D MMMM',
          weekday: 'MMMM YYYY',
          day: 'MMMM YYYY',
          week: 'MMMM YYYY',
          month: 'YYYY',
        },
      },
    };

    // Create timeline instance
    const timeline = new Timeline(timelineContainerRef.current, items, options);
    timelineRef.current = timeline;

    // Fit timeline to show all items
    timeline.fit();

    // Handle click/select events - this fires when an item is selected
    timeline.on('select', (properties) => {
      if (properties.items && properties.items.length > 0) {
        const selectedId = properties.items[0];
        const selectedIndex = typeof selectedId === 'string' ? parseInt(selectedId) : selectedId;
        if (!isNaN(selectedIndex) && sortedEvents[selectedIndex] && onEventClick) {
          onEventClick(sortedEvents[selectedIndex]);
        }
      }
    });

    // Handle direct click on items - this fires on any click, even if item is not selectable
    timeline.on('click', (properties) => {
      if (properties.item !== null && properties.item !== undefined) {
        const clickedId = properties.item;
        const clickedIndex = typeof clickedId === 'string' ? parseInt(clickedId) : clickedId;
        if (!isNaN(clickedIndex) && sortedEvents[clickedIndex] && onEventClick) {
          onEventClick(sortedEvents[clickedIndex]);
        }
      }
    });

    // Cleanup
    return () => {
      if (timeline) {
        timeline.destroy();
      }
    };
  }, [events, onEventClick]);

  return (
    <div className="date-timeline-wrapper">
      <div ref={timelineContainerRef} className="vis-timeline-container" />
    </div>
  );
};

export default DateTimeline;
