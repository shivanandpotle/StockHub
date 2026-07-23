import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import '../styles/products.css';
import { FiPlus, FiEdit, FiTrash2, FiX, FiCheckCircle } from 'react-icons/fi';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    sku: '',
    price: '',
    minimumStock: '10',
    currentQuantity: '0',
    description: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/api/products').catch(() => ({ data: [] })),
        api.get('/api/categories').catch(() => ({ data: [] }))
      ]);
      setProducts(Array.isArray(prodRes.data) ? prodRes.data : prodRes.data?.data || []);
      setCategories(Array.isArray(catRes.data) ? catRes.data : catRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load products or categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (product = null) => {
    setMessage(null);
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        category: typeof product.categoryId === 'object' ? product.categoryId?._id || product.categoryId?.id : product.categoryId || '',
        sku: product.sku || '',
        buyingPrice: product.buyingPrice !== undefined ? String(product.buyingPrice) : '',
        sellingPrice: product.sellingPrice !== undefined ? String(product.sellingPrice) : '',
        minimumStock: product.minimumStock !== undefined ? String(product.minimumStock) : '10',
        currentQuantity: product.quantity !== undefined ? String(product.quantity) : '0',
        description: product.description || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        category: categories.length > 0 ? (categories[0]._id || categories[0].id) : '',
        sku: `SKU-${Date.now().toString().slice(-6)}`,
        buyingPrice: '',
        sellingPrice: '',
        minimumStock: '10',
        currentQuantity: '0',
        description: ''
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const payload = {
        name: formData.name,
        categoryId: formData.category || (categories[0]?._id || categories[0]?.id),
        sku: formData.sku,
        buyingPrice: Number(formData.buyingPrice),
        sellingPrice: Number(formData.sellingPrice),
        minimumStock: Number(formData.minimumStock),
        quantity: Number(formData.currentQuantity),
        description: formData.description
      };

      if (editingProduct) {
        const id = editingProduct._id || editingProduct.id;
        await api.put(`/api/products/${id}`, payload);
        setMessage({ type: 'success', text: 'Product updated successfully' });
      } else {
        await api.post('/api/products', payload);
        setMessage({ type: 'success', text: 'Product created successfully' });
      }
      handleCloseModal();
      fetchData();
    } catch (err) {
      console.error('Error saving product:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save product' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      setMessage({ type: 'success', text: 'Product deleted successfully' });
      fetchData();
    } catch (err) {
      console.error('Error deleting product:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete product' });
    }
  };

  if (loading) {
    return <LoadingSpinner size={50} />;
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Product Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            View, add, edit, and monitor your catalog items
          </p>
        </div>
        <button className="add-btn" onClick={() => handleOpenModal()}>
          <FiPlus style={{ fontSize: '18px' }} />
          <span>Add Product</span>
        </button>
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

      <div className="table-container">
        {products.length === 0 ? (
          <p style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No products found. Click "Add Product" to get started.
          </p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Current Qty</th>
                <th>Min. Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const id = product._id || product.id;
                const catName = typeof product.category === 'object' ? product.category?.name : product.category || 'Uncategorized';
                return (
                  <tr key={id}>
                    <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{product.name}</td>
                    <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '13px' }}>{product.sku || 'N/A'}</td>
                    <td>{catName}</td>
                    <td style={{ fontWeight: '600', color: 'var(--success)' }}>
                      ${Number(product.sellingPrice || 0).toFixed(2)}
                    </td>
                    <td style={{ fontWeight: '700' }}>
                      <span style={{
                        color: product.quantity <= product.minimumStock ? 'var(--warning)' : 'var(--text-primary)'
                      }}>
                        {product.quantity !== undefined ? product.quantity : 0}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{product.minimumStock !== undefined ? product.minimumStock : 10}</td>
                    <td>
                      <div className="action-btns">
                        <button className="icon-btn" onClick={() => handleOpenModal(product)} title="Edit Product">
                          <FiEdit style={{ fontSize: '16px' }} />
                        </button>
                        <button className="icon-btn delete" onClick={() => handleDelete(id)} title="Delete Product">
                          <FiTrash2 style={{ fontSize: '16px' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-card fade-in">
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '20px' }}>
                <FiX />
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Product Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Wireless Noise-Canceling Headphones"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label htmlFor="sku">SKU Code *</label>
                  <input
                    type="text"
                    id="sku"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    placeholder="SKU-10020"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id || cat.id} value={cat._id || cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label htmlFor="buyingPrice">Buying Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    id="buyingPrice"
                    name="buyingPrice"
                    value={formData.buyingPrice}
                    onChange={handleChange}
                    placeholder="50.00"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="sellingPrice">Selling Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    id="sellingPrice"
                    name="sellingPrice"
                    value={formData.sellingPrice}
                    onChange={handleChange}
                    placeholder="99.99"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label htmlFor="currentQuantity">Initial Qty *</label>
                  <input
                    type="number"
                    id="currentQuantity"
                    name="currentQuantity"
                    value={formData.currentQuantity}
                    onChange={handleChange}
                    placeholder="50"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="minimumStock">Min. Stock *</label>
                  <input
                    type="number"
                    id="minimumStock"
                    name="minimumStock"
                    value={formData.minimumStock}
                    onChange={handleChange}
                    placeholder="10"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide product details, specs, or storage notes..."
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="add-btn" disabled={submitting}>
                  {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
