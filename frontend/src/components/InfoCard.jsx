import React from 'react';
import './InfoCard.css';

const InfoCard = ({ title, value, color, icon }) => {
  return (
    <div className="info-card" style={{ borderTopColor: color }}>
      <div className="info-card-header">
        {icon && <span className="info-card-icon">{icon}</span>}
        <h3 className="info-card-title">{title}</h3>
      </div>
      <div className="info-card-value" style={{ color: color }}>
        {value}
      </div>
    </div>
  );
};

export default InfoCard;

