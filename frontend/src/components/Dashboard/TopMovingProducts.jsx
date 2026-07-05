import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(15, 15, 35, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        padding: '12px 16px',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      }}>
        <p style={{ color: '#e8e8f0', fontWeight: '600', marginBottom: '8px', fontSize: '13px' }}>{label}</p>
        <p style={{ color: '#7209b7', fontSize: '13px', margin: '4px 0' }}>
          Stock Removed: <span style={{ fontWeight: '700' }}>{payload[0]?.value || 0}</span> units
        </p>
      </div>
    );
  }
  return null;
};

const TopMovingProducts = ({ data = [] }) => {
  return (
    <div className="chart-card">
      <h3 className="chart-card-title">Top Moving Products (Stock Out)</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart layout="vertical" data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis type="number" stroke="#a0a0b8" tick={{ fill: '#a0a0b8', fontSize: 12 }} />
          <YAxis dataKey="name" type="category" width={110} stroke="#a0a0b8" tick={{ fill: '#a0a0b8', fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
          <Bar dataKey="totalOut" fill="#7209b7" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopMovingProducts;
