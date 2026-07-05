import React from 'react';
import { FiAlertTriangle, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const LowStockTable = ({ data = [] }) => {
  return (
    <div className="low-stock-section fade-in">
      <div className="chart-card-title">
        <FiAlertTriangle style={{ color: 'var(--warning)' }} />
        Low Stock & Out of Stock Alerts
      </div>
      
      {data.length === 0 ? (
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
          All products are well stocked! No alerts at this time.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="low-stock-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Current Qty</th>
                <th>Min Required</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => {
                const isOut = item.currentQuantity === 0 || item.status === 'Out of Stock';
                const isLow = !isOut && (item.currentQuantity <= item.minimumStock || item.status === 'Low Stock');
                const badgeClass = isOut ? 'out' : isLow ? 'low' : 'ok';
                const badgeText = isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock';
                const Icon = isOut ? FiXCircle : isLow ? FiAlertTriangle : FiCheckCircle;

                return (
                  <tr key={item._id || index}>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{item.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{item.category || item.categoryId?.name || 'Uncategorized'}</td>
                    <td style={{ fontWeight: 600, color: isOut ? 'var(--danger)' : isLow ? 'var(--warning)' : 'var(--success)' }}>
                      {item.currentQuantity ?? item.quantity ?? 0}
                    </td>
                    <td>{item.minimumStock ?? 10}</td>
                    <td>
                      <span className={`status-badge ${badgeClass}`}>
                        <Icon style={{ marginRight: '6px' }} />
                        {badgeText}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LowStockTable;
