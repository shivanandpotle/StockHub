import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import '../styles/products.css';
import { FiPlus, FiEdit, FiTrash2, FiX, FiLayers, FiCheckCircle } from 'react-icons/fi';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/categories');
      setCategories(Array.isArray(response.data) ? response.data : response.data?.data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (cat = null) => {
    setMessage(null);
    if (cat) {
      setEditingCategory(cat);
      setFormData({
        name: cat.name || '',
        description: cat.description || ''
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: ''
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
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
      if (editingCategory) {
        const id = editingCategory._id || editingCategory.id;
        await api.put(`/api/categories/${id}`, formData);
        setMessage({ type: 'success', text: 'Category updated successfully' });
      } else {
        await api.post('/api/categories', formData);
        setMessage({ type: 'success', text: 'Category created successfully' });
      }
      handleCloseModal();
      fetchCategories();
    } catch (err) {
      console.error('Error saving category:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save category' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? Products in this category may be affected.')) return;
    try {
      await api.delete(`/api/categories/${id}`);
      setMessage({ type: 'success', text: 'Category deleted successfully' });
      fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete category' });
    }
  };

  if (loading) {
    return <LoadingSpinner size={50} />;
  }

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
    marginTop: '16px'
  };

  const cardStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'var(--transition)',
    position: 'relative'
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Category Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Organize products into structured catalog categories
          </p>
        </div>
        <button className="add-btn" onClick={() => handleOpenModal()}>
          <FiPlus style={{ fontSize: '18px' }} />
          <span>Add Category</span>
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

      {categories.length === 0 ? (
        <div className="table-container" style={{ padding: '40px', textAlign: 'center' }}>
          <FiLayers style={{ fontSize: '48px', color: 'var(--text-muted)', marginBottom: '16px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No categories created yet. Click "Add Category" to create your first one.</p>
        </div>
      ) : (
        <div style={gridStyle}>
          {categories.map((cat) => {
            const id = cat._id || cat.id;
            return (
              <div 
                key={id} 
                style={cardStyle}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div style={{ 
                      width: '44px', height: '44px', borderRadius: 'var(--radius-md)', 
                      background: 'rgba(67, 97, 238, 0.15)', color: 'var(--accent-blue)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' 
                    }}>
                      <FiLayers />
                    </div>
                    <div className="action-btns">
                      <button className="icon-btn" onClick={() => handleOpenModal(cat)} title="Edit Category">
                        <FiEdit style={{ fontSize: '16px' }} />
                      </button>
                      <button className="icon-btn delete" onClick={() => handleDelete(id)} title="Delete Category">
                        <FiTrash2 style={{ fontSize: '16px' }} />
                      </button>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    {cat.name}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5', minHeight: '40px' }}>
                    {cat.description || 'No description provided for this category.'}
                  </p>
                </div>

                <div style={{ 
                  marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)'
                }}>
                  <span>ID: {String(id).slice(-6)}</span>
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: '600' }}>
                    {cat.productCount !== undefined ? `${cat.productCount} Products` : 'Active'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && createPortal(
        <div className="modal-overlay">
          <div className="modal-card fade-in">
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '20px' }}>
                <FiX />
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Category Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Electronics, Furniture, Office Supplies"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what types of items belong in this category..."
                  rows="4"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="add-btn" disabled={submitting}>
                  {submitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Categories;
