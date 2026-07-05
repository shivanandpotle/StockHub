import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#4361ee', '#7209b7', '#06d6a0', '#ffd166', '#ef476f', '#4cc9f0'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(15, 15, 35, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        padding: '12px 16px',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      }}>
        <p style={{ color: '#e8e8f0', fontWeight: '600', marginBottom: '4px', fontSize: '13px' }}>
          {payload[0].name}
        </p>
        <p style={{ color: payload[0].payload.fill || '#4361ee', fontSize: '13px', margin: '2px 0' }}>
          Count: <span style={{ fontWeight: '700' }}>{payload[0].value}</span>
        </p>
        {payload[0].payload.value !== undefined && (
          <p style={{ color: '#a0a0b8', fontSize: '12px', margin: '2px 0' }}>
            Value: ${Number(payload[0].payload.value).toLocaleString()}
          </p>
        )}
      </div>
    );
  }
  return null;
};

const CategoryPieChart = ({ data = [] }) => {
  return (
    <div className="chart-card">
      <h3 className="chart-card-title">Category Distribution</h3>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Tooltip content={<CustomTooltip />} />
          <Pie
            data={data}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            labelLine={{ stroke: '#a0a0b8', strokeWidth: 1 }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend 
            wrapperStyle={{ paddingTop: '16px', fontSize: '12px', color: '#a0a0b8' }}
            formatter={(value) => <span style={{ color: '#e8e8f0' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryPieChart;
