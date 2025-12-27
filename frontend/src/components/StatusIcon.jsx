import React from 'react';
import './StatusIcon.css';

const StatusIcon = ({ status, size = 'medium' }) => {
  const statusConfig = {
    low: { color: '#27ae60', label: 'נמוכה', icon: '✓' },
    normal: { color: '#f39c12', label: 'רגילה', icon: '○' },
    urgent: { color: '#e74c3c', label: 'דחופה', icon: '!' },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.normal;

  return (
    <div 
      className={`status-icon status-${status?.toLowerCase()} status-${size}`}
      style={{ backgroundColor: config.color }}
      title={config.label}
    >
      <span className="status-icon-text">{config.icon}</span>
      <span className="status-label">{config.label}</span>
    </div>
  );
};

export default StatusIcon;

