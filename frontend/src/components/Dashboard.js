import React, { useState, useEffect, useCallback } from 'react';
import API from '../api';

const EMPTY_FORM = {
  itemName: '',
  description: '',
  type: 'Lost',
  location: '',
  date: '',
  contactInfo: '',
};

function Dashboard({ onLogout }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [searchName, setSearchName] = useState('');
  const [searchType, setSearchType] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Fetch all items
  const fetchItems = useCallback(async () => {
    try {
      const res = await API.get('/api/items');
      setItems(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load items.');
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (editId) {
        await API.put(`/api/items/${editId}`, form);
        setSuccess('Item updated successfully!');
      } else {
        await API.post('/api/items', form);
        setSuccess('Item reported successfully!');
      }
      setForm(EMPTY_FORM);
      setEditId(null);
      setShowForm(false);
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setForm({
      itemName: item.itemName,
      description: item.description,
      type: item.type,
      location: item.location,
      date: item.date ? item.date.substring(0, 10) : '',
      contactInfo: item.contactInfo,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await API.delete(`/api/items/${id}`);
      setSuccess('Item deleted successfully!');
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const params = new URLSearchParams();
      if (searchName) params.append('name', searchName);
      if (searchType) params.append('type', searchType);
      const res = await API.get(`/api/items/search?${params.toString()}`);
      setItems(res.data);
    } catch (err) {
      setError('Search failed.');
    }
  };

  const handleClearSearch = () => {
    setSearchName('');
    setSearchType('');
    fetchItems();
  };

  const handleCancel = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(false);
    setError('');
  };

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand">
          <span>🔍</span> Lost & Found
        </div>
        <div className="nav-right">
          <span className="nav-user">👤 {user.name || 'User'}</span>
          <button onClick={onLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-body">
        {/* Alerts */}
        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        {/* Search Bar */}
        <div className="section">
          <h3>🔎 Search Items</h3>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search by item name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
            <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
              <option value="">All Types</option>
              <option value="Lost">Lost</option>
              <option value="Found">Found</option>
            </select>
            <button type="submit" className="btn-primary">Search</button>
            <button type="button" onClick={handleClearSearch} className="btn-secondary">
              Clear
            </button>
          </form>
        </div>

        {/* Add / Edit Form Toggle */}
        <div className="section">
          <div className="section-header">
            <h3>{editId ? '✏️ Edit Item' : '➕ Report an Item'}</h3>
            {!showForm && (
              <button onClick={() => setShowForm(true)} className="btn-primary">
                + Report Item
              </button>
            )}
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="item-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Item Name *</label>
                  <input
                    type="text"
                    name="itemName"
                    value={form.itemName}
                    onChange={handleChange}
                    placeholder="e.g. Blue Backpack"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Type *</label>
                  <select name="type" value={form.type} onChange={handleChange} required>
                    <option value="Lost">Lost</option>
                    <option value="Found">Found</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the item..."
                  rows={3}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. Library, Block A"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Contact Info *</label>
                <input
                  type="text"
                  name="contactInfo"
                  value={form.contactInfo}
                  onChange={handleChange}
                  placeholder="Phone number or email"
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : editId ? 'Update Item' : 'Report Item'}
                </button>
                <button type="button" onClick={handleCancel} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Items List */}
        <div className="section">
          <h3>📋 All Reported Items ({items.length})</h3>
          {items.length === 0 ? (
            <div className="empty-state">No items found. Be the first to report one!</div>
          ) : (
            <div className="items-grid">
              {items.map((item) => (
                <div key={item._id} className={`item-card ${item.type === 'Lost' ? 'lost' : 'found'}`}>
                  <div className="item-badge">{item.type}</div>
                  <h4>{item.itemName}</h4>
                  <p className="item-desc">{item.description}</p>
                  <div className="item-meta">
                    <span>📍 {item.location}</span>
                    <span>📅 {new Date(item.date).toLocaleDateString()}</span>
                    <span>📞 {item.contactInfo}</span>
                    <span>👤 {item.postedBy?.name || 'Unknown'}</span>
                  </div>
                  {/* Show edit/delete only for own items */}
                  {item.postedBy?._id === user.id && (
                    <div className="item-actions">
                      <button onClick={() => handleEdit(item)} className="btn-edit">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(item._id)} className="btn-delete">
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
