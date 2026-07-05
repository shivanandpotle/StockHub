import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import '../styles/products.css';
import { FiArrowUpRight, FiArrowDownRight, FiCheckCircle, FiClock } from 'react-icons/fi';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('IN');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    reason: ''
  });

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const [prodRes, histRes] = await Promise.all([
        api.get('/api/products').catch(() => ({ data: [] })),
        api.get('/api/inventory/history').catch(async () => {
          return await api.get('/api/inventory/transactions').catch(() => ({ data: [] }));
        })
      ]);
      const prodList = Array.isArray(prodRes.data) ? prodRes.data : prodRes.data?.data || [];
      setProducts(prodList);
      if (prodList.length > 0 && !formData.productId) {
        setFormData((prev) => ({ ...prev, productId: prodList[0]._id || prodList[0].id }));
      }
      setHistory(Array.isArray(histRes.data) ? histRes.data : histRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.productId || !formData.quantity || Number(formData.quantity) <= 0) {
      setMessage({ type: 'error', text: 'Please select a valid product and enter a positive quantity.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      const endpoint = activeTab === 'IN' ? '/api/inventory/stock-in' : '/api/inventory/stock-out';
      const payload = {
        productId: formData.productId,
        quantity: Number(formData.quantity),
        reason: formData.reason || (activeTab === 'IN' ? 'Stock Replenishment' : 'Order Fulfillment')
      };

      await api.post(endpoint, payload);
      setMessage({
        type: 'success',
        text: `Successfully processed stock ${activeTab === 'IN' ? 'addition' : 'removal'} of ${formData.quantity} units.`
      });
      setFormData((prev) => ({ ...prev, quantity: '', reason: '' }));
      fetchInventoryData();
    } catch (err) {
      console.error('Error updating inventory:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update stock. Please check product availability.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size={50} />;
  }

  const tabContainerStyle = {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px'
  };

  const tabBtnStyle = (isActive, type) => ({
    flex: 1,
    padding: '16px 24px',
    borderRadius: 'var(--radius-lg)',
    border: `1px solid ${isActive ? (type === 'IN' ? 'var(--success)' : 'var(--danger)') : 'var(--border-color)'}`,
    background: isActive ? (type === 'IN' ? 'rgba(6, 214, 160, 0.15)' : 'rgba(239, 71, 111, 0.15)') : 'var(--bg-card)',
    color: isActive ? (type === 'IN' ? 'var(--success)' : 'var(--danger)') : 'var(--text-secondary)',
    fontWeight: '700',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    cursor: 'pointer',
    transition: 'var(--transition)'
  });

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Inventory Control</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Record incoming stock shipments and outgoing product adjustments
          </p>
        </div>
      </div>

      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '20px',
          background: message.type === 'success' ? 'rgba(6, 214, 160, 0.15)' : 'rgba(239, 71, 111, 0.15)',
          border: `1px solid ${message.type === 'success' ? 'rgba(6, 214, 160, 0.3)' : 'rgba(239, 71, 111, 0.3)'}`,
          color: message.type === 'success' ? '#06d6a0' : '#ef476f',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px'
        }}>
          {message.type === 'success' && <FiCheckCircle style={{ fontSize: '18px' }} />}
          <span>{message.text}</span>
        </div>
      )}

      <div style={tabContainerStyle}>
        <button
          type="button"
          style={tabBtnStyle(activeTab === 'IN', 'IN')}
          onClick={() => { setActiveTab('IN'); setMessage(null); }}
        >
          <FiArrowUpRight style={{ fontSize: '22px' }} />
          <span>Stock In (Add Inventory)</span>
        </button>

        <button
          type="button"
          style={tabBtnStyle(activeTab === 'OUT', 'OUT')}
          onClick={() => { setActiveTab('OUT'); setMessage(null); }}
        >
          <FiArrowDownRight style={{ fontSize: '22px' }} />
          <span>Stock Out (Remove Inventory)</span>
        </button>
      </div>

      <div className="chart-card" style={{ marginBottom: '32px' }}>
        <h3 className="chart-card-title">
          {activeTab === 'IN' ? 'Record Stock Replenishment' : 'Record Stock Out / Dispatch'}
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label htmlFor="productId" style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                Select Product *
              </label>
              <select
                id="productId"
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                required
              >
                <option value="">Choose Product from Catalog</option>
                {products.map((p) => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.name} (Current: {p.currentQuantity !== undefined ? p.currentQuantity : 0} units)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="quantity" style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                Quantity to {activeTab === 'IN' ? 'Add' : 'Remove'} *
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                min="1"
                placeholder="e.g. 25"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reason" style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
              Reason / Transaction Reference
            </label>
            <input
              type="text"
              id="reason"
              name="reason"
              placeholder={activeTab === 'IN' ? 'e.g. Supplier Shipment #84920' : 'e.g. Sales Order #10492 / Damaged Goods'}
              value={formData.reason}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button
              type="submit"
              className="add-btn"
              style={{
                background: activeTab === 'IN' ? 'var(--gradient-success)' : 'var(--gradient-danger)',
                padding: '12px 32px'
              }}
              disabled={submitting || products.length === 0}
            >
              {submitting ? 'Processing...' : `Confirm Stock ${activeTab === 'IN' ? 'In' : 'Out'}`}
            </button>
          </div>
        </form>
      </div>

      <div className="chart-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <FiClock style={{ color: 'var(--accent-blue)', fontSize: '20px' }} />
          <h3 className="chart-card-title" style={{ margin: 0 }}>Recent Transaction History</h3>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          {history.length === 0 ? (
            <p style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
              No inventory transactions recorded yet.
            </p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Product Name</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Reason / Reference</th>
                  <th>Performed By</th>
                </tr>
              </thead>
              <tbody>
                {history.map((tx, idx) => {
                  const txType = tx.type || tx.transactionType || 'IN';
                  const isPositive = txType === 'IN' || txType === 'STOCK_IN';
                  const prodName = typeof tx.product === 'object' ? tx.product?.name : tx.productName || tx.product || 'Unknown Product';
                  const userName = typeof tx.user === 'object' ? tx.user?.name : tx.userName || 'Admin';
                  const dateStr = tx.createdAt || tx.date ? new Date(tx.createdAt || tx.date).toLocaleString() : 'Just now';

                  return (
                    <tr key={tx._id || tx.id || idx}>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{dateStr}</td>
                      <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{prodName}</td>
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '700',
                          background: isPositive ? 'rgba(6, 214, 160, 0.15)' : 'rgba(239, 71, 111, 0.15)',
                          color: isPositive ? 'var(--success)' : 'var(--danger)'
                        }}>
                          {isPositive ? <FiArrowUpRight /> : <FiArrowDownRight />}
                          {isPositive ? 'STOCK IN' : 'STOCK OUT'}
                        </span>
                      </td>
                      <td style={{ fontWeight: '700', color: isPositive ? 'var(--success)' : 'var(--danger)' }}>
                        {isPositive ? '+' : '-'}{tx.quantity || 0}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{tx.reason || tx.notes || 'Standard Adjustment'}</td>
                      <td style={{ color: 'var(--text-primary)', fontSize: '13px' }}>{userName}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inventory;
