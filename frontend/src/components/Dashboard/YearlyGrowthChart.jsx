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
        <p style={{ color: '#e8e8f0', fontWeight: '600', marginBottom: '8px', fontSize: '13px' }}>Year: {label}</p>
        <p style={{ color: '#4cc9f0', fontSize: '13px', margin: '4px 0' }}>
          Total Products: <span style={{ fontWeight: '700' }}>{payload[0]?.value || 0}</span>
        </p>
      </div>
    );
  }
  return null;
};

const YearlyGrowthChart = ({ data = [] }) => {
  return (
    <div className="chart-card">
      <h3 className="chart-card-title">Yearly Inventory Growth</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="year" stroke="#a0a0b8" tick={{ fill: '#a0a0b8', fontSize: 12 }} />
          <YAxis stroke="#a0a0b8" tick={{ fill: '#a0a0b8', fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
          <Bar dataKey="totalProducts" fill="#4361ee" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default YearlyGrowthChart;
