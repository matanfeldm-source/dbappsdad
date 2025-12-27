import React from 'react';
import './NextBestAction.css';

const NextBestAction = ({ action }) => {
  if (!action) {
    return (
      <div className="next-best-action">
        <h3>פעולה מומלצת הבאה</h3>
        <p className="no-action">אין פעולות ממתינות</p>
      </div>
    );
  }

  const priorityColors = {
    high: '#e74c3c',
    medium: '#f39c12',
    low: '#27ae60',
  };

  return (
    <div className="next-best-action">
      <h3>פעולה מומלצת הבאה</h3>
      <div className="action-header">
        <span 
          className="action-type"
          style={{ textTransform: 'capitalize' }}
        >
          {action.action_type?.replace('_', ' ')}
        </span>
        <span 
          className="action-priority"
          style={{ 
            backgroundColor: priorityColors[action.priority] || '#95a5a6',
            color: 'white',
          }}
        >
          {action.priority?.toUpperCase()}
        </span>
      </div>
      <p className="action-description">{action.action_description}</p>
      {action.recommended_date && (
        <p className="action-date">
          מומלץ: {new Date(action.recommended_date).toLocaleDateString('he-IL')}
        </p>
      )}
    </div>
  );
};

export default NextBestAction;

