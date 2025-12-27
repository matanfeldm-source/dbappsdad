import React, { useMemo, useState } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/he';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './EventCalendar.css';

moment.locale('he');

const localizer = momentLocalizer(moment);

const EventCalendar = ({ events, onEventClick }) => {
  // Use string for year view since Views.YEAR might not be available in all versions
  const YEAR_VIEW = 'year';
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());

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

  // Transform events to calendar format
  const calendarEvents = useMemo(() => {
    return events.map((event, index) => {
      const eventDate = new Date(event.event_time);
      const color = getEventColor(event);
      
      return {
        id: index,
        title: event.event_title || event.event_type,
        start: eventDate,
        end: new Date(eventDate.getTime() + 60 * 60 * 1000), // 1 hour duration
        resource: event,
        eventColor: color,
      };
    });
  }, [events]);

  // Custom event component
  const EventComponent = ({ event }) => {
    const eventData = event.resource;
    const icon = getEventIcon(eventData.event_type);
    const color = event.eventColor;

    return (
      <div
        className="calendar-event"
        style={{
          backgroundColor: color,
          color: 'white',
          padding: '2px 4px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: '500',
          border: `2px solid ${color}`,
        }}
        title={eventData.description || eventData.event_title}
      >
        <span style={{ marginRight: '4px' }}>{icon}</span>
        <span>{eventData.event_title || eventData.event_type}</span>
      </div>
    );
  };

  // Handle event selection
  const handleSelectEvent = (event) => {
    if (event.resource && onEventClick) {
      onEventClick(event.resource);
    }
  };

  // Handle navigation
  const handleNavigate = (action) => {
    if (action === 'PREV') {
      if (view === YEAR_VIEW) {
        setDate(moment(date).subtract(1, 'year').toDate());
      } else if (view === Views.MONTH) {
        setDate(moment(date).subtract(1, 'month').toDate());
      } else if (view === Views.WEEK) {
        setDate(moment(date).subtract(1, 'week').toDate());
      } else if (view === Views.DAY) {
        setDate(moment(date).subtract(1, 'day').toDate());
      }
    } else if (action === 'NEXT') {
      if (view === YEAR_VIEW) {
        setDate(moment(date).add(1, 'year').toDate());
      } else if (view === Views.MONTH) {
        setDate(moment(date).add(1, 'month').toDate());
      } else if (view === Views.WEEK) {
        setDate(moment(date).add(1, 'week').toDate());
      } else if (view === Views.DAY) {
        setDate(moment(date).add(1, 'day').toDate());
      }
    } else if (action === 'TODAY') {
      setDate(new Date());
    }
  };

  // Handle view change
  const handleViewChange = (newView) => {
    setView(newView);
  };

  // Format label based on current view
  const formatLabel = () => {
    if (view === YEAR_VIEW) {
      return moment(date).format('YYYY');
    } else if (view === Views.MONTH) {
      return moment(date).format('MMMM YYYY');
    } else if (view === Views.WEEK) {
      const weekStart = moment(date).startOf('week');
      const weekEnd = moment(date).endOf('week');
      return `${weekStart.format('D MMM')} - ${weekEnd.format('D MMM YYYY')}`;
    } else if (view === Views.DAY) {
      return moment(date).format('D MMMM YYYY');
    }
    return moment(date).format('MMMM YYYY');
  };

  // Custom toolbar component
  const CustomToolbar = ({ onNavigate }) => {
    const handleLabelClick = () => {
      // Toggle between month and year view when label is clicked
      if (view === Views.MONTH || view === Views.WEEK || view === Views.DAY || view === Views.AGENDA) {
        setView(YEAR_VIEW);
      } else if (view === YEAR_VIEW) {
        setView(Views.MONTH);
      }
    };

    return (
      <div className="rbc-toolbar">
        <span className="rbc-btn-group">
          <button type="button" onClick={() => handleNavigate('PREV')}>
            ‹ {messages.previous}
          </button>
          <button type="button" onClick={() => handleNavigate('TODAY')}>
            {messages.today}
          </button>
          <button type="button" onClick={() => handleNavigate('NEXT')}>
            {messages.next} ›
          </button>
        </span>

        <span 
          className="rbc-toolbar-label calendar-label-clickable" 
          onClick={handleLabelClick}
          title={view === YEAR_VIEW ? 'לחץ להצגת תצוגת חודש' : 'לחץ להצגת תצוגת שנה'}
        >
          {formatLabel()}
        </span>

        <span className="rbc-btn-group">
          <button 
            type="button" 
            className={view === Views.MONTH ? 'rbc-active' : ''}
            onClick={() => handleViewChange(Views.MONTH)}
          >
            {messages.month}
          </button>
          <button 
            type="button" 
            className={view === Views.WEEK ? 'rbc-active' : ''}
            onClick={() => handleViewChange(Views.WEEK)}
          >
            {messages.week}
          </button>
          <button 
            type="button" 
            className={view === Views.DAY ? 'rbc-active' : ''}
            onClick={() => handleViewChange(Views.DAY)}
          >
            {messages.day}
          </button>
          <button 
            type="button" 
            className={view === Views.AGENDA ? 'rbc-active' : ''}
            onClick={() => handleViewChange(Views.AGENDA)}
          >
            {messages.agenda}
          </button>
        </span>
      </div>
    );
  };

  // Hebrew messages
  const messages = {
    allDay: 'כל היום',
    previous: 'הקודם',
    next: 'הבא',
    today: 'היום',
    month: 'חודש',
    week: 'שבוע',
    day: 'יום',
    agenda: 'יומן',
    date: 'תאריך',
    time: 'שעה',
    event: 'אירוע',
    noEventsInRange: 'אין אירועים בטווח זה',
    showMore: (total) => `+ עוד ${total}`,
  };

  // Determine available views - include year view if it's the current view
  const availableViews = [Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA];
  if (view === YEAR_VIEW) {
    availableViews.push(YEAR_VIEW);
  }

  return (
    <div className="event-calendar-wrapper">
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        onSelectEvent={handleSelectEvent}
        components={{
          event: EventComponent,
          toolbar: CustomToolbar,
        }}
        messages={messages}
        culture="he"
        rtl={true}
        view={view === YEAR_VIEW ? Views.MONTH : view} // Use MONTH view as fallback if YEAR not supported
        onView={(newView) => {
          // If trying to set year view, handle it manually
          if (newView !== YEAR_VIEW) {
            handleViewChange(newView);
          }
        }}
        date={date}
        onNavigate={handleNavigate}
        views={availableViews.filter(v => v !== YEAR_VIEW)} // Don't pass YEAR_VIEW to Calendar component
      />
      {/* Custom year view overlay when YEAR_VIEW is active */}
      {view === YEAR_VIEW && (
        <div className="year-view-overlay">
          <div className="year-view-content">
            <h3>{moment(date).format('YYYY')}</h3>
            <div className="year-view-months">
              {Array.from({ length: 12 }, (_, i) => {
                const monthDate = moment(date).month(i);
                const monthEvents = calendarEvents.filter(event => {
                  const eventDate = moment(event.start);
                  return eventDate.month() === i && eventDate.year() === moment(date).year();
                });
                return (
                  <div
                    key={i}
                    className="year-view-month"
                    onClick={() => {
                      setDate(monthDate.toDate());
                      setView(Views.MONTH);
                    }}
                  >
                    <div className="year-view-month-name">{monthDate.format('MMMM')}</div>
                    <div className="year-view-month-events">{monthEvents.length} אירועים</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCalendar;
