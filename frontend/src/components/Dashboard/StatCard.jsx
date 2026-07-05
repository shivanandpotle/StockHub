import React from 'react';

const StatCard = ({ title, value, icon: IconComponent, color = 'rgba(67, 97, 238, 0.15)', prefix = '', suffix = '' }) => {
  const formattedValue = typeof value === 'number' 
    ? value.toLocaleString() 
    : !isNaN(Number(value)) && value !== null && value !== undefined 
      ? Number(value).toLocaleString() 
      : value || '0';

  const iconContainerStyle = {
    background: color,
    color: typeof color === 'string' && color.startsWith('rgba') ? '#ffffff' : color,
  };

  return (
    <div className="stat-card">
      <div className="stat-card-icon" style={iconContainerStyle}>
        {IconComponent && <IconComponent />}
      </div>
      <div>
        <div className="stat-card-value">{prefix}{formattedValue}{suffix}</div>
        <div className="stat-card-title">{title}</div>
      </div>
    </div>
  );
};

export default StatCard;
