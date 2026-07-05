import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
        <p style={{ color: '#06d6a0', fontSize: '13px', margin: '4px 0' }}>
          Stock Added: <span style={{ fontWeight: '700' }}>{payload[0]?.value || 0}</span>
        </p>
        <p style={{ color: '#ef476f', fontSize: '13px', margin: '4px 0' }}>
          Stock Removed: <span style={{ fontWeight: '700' }}>{payload[1]?.value || 0}</span>
        </p>
      </div>
    );
  }
  return null;
};

const MonthlyStockChart = ({ data = [] }) => {
  return (
    <div className="chart-card">
      <h3 className="chart-card-title">Monthly Stock Movement</h3>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorStockIn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06d6a0" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#06d6a0" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorStockOut" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef476f" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#ef476f" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="month" stroke="#a0a0b8" tick={{ fill: '#a0a0b8', fontSize: 12 }} />
          <YAxis stroke="#a0a0b8" tick={{ fill: '#a0a0b8', fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="stockIn" name="Stock Added" stroke="#06d6a0" strokeWidth={2} fillOpacity={1} fill="url(#colorStockIn)" />
          <Area type="monotone" dataKey="stockOut" name="Stock Removed" stroke="#ef476f" strokeWidth={2} fillOpacity={1} fill="url(#colorStockOut)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyStockChart;
